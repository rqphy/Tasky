import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createColumn,
	createProject,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

type ProjectColumn = {
	id: string
	name: string
	position: number
}

function findColumn(columns: ProjectColumn[], columnId: string) {
	return columns.find((column) => column.id === columnId)
}

describe("create column", () => {
	it("return 201 when column is created", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.post(
			`/projects/${project.id}/columns`,
			{ name: "Test Column" },
			{ headers },
		)

		expect(response.status).toBe(201)
		expect(response.data.name).toBe("Test Column")
		expect(response.data.projectId).toBe(project.id)
		expect(response.data.color).toBe("#6366f1")
		expect(response.data.position).toBe(1)
	})

	it("return 201 when a project member creates a column", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)
		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/columns`,
			{ name: "Member Column" },
			{ headers: member.headers },
		)

		expect(response.status).toBe(201)
		expect(response.data.name).toBe("Member Column")
	})

	it("return 400 when name is required", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.post(
			`/projects/${project.id}/columns`,
			{ color: "#6366f1" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.post(
			`/projects/${project.id}/columns`,
			{ name: "Test Column" },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)

		const response = await api.post(
			`/projects/${project.id}/columns`,
			{ name: "Test Column" },
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects/123/columns",
			{ name: "Test Column" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})
})

describe("update column", () => {
	it("return 200 when column is updated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.patch(
			`/projects/${project.id}/columns/${column.id}`,
			{ name: "Updated Column", color: "#ff0000" },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.name).toBe("Updated Column")
		expect(response.data.color).toBe("#ff0000")

		const projectResponse = await api.get(`/projects/${project.id}`, {
			headers,
		})

		expect(findColumn(projectResponse.data.columns, column.id)?.name).toBe(
			"Updated Column",
		)
	})

	it("return 400 when name is invalid", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.patch(
			`/projects/${project.id}/columns/${column.id}`,
			{ name: "" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.patch(
			`/projects/${project.id}/columns/${column.id}`,
			{ name: "Updated Column" },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)

		const response = await api.patch(
			`/projects/${project.id}/columns/${column.id}`,
			{ name: "Updated Column" },
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.patch(
			"/projects/123/columns/456",
			{ name: "Updated Column" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when column is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.patch(
			`/projects/${project.id}/columns/123`,
			{ name: "Updated Column" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Column not found")
	})
})

describe("delete column", () => {
	it("return 204 when column is deleted", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.delete(
			`/projects/${project.id}/columns/${column.id}`,
			{ headers },
		)

		expect(response.status).toBe(204)

		const projectResponse = await api.get(`/projects/${project.id}`, {
			headers,
		})

		expect(findColumn(projectResponse.data.columns, column.id)).toBeUndefined()
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.delete(
			`/projects/${project.id}/columns/${column.id}`,
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)

		const response = await api.delete(
			`/projects/${project.id}/columns/${column.id}`,
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.delete("/projects/123/columns/456", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when column is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.delete(
			`/projects/${project.id}/columns/123`,
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Column not found")
	})
})

describe("reorder columns", () => {
	it("return 200 when columns are reordered", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column1 = await createColumn(headers, project.id, {
			name: "Column 1",
		})
		const column2 = await createColumn(headers, project.id, {
			name: "Column 2",
		})

		const response = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [column2.id, column1.id] },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.message).toBe("Columns reordered")

		const projectResponse = await api.get(`/projects/${project.id}`, {
			headers,
		})

		expect(findColumn(projectResponse.data.columns, column2.id)?.position).toBe(
			1,
		)
		expect(findColumn(projectResponse.data.columns, column1.id)?.position).toBe(
			2,
		)
	})

	it("return 400 when columnIds is empty", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const response = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [] },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 400 when column IDs do not belong to this project", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [column.id, "123"] },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Some column IDs do not belong to this project",
		)
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [column.id] },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)

		const response = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [column.id] },
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects/123/columns/reorder",
			{ columnIds: ["456"] },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})
})
