import express from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db.js"
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../lib/validation.js"
import {
	generateAccessToken,
	generateRefreshToken,
	getRefreshTokenExpiryDate,
} from "../lib/jwt.js"
import { authMiddleware } from "../middleware/auth.js"
import { stripPassword } from "../lib/userHelpers.js"
import {
	buildResetPasswordUrl,
	generatePasswordResetToken,
	getPasswordResetExpiryDate,
} from "../lib/passwordReset.js"
import { sendPasswordResetEmail } from "../lib/email/index.js"

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

		if (user.email.endsWith("@deleted.tasky")) {
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

router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = forgotPasswordSchema.parse(req.body)

		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (user && !user.email.endsWith("@deleted.tasky")) {
			const token = generatePasswordResetToken()
			const expiresAt = getPasswordResetExpiryDate()

			await prisma.passwordResetToken.deleteMany({
				where: { userId: user.id },
			})

			await prisma.passwordResetToken.create({
				data: {
					token,
					userId: user.id,
					expiresAt,
				},
			})

			const resetUrl = buildResetPasswordUrl(token)
			await sendPasswordResetEmail({
				to: user.email,
				userName: user.name,
				resetUrl,
			})
		}

		res.status(200).json({
			message:
				"If an account exists for that email, a reset link has been sent.",
		})
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Forgot password error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/reset-password", async (req, res) => {
	try {
		const { token, newPassword } = resetPasswordSchema.parse(req.body)

		const storedToken = await prisma.passwordResetToken.findUnique({
			where: { token },
			include: { user: true },
		})

		if (!storedToken) {
			return res.status(400).json({ error: "Invalid or expired reset link" })
		}

		if (storedToken.expiresAt < new Date()) {
			await prisma.passwordResetToken.delete({
				where: { id: storedToken.id },
			})
			return res.status(400).json({ error: "Invalid or expired reset link" })
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10)

		await prisma.$transaction([
			prisma.user.update({
				where: { id: storedToken.userId },
				data: { password: hashedPassword },
			}),
			prisma.passwordResetToken.deleteMany({
				where: { userId: storedToken.userId },
			}),
			prisma.refreshToken.deleteMany({
				where: { userId: storedToken.userId },
			}),
		])

		res.status(200).json({ message: "Password reset successfully" })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Reset password error:", error)
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

		res.status(200).json({ user: stripPassword(user) })
	} catch (error) {
		console.error("Me error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
