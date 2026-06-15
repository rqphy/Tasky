import express from "express"
import authRoutes from "./auth.js"

const router = express.Router()

// Health check endpoint
router.get("/health", (req, res) => {
	res.json({ status: "ok", message: "Server is running" })
})

// Mount route modules
router.use("/auth", authRoutes)

// TODO: Add other route modules as you build them
// router.use("/projects", projectRoutes)
// router.use("/tasks", taskRoutes)
// router.use("/users", userRoutes)

export default router
