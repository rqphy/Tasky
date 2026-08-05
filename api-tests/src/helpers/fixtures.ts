import { expect } from "vitest"
import { api, authHeaders } from "./client.js"

export function uniqueEmail(prefix = "user"): string {
	return `${prefix}-${Date.now()}@test.com`
}

export function testPassword(): string {
	return "password123"
}

type RegisteredUser = {
	email: string
	password: string
	accessToken: string
	refreshToken: string
}

/** Register a new user and return credentials + tokens. */
export async function registerUser(
	name = "John Doe",
): Promise<RegisteredUser> {
	const email = uniqueEmail()
	const password = testPassword()

	const response = await api.post("/auth/register", {
		name,
		email,
		password,
	})

	expect(response.status).toBe(201)

	return {
		email,
		password,
		accessToken: response.data.accessToken,
		refreshToken: response.data.refreshToken,
	}
}

/** Register and return headers for authenticated requests. */
export async function authAs(name = "John Doe") {
	const user = await registerUser(name)
	return {
		user,
		headers: authHeaders(user.accessToken),
	}
}
