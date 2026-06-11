import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { PrismaClient } from "./generated/client.js"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

dotenv.config()

const prisma = new PrismaClient({
	adapter: new PrismaBetterSqlite3({
		url: process.env.DATABASE_URL || "file:../tasky.db",
	}),
})
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

// Test route
app.get("/health", (req, res) => {
	res.json({ status: "ok", message: "Server is running" })
})

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

// Auth routes (create in next step)
// app.use('/api/auth', authRoutes)

app.listen(PORT, async () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	try {
		await insertTestUser()
	} catch (err) {
		console.error("❌ DB test failed:", err)
	}
})
