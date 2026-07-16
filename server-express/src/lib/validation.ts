import { z } from "zod"

export const registerSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	emoji: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
	emoji: z.string().optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const createColumnSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	color: z.string().optional(),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>

export const updateColumnSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
	color: z.string().optional(),
})

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>

export const reorderColumnsSchema = z.object({
	columnIds: z.array(z.string()).min(1, "At least one column is required"),
})

export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>

export const createTaskSchema = z.object({
	columnId: z.string(),
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z.string().optional(),
	assigneeId: z.string().optional(),
	label: z
		.enum(["BUG", "FEATURE", "IMPROVEMENT", "DOCUMENTATION", "CHORE"])
		.optional(),
	priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
	columnId: z.string().optional(),
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title too long")
		.optional(),
	description: z.string().optional(),
	assigneeId: z.string().nullable().optional(),
	label: z
		.enum(["BUG", "FEATURE", "IMPROVEMENT", "DOCUMENTATION", "CHORE"])
		.nullable()
		.optional(),
	priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const moveTaskSchema = z.object({
	columnId: z.string(),
	position: z.number(),
})

export type MoveTaskInput = z.infer<typeof moveTaskSchema>

export const createCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Content is required")
		.max(5000, "Comment too long"),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const updateShareLinkSchema = z.object({
	isActive: z.boolean(),
})

export type UpdateShareLinkInput = z.infer<typeof updateShareLinkSchema>

export const createInviteSchema = z.object({
	email: z.string().email(),
	role: z.enum(["MEMBER", "VIEWER"]).default("MEMBER"),
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>

export const acceptInviteSchema = z.object({
	token: z.string().min(1),
})

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

export const transferOwnershipSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
})

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>
