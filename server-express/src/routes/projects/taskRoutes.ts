import express from "express"
import { prisma } from "../../lib/db.js"
import {
	createTaskSchema,
	updateTaskSchema,
	moveTaskSchema,
} from "../../lib/validation.js"
import { verifyProjectMember } from "../../lib/projectAccess.js"
import { emitToProjectExceptUser } from "../../lib/socket.js"
import { SOCKET_EVENTS } from "../../lib/socketEvents.js"
import { boardTaskInclude } from "../../lib/socketPayloads.js"
import { dispatchTaskNotifications } from "../../lib/notifications.js"
import { userPublicSelect } from "../../lib/userHelpers.js"

const router = express.Router()

router.post("/:projectId/tasks", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId } = req.params
		const validatedData = createTaskSchema.parse(req.body)

		const memberCheck = await verifyProjectMember(projectId, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		// Verify columnId belongs to project
		const column = await prisma.column.findUnique({
			where: { id: validatedData.columnId },
		})

		if (!column || column.projectId !== projectId) {
			return res.status(400).json({ error: "Invalid column ID" })
		}

		// Calculate position
		const lastTask = await prisma.task.findFirst({
			where: { columnId: validatedData.columnId },
			orderBy: { position: "desc" },
		})
		const position = lastTask ? lastTask.position + 1 : 1.0

		const task = await prisma.task.create({
			data: {
				columnId: validatedData.columnId,
				title: validatedData.title,
				description: validatedData.description,
				assigneeId: validatedData.assigneeId,
				label: validatedData.label,
				priority: validatedData.priority ?? "MEDIUM",
				position,
			},
			include: boardTaskInclude,
		})

		emitToProjectExceptUser(projectId, userId, SOCKET_EVENTS.TASK_CREATED, {
			projectId,
			task,
		})

		if (validatedData.assigneeId) {
			try {
				const actor = await prisma.user.findUnique({
					where: { id: userId },
					select: { name: true },
				})
				await dispatchTaskNotifications(
					{
						type: "TASK_ASSIGNED",
						taskId: task.id,
						assigneeId: validatedData.assigneeId,
						actorId: userId,
					},
					{
						projectId,
						actorName: actor?.name ?? "Someone",
						taskId: task.id,
						taskTitle: task.title,
					},
				)
			} catch (err) {
				console.error("Notification dispatch error:", err)
			}
		}

		res.status(201).json(task)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create task error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.get("/:projectId/tasks/:taskId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId, taskId } = req.params

		const memberCheck = await verifyProjectMember(projectId, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				column: true,
				assignee: {
					select: userPublicSelect,
				},
				comments: {
					orderBy: { createdAt: "asc" },
					include: {
						author: {
							select: userPublicSelect,
						},
					},
				},
			},
		})

		if (!task) {
			return res.status(404).json({ error: "Task not found" })
		}

		// Verify task's column belongs to project
		if (task.column.projectId !== projectId) {
			return res.status(404).json({ error: "Task not found" })
		}

		res.status(200).json(task)
	} catch (error) {
		console.error("Get task error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:projectId/tasks/:taskId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId, taskId } = req.params
		const validatedData = updateTaskSchema.parse(req.body)

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

		// Verify task's column belongs to project
		if (task.column.projectId !== projectId) {
			return res.status(404).json({ error: "Task not found" })
		}

		// If columnId is being changed, verify new column belongs to project
		let updateData: any = { ...validatedData }
		let newColumn: Awaited<
			ReturnType<typeof prisma.column.findUnique>
		> = null
		if (
			validatedData.columnId &&
			validatedData.columnId !== task.columnId
		) {
			newColumn = await prisma.column.findUnique({
				where: { id: validatedData.columnId },
			})

			if (!newColumn || newColumn.projectId !== projectId) {
				return res.status(400).json({ error: "Invalid column ID" })
			}

			// Recalculate position in new column
			const lastTask = await prisma.task.findFirst({
				where: { columnId: validatedData.columnId },
				orderBy: { position: "desc" },
			})
			updateData.position = lastTask ? lastTask.position + 1 : 1.0
		}

		if (validatedData.assigneeId) {
			const assigneeMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId: validatedData.assigneeId,
						projectId,
					},
				},
			})

			if (!assigneeMember) {
				return res
					.status(400)
					.json({ error: "Assignee is not a project member" })
			}
		}

		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: updateData,
			include: boardTaskInclude,
		})

		emitToProjectExceptUser(projectId, userId, SOCKET_EVENTS.TASK_UPDATED, {
			projectId,
			task: updatedTask,
		})

		const assigneeChanged =
			validatedData.assigneeId !== undefined &&
			validatedData.assigneeId !== task.assigneeId &&
			validatedData.assigneeId
		const columnChanged =
			validatedData.columnId &&
			validatedData.columnId !== task.columnId

		if (assigneeChanged || columnChanged) {
			try {
				const actor = await prisma.user.findUnique({
					where: { id: userId },
					select: { name: true },
				})
				const actorName = actor?.name ?? "Someone"
				const notifContext = {
					projectId,
					actorName,
					taskId,
					taskTitle: updatedTask.title,
				}

				if (assigneeChanged) {
					await dispatchTaskNotifications(
						{
							type: "TASK_ASSIGNED",
							taskId,
							assigneeId: validatedData.assigneeId!,
							actorId: userId,
						},
						notifContext,
					)
				}

				if (columnChanged && newColumn) {
					await dispatchTaskNotifications(
						{
							type: "TASK_STATUS_CHANGED",
							taskId,
							actorId: userId,
						},
						{
							...notifContext,
							oldColumnName: task.column.name,
							newColumnName: newColumn.name,
						},
					)
				}
			} catch (err) {
				console.error("Notification dispatch error:", err)
			}
		}

		res.status(200).json(updatedTask)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update task error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:projectId/tasks/:taskId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId, taskId } = req.params

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

		// Verify task's column belongs to project
		if (task.column.projectId !== projectId) {
			return res.status(404).json({ error: "Task not found" })
		}

		await prisma.task.delete({
			where: { id: taskId },
		})

		emitToProjectExceptUser(projectId, userId, SOCKET_EVENTS.TASK_DELETED, {
			projectId,
			taskId,
		})

		res.status(204).send()
	} catch (error) {
		console.error("Delete task error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/:projectId/tasks/:taskId/move", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId, taskId } = req.params
		const validatedData = moveTaskSchema.parse(req.body)

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

		const column = await prisma.column.findUnique({
			where: { id: validatedData.columnId },
		})

		if (!column || column.projectId !== projectId) {
			return res.status(400).json({ error: "Invalid column ID" })
		}

		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				columnId: validatedData.columnId,
				position: validatedData.position,
			},
		})

		emitToProjectExceptUser(projectId, userId, SOCKET_EVENTS.TASK_MOVED, {
			projectId,
			taskId: updatedTask.id,
			columnId: updatedTask.columnId,
			position: updatedTask.position,
		})

		if (validatedData.columnId !== task.columnId) {
			try {
				const actor = await prisma.user.findUnique({
					where: { id: userId },
					select: { name: true },
				})
				await dispatchTaskNotifications(
					{
						type: "TASK_STATUS_CHANGED",
						taskId,
						actorId: userId,
					},
					{
						projectId,
						actorName: actor?.name ?? "Someone",
						taskId,
						taskTitle: task.title,
						oldColumnName: task.column.name,
						newColumnName: column.name,
					},
				)
			} catch (err) {
				console.error("Notification dispatch error:", err)
			}
		}

		res.status(200).json(updatedTask)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Move task error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
