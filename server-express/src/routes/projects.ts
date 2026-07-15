import express from "express"
import crypto from "crypto"
import { prisma } from "../lib/db.js"
import {
	createProjectSchema,
	updateProjectSchema,
	createColumnSchema,
	updateColumnSchema,
	reorderColumnsSchema,
	createTaskSchema,
	updateTaskSchema,
	moveTaskSchema,
	createCommentSchema,
	updateShareLinkSchema,
	createInviteSchema,
} from "../lib/validation.js"
import { authMiddleware } from "../middleware/auth.js"
import { projectWithMembersInclude } from "../lib/projectIncludes.js"
import { buildShareUrl } from "../lib/share.js"
import { buildInviteUrl } from "../lib/invite.js"
import { sendInviteEmail } from "../lib/email/index.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", async (req, res) => {
	try {
		const userId = req.user!.userId

		const projects = await prisma.project.findMany({
			where: {
				OR: [{ ownerId: userId }, { members: { some: { userId } } }],
			},
			orderBy: { updatedAt: "desc" },
		})

		res.status(200).json(projects)
	} catch (error) {
		console.error("List projects error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/", async (req, res) => {
	try {
		const userId = req.user!.userId
		const validatedData = createProjectSchema.parse(req.body)

		const project = await prisma.project.create({
			data: {
				name: validatedData.name,
				emoji: validatedData.emoji ?? "📋",
				ownerId: userId,
			},
		})

		await prisma.projectMember.create({
			data: {
				userId: userId,
				projectId: project.id,
				role: "OWNER",
			},
		})

		res.status(201).json(project)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.get("/:id", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params

		const project = await prisma.project.findUnique({
			where: { id },
			include: projectWithMembersInclude,
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		const isOwner = project.ownerId === userId
		const isMember = project.members.some((m) => m.userId === userId)

		if (!isOwner && !isMember) {
			return res.status(403).json({ error: "Access denied" })
		}

		res.status(200).json(project)
	} catch (error) {
		console.error("Get project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:id", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = updateProjectSchema.parse(req.body)

		const project = await prisma.project.findUnique({
			where: { id },
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		if (project.ownerId !== userId) {
			return res
				.status(403)
				.json({ error: "Only the owner can update this project" })
		}

		const updatedProject = await prisma.project.update({
			where: { id },
			data: validatedData,
		})

		res.status(200).json(updatedProject)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:id", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params

		const project = await prisma.project.findUnique({
			where: { id },
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		if (project.ownerId !== userId) {
			return res
				.status(403)
				.json({ error: "Only the owner can delete this project" })
		}

		await prisma.project.delete({
			where: { id },
		})

		res.status(204).send()
	} catch (error) {
		console.error("Delete project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.get("/:id/members", async (req, res) => {
	try {
		const { id } = req.params

		const members = await prisma.projectMember.findMany({
			where: { projectId: id },
			include: {
				user: {
					select: { id: true, name: true, email: true },
				},
			},
		})

		res.status(200).json(members)
	} catch (error) {
		console.error("Get project members error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

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

async function verifyProjectAccess(
	projectId: string,
	userId: string,
): Promise<
	| { error: string; status: number }
	| {
			project: NonNullable<
				Awaited<ReturnType<typeof prisma.project.findUnique>>
			>
	  }
> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		include: { members: { where: { userId } } },
	})
	if (!project) return { error: "Project not found", status: 404 }

	const isOwner = project.ownerId === userId
	const isMember = project.members.some((m) => m.userId === userId)

	if (!isOwner && !isMember) {
		return { error: "Access denied", status: 403 }
	}
	return { project }
}

router.get("/:id/share", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params

		const accessCheck = await verifyProjectAccess(id, userId)
		if ("error" in accessCheck) {
			return res
				.status(accessCheck.status)
				.json({ error: accessCheck.error })
		}

		const shareToken = await prisma.projectShareToken.findUnique({
			where: { projectId: id },
		})

		if (!shareToken || !shareToken.isActive) {
			return res.status(200).json({ isActive: false })
		}

		res.status(200).json({
			isActive: true,
			url: buildShareUrl(shareToken.token),
		})
	} catch (error) {
		console.error("Get share link error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:id/share", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const { isActive } = updateShareLinkSchema.parse(req.body)

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		if (!isActive) {
			const existing = await prisma.projectShareToken.findUnique({
				where: { projectId: id },
			})

			if (existing) {
				await prisma.projectShareToken.update({
					where: { projectId: id },
					data: { isActive: false },
				})
			}

			return res.status(200).json({ isActive: false })
		}

		const shareToken = await prisma.projectShareToken.upsert({
			where: { projectId: id },
			create: {
				projectId: id,
				token: crypto.randomBytes(32).toString("hex"),
				isActive: true,
			},
			update: { isActive: true },
		})

		res.status(200).json({
			isActive: true,
			url: buildShareUrl(shareToken.token),
		})
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update share link error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

async function verifyProjectOwner(
	projectId: string,
	userId: string,
): Promise<
	| { error: string; status: number }
	| {
			project: NonNullable<
				Awaited<ReturnType<typeof prisma.project.findUnique>>
			>
	  }
> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	})
	if (!project) return { error: "Project not found", status: 404 }
	if (project.ownerId !== userId)
		return { error: "Only the owner can manage columns", status: 403 }
	return { project }
}

async function verifyProjectMember(
	projectId: string,
	userId: string,
): Promise<
	| { error: string; status: number }
	| {
			project: NonNullable<
				Awaited<ReturnType<typeof prisma.project.findUnique>>
			>
	  }
> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		include: { members: { where: { userId } } },
	})
	if (!project) return { error: "Project not found", status: 404 }

	const isOwner = project.ownerId === userId
	const isMember = project.members.some(
		(m) => m.role === "OWNER" || m.role === "MEMBER",
	)

	if (!isOwner && !isMember) {
		return { error: "Access denied", status: 403 }
	}
	return { project }
}

router.post("/:id/columns", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = createColumnSchema.parse(req.body)

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const lastColumn = await prisma.column.findFirst({
			where: { projectId: id },
			orderBy: { position: "desc" },
		})
		const position = lastColumn ? lastColumn.position + 1 : 1.0

		const column = await prisma.column.create({
			data: {
				projectId: id,
				name: validatedData.name,
				color: validatedData.color ?? "#6366f1",
				position,
			},
		})

		res.status(201).json(column)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:id/columns/:columnId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id, columnId } = req.params
		const validatedData = updateColumnSchema.parse(req.body)

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		})

		if (!column || column.projectId !== id) {
			return res.status(404).json({ error: "Column not found" })
		}

		const updatedColumn = await prisma.column.update({
			where: { id: columnId },
			data: validatedData,
		})

		res.status(200).json(updatedColumn)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:id/columns/:columnId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id, columnId } = req.params

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		})

		if (!column || column.projectId !== id) {
			return res.status(404).json({ error: "Column not found" })
		}

		await prisma.column.delete({
			where: { id: columnId },
		})

		res.status(204).send()
	} catch (error) {
		console.error("Delete column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/:id/columns/reorder", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = reorderColumnsSchema.parse(req.body)

		const ownerCheck = await verifyProjectOwner(id, userId)
		if ("error" in ownerCheck) {
			return res
				.status(ownerCheck.status)
				.json({ error: ownerCheck.error })
		}

		const columns = await prisma.column.findMany({
			where: { projectId: id },
			select: { id: true },
		})

		const existingIds = new Set(columns.map((c) => c.id))
		const allBelongToProject = validatedData.columnIds.every((cid) =>
			existingIds.has(cid),
		)

		if (!allBelongToProject) {
			return res.status(400).json({
				error: "Some column IDs do not belong to this project",
			})
		}

		await prisma.$transaction(
			validatedData.columnIds.map((columnId, index) =>
				prisma.column.update({
					where: { id: columnId },
					data: { position: index + 1 },
				}),
			),
		)

		res.status(200).json({ message: "Columns reordered" })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Reorder columns error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

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
		})

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
					select: { id: true, name: true, email: true },
				},
				comments: {
					orderBy: { createdAt: "asc" },
					include: {
						author: {
							select: { id: true, name: true, email: true },
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
		if (
			validatedData.columnId &&
			validatedData.columnId !== task.columnId
		) {
			const newColumn = await prisma.column.findUnique({
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
		})

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
					select: { id: true, name: true, email: true },
				},
			},
		})

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
