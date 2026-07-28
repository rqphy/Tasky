import express from "express"
import { prisma } from "../../lib/db.js"
import { createCommentSchema } from "../../lib/validation.js"
import { verifyProjectMember } from "../../lib/projectAccess.js"
import { dispatchTaskNotifications } from "../../lib/notifications.js"
import { userPublicSelect } from "../../lib/userHelpers.js"

const router = express.Router()

router.post("/:projectId/tasks/:taskId/comments", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId, taskId } = req.params
		const validatedData = createCommentSchema.parse(req.body)

		const memberCheck = await verifyProjectMember(projectId, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: { column: true },
		})

		if (!task) {
			return res.status(404).json({ error: "Task not found" })
		}

		if (task.column.projectId !== projectId) {
			return res.status(404).json({ error: "Task not found" })
		}

		const comment = await prisma.comment.create({
			data: {
				content: validatedData.content,
				taskId,
				authorId: userId,
			},
			include: {
				author: {
					select: userPublicSelect,
				},
			},
		})

		try {
			await dispatchTaskNotifications(
				{
					type: "TASK_COMMENT",
					taskId,
					actorId: userId,
				},
				{
					projectId,
					actorName: comment.author.name,
					taskId,
					taskTitle: task.title,
				},
			)
		} catch (err) {
			console.error("Notification dispatch error:", err)
		}

		res.status(201).json(comment)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create comment error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete(
	"/:projectId/tasks/:taskId/comments/:commentId",
	async (req, res) => {
		try {
			const userId = req.user!.userId
			const { projectId, taskId, commentId } = req.params

			const memberCheck = await verifyProjectMember(projectId, userId)
			if ("error" in memberCheck) {
				return res
					.status(memberCheck.status)
					.json({ error: memberCheck.error })
			}

			const task = await prisma.task.findUnique({
				where: { id: taskId },
				include: { column: true },
			})

			if (!task) {
				return res.status(404).json({ error: "Task not found" })
			}

			if (task.column.projectId !== projectId) {
				return res.status(404).json({ error: "Task not found" })
			}

			const comment = await prisma.comment.findUnique({
				where: { id: commentId },
			})

			if (!comment || comment.taskId !== taskId) {
				return res.status(404).json({ error: "Comment not found" })
			}

			if (comment.authorId !== userId) {
				return res
					.status(403)
					.json({ error: "Only the author can delete this comment" })
			}

			await prisma.comment.delete({
				where: { id: commentId },
			})

			res.status(204).send()
		} catch (error) {
			console.error("Delete comment error:", error)
			res.status(500).json({ error: "Internal server error" })
		}
	},
)

export default router
