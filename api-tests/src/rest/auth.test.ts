import { describe, it, expect } from "vitest"
import { api, authHeaders } from "../helpers/client.js"
import {
	registerUser,
	uniqueEmail,
	testPassword,
	authAs,
} from "../helpers/fixtures.js"

describe("register", () => {
	it("return 201 for valid registration", async () => {
		const email = uniqueEmail()
		const password = testPassword()

		const response = await api.post("/auth/register", {
			name: "John Doe",
			email,
			password,
		})

		expect(response.status).toBe(201)
		expect(response.data.user.email).toBe(email)
		expect(response.data.accessToken).toBeDefined()
		expect(response.data.refreshToken).toBeDefined()
	})

	it("returns 400 when email is already registered", async () => {
		const email = uniqueEmail()
		const password = testPassword()
		const body = {
			name: "John Doe",
			email,
			password,
		}

		await api.post("/auth/register", body)

		const response = await api.post("/auth/register", body)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Email already registered")
	})

	it("returns 400 when password is too short", async () => {
		const email = uniqueEmail()
		const password = "short"

		const response = await api.post("/auth/register", {
			name: "John Doe",
			email,
			password,
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})
})

describe("login", () => {
	it("returns 200 for valid credentials", async () => {
		const { email, password } = await registerUser()

		const response = await api.post("/auth/login", {
			email,
			password,
		})

		expect(response.status).toBe(200)
		expect(response.data.accessToken).toBeDefined()
		expect(response.data.refreshToken).toBeDefined()
	})

	it("returns 401 for unknown user", async () => {
		const response = await api.post("/auth/login", {
			email: "invalid@test.com",
			password: "password123",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Invalid credentials")
	})

	it("returns 400 when email is required", async () => {
		const response = await api.post("/auth/login", {
			password: "password123",
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})
})

describe("refresh", () => {
	it("returns 200 for valid refresh token", async () => {
		const { email, password } = await registerUser()

		const loginResponse = await api.post("/auth/login", {
			email,
			password,
		})

		const refreshResponse = await api.post("/auth/refresh", {
			refreshToken: loginResponse.data.refreshToken,
		})

		expect(refreshResponse.status).toBe(200)
		expect(refreshResponse.data.accessToken).toBeDefined()
		expect(refreshResponse.data.refreshToken).toBeDefined()
	})

	it("returns 400 when refresh token is required", async () => {
		const response = await api.post("/auth/refresh", {})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Refresh token is required")
	})

	it("returns 401 for invalid refresh token", async () => {
		const response = await api.post("/auth/refresh", {
			refreshToken: "invalid-token",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Invalid refresh token")
	})
})

describe("logout", () => {
	it("returns 200 for valid refresh token", async () => {
		const { email, password } = await registerUser()

		const loginResponse = await api.post("/auth/login", {
			email,
			password,
		})

		const logoutResponse = await api.post("/auth/logout", {
			refreshToken: loginResponse.data.refreshToken,
		})

		expect(logoutResponse.status).toBe(200)
		expect(logoutResponse.data.message).toBe("Logged out successfully")
	})

	it("returns 400 for invalid refresh token", async () => {
		const response = await api.post("/auth/logout", {
			refreshToken: "invalid-token",
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Invalid refresh token")
	})
})

describe("me", () => {
	it("returns 200 for valid access token", async () => {
		const { user, headers } = await authAs()

		const meResponse = await api.get("/auth/me", {
			headers,
		})

		expect(meResponse.status).toBe(200)
		expect(meResponse.data.user.email).toBe(user.email)
	})

	it("returns 401 for invalid access token", async () => {
		const response = await api.get("/auth/me", {
			headers: authHeaders("invalid-token"),
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("forgot password", () => {
	it("returns 200", async () => {
		const email = uniqueEmail()

		const response = await api.post("/auth/forgot-password", {
			email,
		})

		expect(response.status).toBe(200)
		expect(response.data.message).toBe(
			"If an account exists for that email, a reset link has been sent.",
		)
	})

	it("returns 400 when email is required", async () => {
		const response = await api.post("/auth/forgot-password", {})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})
})

describe("reset password", () => {
	it("returns 400 invalid token", async () => {
		const password = "password123"

		const response = await api.post("/auth/reset-password", {
			token: "invalid-token",
			password,
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})
})
