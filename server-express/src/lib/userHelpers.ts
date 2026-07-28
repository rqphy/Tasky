import bcrypt from "bcryptjs"
import type { User } from "../generated/client.js"

export const DELETED_USER_NAME = "Deleted User"

export const userPublicSelect = {
	id: true,
	name: true,
	email: true,
	imageUrl: true,
} as const

export function deletedUserEmail(userId: string): string {
	return `deleted-${userId}@deleted.tasky`
}

export function stripPassword<T extends { password: string }>(
	user: T,
): Omit<T, "password"> {
	const { password: _, ...userWithoutPassword } = user
	return userWithoutPassword
}

export async function verifyUserPassword(
	user: Pick<User, "password">,
	password: string,
): Promise<boolean> {
	return bcrypt.compare(password, user.password)
}
