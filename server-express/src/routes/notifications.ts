import express from "express"
import { prisma } from "../lib/db.js"
import {
	toNotificationResponse,
	getNotificationRetentionCutoff,
} from "../lib/notifications.js"
import {
	notificationListQuerySchema,
	notificationReadAllQuerySchema,
} from "../lib/validation.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId } = notificationListQuerySchema.parse(req.query)

		const notifications = await prisma.notification.findMany({
			where: {
				userId,
				createdAt: { gte: getNotificationRetentionCutoff() },
				...(projectId ? { projectId } : {}),
			},
			orderBy: { createdAt: "desc" },
		})

		res.json(notifications.map(toNotificationResponse))
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("List notifications error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/read-all", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { projectId } = notificationReadAllQuerySchema.parse(req.query)

		await prisma.notification.updateMany({
			where: {
				userId,
				isRead: false,
				...(projectId ? { projectId } : {}),
			},
			data: { isRead: true },
		})

		res.json({ success: true })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Mark all notifications read error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:notificationId/read", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { notificationId } = req.params

		const notification = await prisma.notification.findFirst({
			where: { id: notificationId, userId },
		})

		if (!notification) {
			return res.status(404).json({ error: "Notification not found" })
		}

		const updated = await prisma.notification.update({
			where: { id: notificationId },
			data: { isRead: true },
		})

		res.json(toNotificationResponse(updated))
	} catch (error) {
		console.error("Mark notification read error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
