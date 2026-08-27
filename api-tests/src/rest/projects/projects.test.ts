import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import { authAs, addMemberViaInvite } from "../../helpers/fixtures.js"

describe("create project", () => {
	it("return 201 when project is created", async () => {
		const { headers, user } = await authAs()

		const response = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		expect(response.status).toBe(201)
		expect(response.data.name).toBe("Test Project")
		expect(response.data.emoji).toBe("🚀")
		expect(response.data.ownerId).toBe(user.id)
		expect(response.data.members).toHaveLength(1)
		expect(response.data.members[0].role).toBe("OWNER")
		expect(response.data.members[0].userId).toBe(user.id)
		expect(response.data.columns).toEqual([])
	})

	it("return 201 with default emoji when emoji is omitted", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects",
			{ name: "Test Project" },
			{ headers },
		)

		expect(response.status).toBe(201)
		expect(response.data.emoji).toBe("📋")
	})

	it("return 400 when name is required", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects",
			{ emoji: "🚀" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("get projects", () => {
	it("return 200 when projects are fetched", async () => {
		const { headers } = await authAs()

		const created = await api.post(
			"/projects",
			{ name: "Listed Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.get("/projects", { headers })

		expect(response.status).toBe(200)
		expect(
			response.data.some(
				(project: { id: string }) => project.id === created.data.id,
			),
		).toBe(true)
	})

	it("return 200 when a member fetches their shared projects", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const created = await api.post(
			"/projects",
			{ name: "Shared Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		await addMemberViaInvite(owner.headers, created.data.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.get("/projects", { headers: member.headers })

		expect(response.status).toBe(200)
		expect(
			response.data.some(
				(project: { id: string }) => project.id === created.data.id,
			),
		).toBe(true)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get("/projects", {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
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

		const response = await api.get(`/projects/${project.data.id}`, {
			headers,
		})

		expect(response.status).toBe(200)
		expect(response.data.name).toBe("Test Project")
		expect(response.data.emoji).toBe("🚀")
		expect(response.data.members.length).toBeGreaterThan(0)
		expect(Array.isArray(response.data.columns)).toBe(true)
	})

	it("return 200 when a project member fetches the project", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await api.post(
			"/projects",
			{ name: "Shared Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		await addMemberViaInvite(owner.headers, project.data.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.get(`/projects/${project.data.id}`, {
			headers: member.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data.name).toBe("Shared Project")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get("/projects/123", {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const outsider = await authAs("Outsider")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const response = await api.get(`/projects/${project.data.id}`, {
			headers: outsider.headers,
		})

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.get("/projects/123", { headers })

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

		const fetched = await api.get(`/projects/${project.data.id}`, { headers })

		expect(fetched.status).toBe(200)
		expect(fetched.data.name).toBe("Updated Project")
		expect(fetched.data.emoji).toBe("🔥")
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

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const response = await api.patch(
			`/projects/${project.data.id}`,
			{ name: "Updated Project" },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not owner", async () => {
		const owner = await authAs("Owner")
		const outsider = await authAs("Outsider")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const response = await api.patch(
			`/projects/${project.data.id}`,
			{ name: "Updated Project", emoji: "🔥" },
			{ headers: outsider.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"Only the owner can update this project",
		)
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.patch(
			"/projects/123",
			{ name: "Updated Project" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})
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

		const fetched = await api.get(`/projects/${project.data.id}`, { headers })

		expect(fetched.status).toBe(404)
		expect(fetched.data.error).toBe("Project not found")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.delete("/projects/123", {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.delete("/projects/123", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 403 when user is not owner", async () => {
		const owner = await authAs("Owner")
		const outsider = await authAs("Outsider")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const response = await api.delete(`/projects/${project.data.id}`, {
			headers: outsider.headers,
		})

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"Only the owner can delete this project",
		)
	})
})
