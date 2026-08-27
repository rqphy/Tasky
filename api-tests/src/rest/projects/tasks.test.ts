import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createColumn,
	createProject,
	createTask,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

describe("create task", () => {
	it("return 201 when task is created", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const task = await api.post(
			`/projects/${project.id}/tasks`,
			{
				columnId: column.id,
				title: "Test Task",
			},
			{ headers },
		)

		expect(task.status).toBe(201)
		expect(task.data.title).toBe("Test Task")
		expect(task.data.columnId).toBe(column.id)
		expect(task.data.priority).toBe("MEDIUM")
		expect(task.data.position).toBe(1)
		expect(task.data._count.comments).toBe(0)
	})

	it("return 400 when title is missing", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const task = await api.post(
			`/projects/${project.id}/tasks`,
			{ columnId: column.id },
			{ headers },
		)

		expect(task.status).toBe(400)
		expect(task.data.error).toBe("Validation failed")
	})

	it("return 400 when column does not belong to this project", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const task = await api.post(
			`/projects/${project.id}/tasks`,
			{
				columnId: "123",
				title: "Test Task",
			},
			{ headers },
		)

		expect(task.status).toBe(400)
		expect(task.data.error).toBe("Invalid column ID")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const task = await api.post(
			`/projects/${project.id}/tasks`,
			{
				columnId: column.id,
				title: "Test Task",
			},
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(task.status).toBe(401)
		expect(task.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)

		const task = await api.post(
			`/projects/${project.id}/tasks`,
			{
				columnId: column.id,
				title: "Test Task",
			},
			{ headers: notMember.headers },
		)

		expect(task.status).toBe(403)
		expect(task.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const task = await api.post(
			"/projects/123/tasks",
			{
				columnId: "456",
				title: "Test Task",
			},
			{ headers },
		)

		expect(task.status).toBe(404)
		expect(task.data.error).toBe("Project not found")
	})
})

describe("get task", () => {
	it("return 200 when task is found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.title).toBe("Test Task")
		expect(response.data.column.id).toBe(column.id)
		expect(response.data.comments).toEqual([])
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
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
		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.get("/projects/123/tasks/456", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)

		const response = await api.get(`/projects/${project.id}/tasks/123`, {
			headers,
		})

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Task not found")
	})
})

describe("update task", () => {
	it("return 200 when task is updated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ title: "Updated Task" },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.title).toBe("Updated Task")

		const fetched = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(fetched.status).toBe(200)
		expect(fetched.data.title).toBe("Updated Task")
	})

	it("return 200 when assignee is set to a project member", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)
		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const column = await createColumn(owner.headers, project.id)
		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ assigneeId: member.user.id },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.assigneeId).toBe(member.user.id)
		expect(response.data.assignee.id).toBe(member.user.id)
	})

	it("return 400 when assignee is not a project member", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ assigneeId: "123" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Assignee is not a project member")
	})

	it("return 400 when column does not belong to this project", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ columnId: "123" },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Invalid column ID")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ title: "Updated Task" },
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
		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ title: "Updated Task" },
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)

		const response = await api.patch(
			`/projects/${project.id}/tasks/123`,
			{ title: "Updated Task" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Task not found")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.patch(
			"/projects/123/tasks/456",
			{ title: "Updated Task" },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})
})

describe("delete task", () => {
	it("return 204 when task is deleted", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.delete(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(response.status).toBe(204)

		const fetched = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(fetched.status).toBe(404)
		expect(fetched.data.error).toBe("Task not found")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.delete(
			`/projects/${project.id}/tasks/${task.id}`,
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
		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.delete(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.delete("/projects/123/tasks/456", { headers })

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)

		const response = await api.delete(
			`/projects/${project.id}/tasks/123`,
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Task not found")
	})
})

describe("move task", () => {
	it("return 200 when task is moved to another column", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column1 = await createColumn(headers, project.id, {
			name: "Column 1",
		})
		const column2 = await createColumn(headers, project.id, {
			name: "Column 2",
		})
		const task = await createTask(
			headers,
			project.id,
			column1.id,
			"Test Task",
		)

		const response = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: column2.id, position: 1 },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.columnId).toBe(column2.id)
		expect(response.data.position).toBe(1)

		const fetched = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(fetched.status).toBe(200)
		expect(fetched.data.columnId).toBe(column2.id)
	})

	it("return 200 when task position is changed within a column", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task1 = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task 1",
		)
		await createTask(headers, project.id, column.id, "Test Task 2")

		const response = await api.post(
			`/projects/${project.id}/tasks/${task1.id}/move`,
			{ columnId: column.id, position: 5 },
			{ headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.columnId).toBe(column.id)
		expect(response.data.position).toBe(5)
	})

	it("return 400 when column does not belong to this project", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: "123", position: 1 },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Invalid column ID")
	})

	it("return 400 when position is missing", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: column.id },
			{ headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: column.id, position: 1 },
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
		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const response = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: column.id, position: 1 },
			{ headers: notMember.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const response = await api.post(
			"/projects/123/tasks/456/move",
			{ columnId: "789", position: 1 },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)

		const response = await api.post(
			`/projects/${project.id}/tasks/123/move`,
			{ columnId: column.id, position: 1 },
			{ headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Task not found")
	})
})
