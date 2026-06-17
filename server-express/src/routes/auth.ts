import express from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db.js"
import { registerSchema, loginSchema } from "../lib/validation.js"
import {
	generateAccessToken,
	generateRefreshToken,
	getRefreshTokenExpiryDate,
} from "../lib/jwt.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

async function createTokensForUser(userId: string) {
	const accessToken = generateAccessToken(userId)
	const refreshToken = generateRefreshToken()
	const expiresAt = getRefreshTokenExpiryDate()

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId,
			expiresAt,
		},
	})

	return { accessToken, refreshToken }
}

router.post("/register", async (req, res) => {
	try {
		const validatedData = registerSchema.parse(req.body)

		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		})

		if (existingUser) {
			return res.status(400).json({ error: "Email already registered" })
		}

		const hashedPassword = await bcrypt.hash(validatedData.password, 10)

		const user = await prisma.user.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				password: hashedPassword,
			},
		})

		const tokens = await createTokensForUser(user.id)

		const { password: _, ...userWithoutPassword } = user
		res.status(201).json({
			user: userWithoutPassword,
			...tokens,
		})
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Registration error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/login", async (req, res) => {
	try {
		const validatedData = loginSchema.parse(req.body)

		const user = await prisma.user.findUnique({
			where: { email: validatedData.email },
		})

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const isPasswordValid = await bcrypt.compare(
			validatedData.password,
			user.password,
		)

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const tokens = await createTokensForUser(user.id)

		const { password: _, ...userWithoutPassword } = user
		res.status(200).json({
			user: userWithoutPassword,
			...tokens,
		})
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Login error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/refresh", async (req, res) => {
	try {
		const { refreshToken } = req.body

		if (!refreshToken) {
			return res.status(400).json({ error: "Refresh token is required" })
		}

		const storedToken = await prisma.refreshToken.findUnique({
			where: { token: refreshToken },
			include: { user: true },
		})

		if (!storedToken) {
			return res.status(401).json({ error: "Invalid refresh token" })
		}

		if (storedToken.expiresAt < new Date()) {
			await prisma.refreshToken.delete({ where: { id: storedToken.id } })
			return res.status(401).json({ error: "Refresh token expired" })
		}

		await prisma.refreshToken.delete({ where: { id: storedToken.id } })

		const tokens = await createTokensForUser(storedToken.userId)

		res.status(200).json(tokens)
	} catch (error) {
		console.error("Refresh error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/logout", async (req, res) => {
	try {
		const { refreshToken } = req.body

		if (!refreshToken) {
			return res.status(400).json({ error: "Refresh token is required" })
		}

		const deleted = await prisma.refreshToken.deleteMany({
			where: { token: refreshToken },
		})

		if (deleted.count === 0) {
			return res.status(400).json({ error: "Invalid refresh token" })
		}

		res.status(200).json({ message: "Logged out successfully" })
	} catch (error) {
		console.error("Logout error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.get("/me", authMiddleware, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user?.userId },
		})

		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		res.status(200).json({ user })
	} catch (error) {
		console.error("Me error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
