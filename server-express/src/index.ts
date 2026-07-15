import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import apiRoutes from "./routes/api.js"

const app = express()
const PORT = process.env.PORT || 3001

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

app.listen(PORT, async () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
})
