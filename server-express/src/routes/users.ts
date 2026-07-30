import express from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db.js"
import {
	deleteAccountSchema,
	updateEmailSchema,
	updateProfileSchema,
	updatePasswordSchema,
} from "../lib/validation.js"
import { stripPassword, verifyUserPassword } from "../lib/userHelpers.js"
import {
	deleteUserAccount,
	OwnedProjectsError,
} from "../lib/deleteAccount.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

router.use(authMiddleware)

async function getAuthenticatedUser(userId: string) {
	return prisma.user.findUnique({ where: { id: userId } })
}

function normalizeOptional(value: string | undefined): string | null {
	if (value === undefined) return null
	const trimmed = value.trim()
	return trimmed === "" ? null : trimmed
}

router.patch("/me/profile", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { name, bio, jobTitle, company } = updateProfileSchema.parse(req.body)

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				name,
				bio: normalizeOptional(bio),
				jobTitle: normalizeOptional(jobTitle),
				company: normalizeOptional(company),
			},
		})

		res.status(200).json({ user: stripPassword(user) })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update profile error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/me/email", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { email, password } = updateEmailSchema.parse(req.body)

		const user = await getAuthenticatedUser(userId)
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const isPasswordValid = await verifyUserPassword(user, password)
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid password" })
		}

		if (email === user.email) {
			return res.status(200).json({ user: stripPassword(user) })
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return res.status(400).json({ error: "Email already registered" })
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { email },
		})

		res.status(200).json({ user: stripPassword(updatedUser) })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update email error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/me/password", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { currentPassword, newPassword } =
			updatePasswordSchema.parse(req.body)

		const user = await getAuthenticatedUser(userId)
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const isPasswordValid = await verifyUserPassword(user, currentPassword)
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid password" })
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10)

		await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: { password: hashedPassword },
			}),
			prisma.refreshToken.deleteMany({
				where: { userId },
			}),
			prisma.passwordResetToken.deleteMany({
				where: { userId },
			}),
		])

		res.status(200).json({ message: "Password updated successfully" })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update password error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/me", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { password } = deleteAccountSchema.parse(req.body)

		const user = await getAuthenticatedUser(userId)
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const isPasswordValid = await verifyUserPassword(user, password)
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid password" })
		}

		await deleteUserAccount(userId)

		res.status(204).send()
	} catch (error) {
		if (error instanceof OwnedProjectsError) {
			return res.status(400).json({
				error: error.message,
				ownedProjects: error.ownedProjects,
			})
		}

		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Delete account error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/me/image", async (req, res) => {
	try {
		const userId = req.user!.userId

		const user = await prisma.user.update({
			where: { id: userId },
			data: { imageUrl: null },
		})

		res.status(200).json({ user: stripPassword(user) })
	} catch (error) {
		console.error("Remove profile image error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
