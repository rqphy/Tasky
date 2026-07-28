import "dotenv/config"
import { createServer } from "node:http"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"
import apiRoutes from "./routes/api.js"
import { socketAuthMiddleware } from "./middleware/socketAuth.js"
import { registerProjectRoomHandlers } from "./sockets/projectRooms.js"
import {
	setSocketServer,
	registerUserSocket,
	unregisterUserSocket,
} from "./lib/socket.js"
import { createRouteHandler } from "uploadthing/express"
import { uploadRouter } from "./lib/uploadthing.js"
import { deleteExpiredNotifications } from "./lib/notifications.js"

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000

async function runNotificationCleanup() {
	try {
		const deleted = await deleteExpiredNotifications()
		if (deleted > 0) {
			console.log(`Deleted ${deleted} expired notification(s)`)
		}
	} catch (error) {
		console.error("Notification cleanup error:", error)
	}
}

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	},
})

setSocketServer(io)
io.use(socketAuthMiddleware)

io.on("connection", (socket) => {
	const userId = socket.data.userId
	registerUserSocket(userId, socket.id)
	console.log("Socket connected:", socket.id, "user:", userId)

	socket.on("disconnect", () => {
		unregisterUserSocket(userId, socket.id)
	})
})

registerProjectRoomHandlers(io)

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true, // Allow cookies
	}),
)
app.use(express.json())
app.use(cookieParser())

app.use(
	"/api/uploadthing",
	createRouteHandler({ router: uploadRouter }),
)

app.use("/api", apiRoutes)

httpServer.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	void runNotificationCleanup()
	setInterval(() => {
		void runNotificationCleanup()
	}, CLEANUP_INTERVAL_MS)
})
