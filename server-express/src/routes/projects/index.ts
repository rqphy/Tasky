import express from "express"
import { authMiddleware } from "../../middleware/auth.js"
import projectRoutes from "./projectRoutes.js"
import memberRoutes from "./memberRoutes.js"
import inviteRoutes from "./inviteRoutes.js"
import shareRoutes from "./shareRoutes.js"
import columnRoutes from "./columnRoutes.js"
import taskRoutes from "./taskRoutes.js"
import commentRoutes from "./commentRoutes.js"

const router = express.Router()

router.use(authMiddleware)

router.use("/", projectRoutes)
router.use("/", memberRoutes)
router.use("/", inviteRoutes)
router.use("/", shareRoutes)
router.use("/", columnRoutes)
router.use("/", taskRoutes)
router.use("/", commentRoutes)

export default router
