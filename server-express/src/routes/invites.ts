import express from "express"
import { prisma } from "../lib/db.js"
import { acceptInviteSchema } from "../lib/validation.js"
import { authMiddleware } from "../middleware/auth.js"
import { emitToProjectExceptUser } from "../lib/socket.js"
import { SOCKET_EVENTS } from "../lib/socketEvents.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/validate", async (req, res) => {
	try {
		const token = req.query.token

		if (!token || typeof token !== "string") {
			return res
				.status(400)
				.json({ valid: false, reason: "Token is required" })
		}

		const invite = await prisma.projectInvite.findUnique({
			where: { token },
			include: {
				project: {
					select: { id: true, name: true, emoji: true },
				},
			},
		})

		if (!invite || invite.status !== "PENDING") {
			return res.status(200).json({
				valid: false,
				reason: "Invalid or expired invite",
			})
		}

		if (invite.expiresAt < new Date()) {
			return res.status(200).json({
				valid: false,
				reason: "Invalid or expired invite",
			})
		}

		res.status(200).json({
			valid: true,
			project: invite.project,
			email: invite.email,
			role: invite.role,
			expiresAt: invite.expiresAt,
		})
	} catch (error) {
		console.error("Validate invite error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/accept", async (req, res) => {
	try {
		const userId = req.user!.userId
		const validatedData = acceptInviteSchema.parse(req.body)

		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return res.status(401).json({ error: "User not found" })
		}

		const invite = await prisma.projectInvite.findUnique({
			where: { token: validatedData.token },
			include: {
				project: {
					select: { id: true, name: true, emoji: true, ownerId: true },
				},
			},
		})

		if (
			!invite ||
			invite.status !== "PENDING" ||
			invite.expiresAt < new Date()
		) {
			return res
				.status(404)
				.json({ error: "Invalid or expired invite" })
		}

		if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
			return res.status(403).json({
				error: "This invite was sent to a different email address",
			})
		}

		const existingMember = await prisma.projectMember.findUnique({
			where: {
				userId_projectId: {
					userId,
					projectId: invite.projectId,
				},
			},
		})

		if (existingMember || invite.project.ownerId === userId) {
			return res.status(409).json({
				error: "You are already a member of this project",
			})
		}

		const member = await prisma.$transaction(async (tx) => {
			const createdMember = await tx.projectMember.create({
				data: {
					userId,
					projectId: invite.projectId,
					role: invite.role,
				},
				include: {
					user: {
						select: { id: true, name: true, email: true },
					},
				},
			})

			await tx.projectInvite.update({
				where: { id: invite.id },
				data: {
					status: "ACCEPTED",
					acceptedAt: new Date(),
				},
			})

			return createdMember
		})

		emitToProjectExceptUser(
			invite.projectId,
			userId,
			SOCKET_EVENTS.MEMBER_JOINED,
			{
				projectId: invite.projectId,
				member,
			},
		)

		res.status(200).json({
			member,
			project: {
				id: invite.project.id,
				name: invite.project.name,
				emoji: invite.project.emoji,
			},
		})
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Accept invite error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
