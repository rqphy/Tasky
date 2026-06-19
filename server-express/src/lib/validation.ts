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
