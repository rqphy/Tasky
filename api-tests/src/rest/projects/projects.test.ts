import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import { authAs } from "../../helpers/fixtures.js"

describe("create project", () => {
	it("return 201 when project is created", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		expect(response.status).toBe(201)
		expect(response.data.name).toBe("Test Project")
		expect(response.data.emoji).toBe("🚀")
	})

	it("return 400 when name is required", async () => {
		const { headers } = await authAs()

		const response = await api.post("/projects", { emoji: "🚀" }, { headers })

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.post("/projects", {
			name: "Test Project",
			emoji: "🚀",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Missing or invalid authorization header")
	})
})

describe("get projects", () => {
	it("return 200 when projects are fetched", async () => {
		const { headers } = await authAs()

		await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.get("/projects", { headers })

		expect(response.status).toBe(200)
		expect(response.data.length).toBeGreaterThan(0)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get("/projects")

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Missing or invalid authorization header")
	})
})

describe("get project", () => {
	it("return 200 when project is fetched", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.get(`/projects/${project.data.id}`, { headers })

		expect(response.status).toBe(200)
		expect(response.data.name).toBe("Test Project")
		expect(response.data.emoji).toBe("🚀")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get("/projects/1")

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Missing or invalid authorization header")
	})

	// test 403

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.get("/projects/1", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})
})

describe("update project", () => {
	it("return 200 when project is updated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.patch(
			`/projects/${project.data.id}`,
			{ name: "Updated Project", emoji: "🔥" },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.name).toBe("Updated Project")
		expect(response.data.emoji).toBe("🔥")
	})

	it("return 400 when validation fails", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.patch(
			`/projects/${project.data.id}`,
			{ name: "" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	// todo test 403
})

describe("delete project", () => {
	it("return 204 when project is deleted", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.delete(`/projects/${project.data.id}`, {
			headers,
		})

		expect(response.status).toBe(204)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.delete("/projects/1")

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Missing or invalid authorization header")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.delete("/projects/1", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	// todo test 403
})
