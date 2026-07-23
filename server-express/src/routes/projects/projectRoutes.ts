import express from "express"
import { prisma } from "../../lib/db.js"
import {
	createProjectSchema,
	updateProjectSchema,
} from "../../lib/validation.js"
import { projectWithMembersInclude } from "../../lib/projectIncludes.js"
import { getProjectMemberUserIds } from "../../lib/projectAccess.js"
import { emitToUsersExceptUser } from "../../lib/socket.js"
import { SOCKET_EVENTS } from "../../lib/socketEvents.js"

const router = express.Router()

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
				members: {
					create: {
						userId,
						role: "OWNER",
					},
				},
			},
			include: projectWithMembersInclude,
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

		const memberUserIds = await getProjectMemberUserIds(id)
		emitToUsersExceptUser(
			memberUserIds,
			userId,
			SOCKET_EVENTS.PROJECT_UPDATED,
			{
				projectId: id,
				name: updatedProject.name,
				emoji: updatedProject.emoji,
				updatedAt: updatedProject.updatedAt,
			},
		)

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

		const memberUserIds = await getProjectMemberUserIds(id)

		await prisma.project.delete({
			where: { id },
		})

		emitToUsersExceptUser(
			memberUserIds,
			userId,
			SOCKET_EVENTS.PROJECT_DELETED,
			{ projectId: id },
		)

		res.status(204).send()
	} catch (error) {
		console.error("Delete project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
