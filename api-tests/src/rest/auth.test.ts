import { describe, it, expect } from "vitest"
import axios from "axios"

const API_URL = "http://localhost:3001/api"

// Don't throw on 4xx/5xx — lets us test error responses
const api = axios.create({
	baseURL: API_URL,
	validateStatus: () => true,
})

describe("register", () => {
	it("return 201 for valid registration", async () => {
		const email = `user-${Date.now()}@test.com`

		const response = await api.post("/auth/register", {
			name: "John Doe",
			email,
			password: "password123",
		})

		expect(response.status).toBe(201)
		expect(response.data.user.email).toBe(email)
		expect(response.data.accessToken).toBeDefined()
		expect(response.data.refreshToken).toBeDefined()
	})

	it("returns 400 when email is already registered", async () => {
		const email = `user-${Date.now()}@test.com`
		const body = {
			name: "John Doe",
			email,
			password: "password123",
		}

		await api.post("/auth/register", body)

		const response = await api.post("/auth/register", body)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Email already registered")
	})

	it("returns 400 when password is too short", async () => {
		const email = `user-${Date.now()}@test.com`

		const response = await api.post("/auth/register", {
			name: "John Doe",
			email,
			password: "short",
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})
})

describe("login", () => {
	it("returns 200 for valid credentials", async () => {
		const email = `user-${Date.now()}@test.com`
		const password = "password123"

		await api.post("/auth/register", {
			name: "John Doe",
			email,
			password,
		})

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
