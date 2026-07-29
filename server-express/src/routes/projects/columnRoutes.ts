import express from "express"
import { prisma } from "../../lib/db.js"
import {
	createColumnSchema,
	updateColumnSchema,
	reorderColumnsSchema,
} from "../../lib/validation.js"
import { verifyProjectMember } from "../../lib/projectAccess.js"
import { emitToProjectExceptUser } from "../../lib/socket.js"
import { SOCKET_EVENTS } from "../../lib/socketEvents.js"

const router = express.Router()

router.post("/:id/columns", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = createColumnSchema.parse(req.body)

		const memberCheck = await verifyProjectMember(id, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const lastColumn = await prisma.column.findFirst({
			where: { projectId: id },
			orderBy: { position: "desc" },
		})
		const position = lastColumn ? lastColumn.position + 1 : 1.0

		const column = await prisma.column.create({
			data: {
				projectId: id,
				name: validatedData.name,
				color: validatedData.color ?? "#6366f1",
				position,
			},
		})

		emitToProjectExceptUser(id, userId, SOCKET_EVENTS.COLUMN_CREATED, {
			projectId: id,
			column,
		})

		res.status(201).json(column)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Create column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.patch("/:id/columns/:columnId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id, columnId } = req.params
		const validatedData = updateColumnSchema.parse(req.body)

		const memberCheck = await verifyProjectMember(id, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		})

		if (!column || column.projectId !== id) {
			return res.status(404).json({ error: "Column not found" })
		}

		const updatedColumn = await prisma.column.update({
			where: { id: columnId },
			data: validatedData,
		})

		emitToProjectExceptUser(id, userId, SOCKET_EVENTS.COLUMN_UPDATED, {
			projectId: id,
			column: updatedColumn,
		})

		res.status(200).json(updatedColumn)
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Update column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.delete("/:id/columns/:columnId", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id, columnId } = req.params

		const memberCheck = await verifyProjectMember(id, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		})

		if (!column || column.projectId !== id) {
			return res.status(404).json({ error: "Column not found" })
		}

		await prisma.column.delete({
			where: { id: columnId },
		})

		emitToProjectExceptUser(id, userId, SOCKET_EVENTS.COLUMN_DELETED, {
			projectId: id,
			columnId,
		})

		res.status(204).send()
	} catch (error) {
		console.error("Delete column error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

router.post("/:id/columns/reorder", async (req, res) => {
	try {
		const userId = req.user!.userId
		const { id } = req.params
		const validatedData = reorderColumnsSchema.parse(req.body)

		const memberCheck = await verifyProjectMember(id, userId)
		if ("error" in memberCheck) {
			return res
				.status(memberCheck.status)
				.json({ error: memberCheck.error })
		}

		const columns = await prisma.column.findMany({
			where: { projectId: id },
			select: { id: true },
		})

		const existingIds = new Set(columns.map((c) => c.id))
		const allBelongToProject = validatedData.columnIds.every((cid) =>
			existingIds.has(cid),
		)

		if (!allBelongToProject) {
			return res.status(400).json({
				error: "Some column IDs do not belong to this project",
			})
		}

		await prisma.$transaction(
			validatedData.columnIds.map((columnId, index) =>
				prisma.column.update({
					where: { id: columnId },
					data: { position: index + 1 },
				}),
			),
		)

		const reorderedColumns = validatedData.columnIds.map(
			(columnId, index) => ({
				id: columnId,
				position: index + 1,
			}),
		)

		emitToProjectExceptUser(id, userId, SOCKET_EVENTS.COLUMN_REORDERED, {
			projectId: id,
			columns: reorderedColumns,
		})

		res.status(200).json({ message: "Columns reordered" })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error })
		}

		console.error("Reorder columns error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
})

export default router
