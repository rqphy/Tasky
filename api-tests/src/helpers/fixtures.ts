import { randomUUID } from "node:crypto"
import { expect } from "vitest"
import { api, authHeaders } from "./client.js"

export type RequestHeaders = ReturnType<typeof authHeaders>

export function uniqueEmail(prefix = "user"): string {
	return `${prefix}-${randomUUID()}@test.com`
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

/** Create a project and return the project data. */
export async function createProject(
	headers: RequestHeaders,
	data: { name?: string; emoji?: string } = {},
) {
	const response = await api.post(
		"/projects",
		{
			name: data.name ?? "Test Project",
			emoji: data.emoji ?? "🚀",
		},
		{ headers },
	)

	expect(response.status).toBe(201)
	return response.data
}

/** Create a column in a project and return the column data. */
export async function createColumn(
	headers: RequestHeaders,
	projectId: string,
	data: { name?: string; color?: string } = {},
) {
	const body: { name: string; color?: string } = {
		name: data.name ?? "Test Column",
	}
	if (data.color !== undefined) {
		body.color = data.color
	}

	const response = await api.post(`/projects/${projectId}/columns`, body, {
		headers,
	})

	expect(response.status).toBe(201)
	return response.data
}
