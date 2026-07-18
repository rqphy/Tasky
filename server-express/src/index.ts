import "dotenv/config"
import { createServer } from "node:http"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"
import apiRoutes from "./routes/api.js"
import { socketAuthMiddleware } from "./middleware/socketAuth.js"
import { registerProjectRoomHandlers } from "./sockets/projectRooms.js"

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	},
})

io.use(socketAuthMiddleware)

io.on("connection", (socket) => {
	console.log("Socket connected:", socket.id, "user:", socket.data.userId)
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

app.use("/api", apiRoutes)

httpServer.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
})
