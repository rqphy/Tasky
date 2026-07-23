import express from "express"
import crypto from "crypto"
import { prisma } from "../../lib/db.js"
import { createInviteSchema } from "../../lib/validation.js"
import { verifyProjectOwner } from "../../lib/projectAccess.js"
import { buildInviteUrl } from "../../lib/invite.js"
import { sendInviteEmail } from "../../lib/email/index.js"

const router = express.Router()

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

router.post("/:id/invites", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = createInviteSchema.parse(req.body)
		const email = validatedData.email.toLowerCase().trim()

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			const isOwner = ownerCheck.project.ownerId === existingUser.id
			const isMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId: existingUser.id,
						projectId: id,
					},
				},
			})

			if (isOwner || isMember) {
				return res.status(409).json({
					error: "This user is already a member of the project",
				})
			}
		}

		const token = crypto.randomBytes(32).toString("hex")
		const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS)

		const invite = await prisma.projectInvite.upsert({
			where: {
				projectId_email: {
					projectId: id,
					email,
				},
			},
			create: {
				projectId: id,
				email,
				role: validatedData.role,
				token,
				invitedById: userId,
				expiresAt,
			},
			update: {
				token,
				role: validatedData.role,
				invitedById: userId,
				expiresAt,
				status: "PENDING",
				acceptedAt: null,
			},
		})

		const inviter = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true },
		})

		const emailResult = await sendInviteEmail({
			to: email,
			projectName: ownerCheck.project.name,
			projectEmoji: ownerCheck.project.emoji,
			inviterName: inviter?.name ?? "Someone",
			role: validatedData.role,
			acceptUrl: buildInviteUrl(token),
		})

		res.status(201).json({ ...invite, emailSent: emailResult.sent })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create invite error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.get("/:id/invites", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const invites = await prisma.projectInvite.findMany({
			where: { projectId: id, status: "PENDING" },
			select: {
				id: true,
				projectId: true,
				email: true,
				role: true,
				status: true,
				expiresAt: true,
				createdAt: true,
				invitedBy: {
					select: { id: true, name: true, email: true },
				},
			},
			orderBy: { createdAt: "desc" },
		})

		res.status(200).json(invites)
	} catch (error) {
		console.error("List invites error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:id/invites/:inviteId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id, inviteId } = req.params

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const invite = await prisma.projectInvite.findUnique({
			where: { id: inviteId },
		})

		if (!invite || invite.projectId !== id) {
			return res.status(404).json({ error: "Invite not found" })
		}

		await prisma.projectInvite.update({
			where: { id: inviteId },
			data: { status: "REVOKED" },
		})

		res.status(204).send()
	} catch (error) {
		console.error("Revoke invite error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
