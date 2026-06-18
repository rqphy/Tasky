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
