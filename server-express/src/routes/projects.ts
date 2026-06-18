import express from "express"
import { prisma } from "../lib/db.js"
import { createProjectSchema, updateProjectSchema } from "../lib/validation.js"
import { authMiddleware } from "../middleware/auth.js"

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
			include: {
				members: {
					include: {
						user: {
							select: { id: true, name: true, email: true },
						},
					},
				},
			},
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
		})

		res.status(200).json(members)
	} catch (error) {
		console.error("Get project members error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
