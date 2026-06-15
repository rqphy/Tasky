import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import apiRoutes from "./routes/api.js"
import { prisma } from "./lib/db.js"

dotenv.config()
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

// Test db connection
async function insertTestUser() {
	const email = `test-${Date.now()}@example.com`
	const user = await prisma.user.create({
		data: {
			name: "Test User",
			email,
			password: "not-a-real-hash",
		},
	})
	console.log("✅ Inserted user:", user)

	const count = await prisma.user.count()
	console.log(`📊 Total users in db: ${count}`)
}

app.listen(PORT, async () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	try {
		await insertTestUser()
	} catch (err) {
		console.error("❌ DB test failed:", err)
	}
})
