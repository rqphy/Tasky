import express from "express"
import { prisma } from "../../lib/db.js"
import { transferOwnershipSchema } from "../../lib/validation.js"
import { emitToProjectExceptUser } from "../../lib/socket.js"
import { SOCKET_EVENTS } from "../../lib/socketEvents.js"
import { userPublicSelect } from "../../lib/userHelpers.js"

const router = express.Router()

router.get("/:id/members", async (req, res) => {
	try {
		const { id } = req.params

		const members = await prisma.projectMember.findMany({
			where: { projectId: id },
			include: {
				user: {
					select: userPublicSelect,
				},
			},
		})

		res.status(200).json(members)
	} catch (error) {
		console.error("Get project members error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:id/members/:userId", async (req, res) => {
	try {
		const requesterId = req.user!.userId
		const { id: projectId, userId: targetUserId } = req.params

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		const membership = await prisma.projectMember.findUnique({
			where: {
				userId_projectId: {
					userId: targetUserId,
					projectId,
				},
			},
		})

		if (!membership) {
			return res.status(404).json({ error: "Member not found" })
		}

		const isSelfLeave = requesterId === targetUserId
		const isRequesterOwner = project.ownerId === requesterId

		if (isSelfLeave) {
			if (isRequesterOwner) {
				return res.status(400).json({
					error: "Transfer ownership before leaving the project",
				})
			}
		} else {
			if (!isRequesterOwner) {
				return res.status(403).json({ error: "Access denied" })
			}
		}

		await prisma.$transaction([
			prisma.task.updateMany({
				where: {
					column: { projectId },
					assigneeId: targetUserId,
				},
				data: { assigneeId: null },
			}),
			prisma.projectMember.delete({
				where: {
					userId_projectId: {
						userId: targetUserId,
						projectId,
					},
				},
			}),
		])

		emitToProjectExceptUser(
			projectId,
			requesterId,
			SOCKET_EVENTS.MEMBER_REMOVED,
			{ projectId, userId: targetUserId },
		)

		res.status(204).send()
	} catch (error) {
		console.error("Remove member error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/:id/transfer-ownership", async (req, res) => {
	try {
		const requesterId = req.user!.userId
		const { id: projectId } = req.params
		const { userId: newOwnerId } = transferOwnershipSchema.parse(req.body)

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		if (project.ownerId !== requesterId) {
			return res.status(403).json({
				error: "Only the owner can transfer ownership",
			})
		}

		if (newOwnerId === requesterId) {
			return res.status(400).json({
				error: "Cannot transfer ownership to yourself",
			})
		}

		const targetMembership = await prisma.projectMember.findUnique({
			where: {
				userId_projectId: {
					userId: newOwnerId,
					projectId,
				},
			},
		})

		if (!targetMembership) {
			return res.status(404).json({
				error: "Member not found",
			})
		}

		const memberCount = await prisma.projectMember.count({
			where: { projectId },
		})

		if (memberCount < 2) {
			return res.status(400).json({
				error: "Add another member before transferring ownership",
			})
		}

		const updatedProject = await prisma.$transaction(async (tx) => {
			await tx.project.update({
				where: { id: projectId },
				data: { ownerId: newOwnerId },
			})

			await tx.projectMember.update({
				where: {
					userId_projectId: {
						userId: newOwnerId,
						projectId,
					},
				},
				data: { role: "OWNER" },
			})

			await tx.projectMember.update({
				where: {
					userId_projectId: {
						userId: requesterId,
						projectId,
					},
				},
				data: { role: "MEMBER" },
			})

			return tx.project.findUniqueOrThrow({
				where: { id: projectId },
				select: {
					id: true,
					name: true,
					emoji: true,
					ownerId: true,
				},
			})
		})

		res.status(200).json(updatedProject)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Transfer ownership error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
