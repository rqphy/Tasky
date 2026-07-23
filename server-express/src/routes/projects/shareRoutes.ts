import express from "express"
import crypto from "crypto"
import { prisma } from "../../lib/db.js"
import { updateShareLinkSchema } from "../../lib/validation.js"
import {
	verifyProjectMember,
	verifyProjectOwner,
} from "../../lib/projectAccess.js"
import { buildShareUrl } from "../../lib/share.js"

const router = express.Router()

router.get("/:id/share", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params

		const memberCheck = await verifyProjectMember(id, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
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

export default router
