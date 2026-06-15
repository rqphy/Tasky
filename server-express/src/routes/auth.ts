import express from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db.js"
import { registerSchema, loginSchema } from "../lib/validation.js"

const router = express.Router()

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

		const { password: _, ...userWithoutPassword } = user
		res.status(201).json(userWithoutPassword)
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

// TODO: Add login route
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

		const { password: _, ...userWithoutPassword } = user
		res.status(200).json(userWithoutPassword)
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

// TODO: Add refresh token route
// router.post("/refresh", async (req, res) => { ... })

// TODO: Add logout route
// router.post("/logout", async (req, res) => { ... })

export default router
