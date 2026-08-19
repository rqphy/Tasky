import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import { authAs } from "../../helpers/fixtures.js"

describe("create column", () => {
	it("return 201 when column is created", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		expect(column.status).toBe(201)
		expect(column.data.name).toBe("Test Column")
	})

	it("return 400 when name is required", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ color: "#6366f1" },
			{ headers },
		)

		expect(column.status).toBe(400)
		expect(column.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(`/projects/${project.data.id}/columns`, {
			name: "Test Column",
		})

		expect(column.status).toBe(401)
		expect(column.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a member of the project", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers: notMember.headers },
		)

		expect(column.status).toBe(403)
		expect(column.data.error).toBe("Access denied")
	})
})

describe("update column", () => {
	it("return 200 when column is updated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const updatedColumn = await api.patch(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ name: "Updated Column" },
			{ headers },
		)

		expect(updatedColumn.status).toBe(200)
		expect(updatedColumn.data.name).toBe("Updated Column")
	})

	it("return 400 when name is invalid", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const updatedColumn = await api.patch(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ name: "" },
			{ headers },
		)

		expect(updatedColumn.status).toBe(400)
		expect(updatedColumn.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const updatedColumn = await api.patch(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ name: "Updated Column" },
		)

		expect(updatedColumn.status).toBe(401)
		expect(updatedColumn.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a member of the project", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers: owner.headers },
		)

		const updatedColumn = await api.patch(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ name: "Updated Column" },
			{ headers: notMember.headers },
		)

		expect(updatedColumn.status).toBe(403)
		expect(updatedColumn.data.error).toBe("Access denied")
	})
})

describe("delete column", () => {
	it("return 204 when column is deleted", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const deletedColumn = await api.delete(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ headers },
		)

		expect(deletedColumn.status).toBe(204)
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const deletedColumn = await api.delete(
			`/projects/${project.data.id}/columns/${column.data.id}`,
		)

		expect(deletedColumn.status).toBe(401)
		expect(deletedColumn.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a member of the project", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers: owner.headers },
		)

		const deletedColumn = await api.delete(
			`/projects/${project.data.id}/columns/${column.data.id}`,
			{ headers: notMember.headers },
		)

		expect(deletedColumn.status).toBe(403)
		expect(deletedColumn.data.error).toBe("Access denied")
	})
})

describe("reorder columns", () => {
	it("return 200 when columns are reordered", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column1 = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column1" },
			{ headers },
		)

		const column2 = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column2" },
			{ headers },
		)

		const reorderedColumns = await api.post(
			`/projects/${project.data.id}/columns/reorder`,
			{ columnIds: [column2.data.id, column1.data.id] },
			{ headers },
		)

		expect(reorderedColumns.status).toBe(200)
		expect(reorderedColumns.data.message).toBe("Columns reordered")
	})

	it("return 400 when columns are not provided", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const reorderedColumns = await api.post(
			`/projects/${project.data.id}/columns/reorder`,
			{ columnIds: [] },
			{ headers },
		)

		expect(reorderedColumns.status).toBe(400)
		expect(reorderedColumns.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		const reorderedColumns = await api.post(
			`/projects/${project.data.id}/columns/reorder`,
			{ columnIds: [column.data.id] },
		)

		expect(reorderedColumns.status).toBe(401)
		expect(reorderedColumns.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a member of the project", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await api.post(
			"/projects",
			{ name: "Test Project", emoji: "🚀" },
			{ headers: owner.headers },
		)

		const column = await api.post(
			`/projects/${project.data.id}/columns`,
			{ name: "Test Column" },
			{ headers: owner.headers },
		)

		const reorderedColumns = await api.post(
			`/projects/${project.data.id}/columns/reorder`,
			{ columnIds: [column.data.id] },
			{ headers: notMember.headers },
		)

		expect(reorderedColumns.status).toBe(403)
		expect(reorderedColumns.data.error).toBe("Access denied")
	})
})
