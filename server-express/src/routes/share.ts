import express from "express"
import { prisma } from "../lib/db.js"
import { projectBoardInclude } from "../lib/projectIncludes.js"

const router = express.Router()

router.get("/:token", async (req, res) => {
	try {
		const { token } = req.params

		const shareToken = await prisma.projectShareToken.findUnique({
			where: { token },
		})

		if (!shareToken || !shareToken.isActive) {
			return res.status(404).json({ error: "Share link not found" })
		}

		const project = await prisma.project.findUnique({
			where: { id: shareToken.projectId },
			include: projectBoardInclude,
		})

		if (!project) {
			return res.status(404).json({ error: "Project not found" })
		}

		res.status(200).json(project)
	} catch (error) {
		console.error("Get shared project error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
