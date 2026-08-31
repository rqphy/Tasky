import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	createColumn,
	createTask,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

describe("post comment", () => {
	it("return 201 when comment is posted", async () => {
		const { headers, user } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers },
		)

		expect(comment.status).toBe(201)
		expect(comment.data.content).toBe("Hello world...")
		expect(comment.data.taskId).toBe(task.id)
		expect(comment.data.authorId).toBe(user.id)
		expect(comment.data.author.id).toBe(user.id)
		expect(comment.data.author.email).toBe(user.email)
	})

	it("return 201 when a project member posts a comment", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)
		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const column = await createColumn(owner.headers, project.id)
		const task = await createTask(owner.headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Member comment" },
			{ headers: member.headers },
		)

		expect(comment.status).toBe(201)
		expect(comment.data.authorId).toBe(member.user.id)
	})

	it("return 400 when content is empty", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "" },
			{ headers },
		)

		expect(comment.status).toBe(400)
		expect(comment.data.error).toBe("Validation failed")
	})

	it("return 400 when content is missing", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{},
			{ headers },
		)

		expect(comment.status).toBe(400)
		expect(comment.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(comment.status).toBe(401)
		expect(comment.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)
		const task = await createTask(owner.headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: notMember.headers },
		)

		expect(comment.status).toBe(403)
		expect(comment.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const comment = await api.post(
			"/projects/123/tasks/456/comments",
			{ content: "Hello world..." },
			{ headers },
		)

		expect(comment.status).toBe(404)
		expect(comment.data.error).toBe("Project not found")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const comment = await api.post(
			`/projects/${project.id}/tasks/123/comments`,
			{ content: "Hello world..." },
			{ headers },
		)

		expect(comment.status).toBe(404)
		expect(comment.data.error).toBe("Task not found")
	})
})

describe("delete comment", () => {
	it("return 204 when comment is deleted", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers },
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/${comment.data.id}`,
			{ headers },
		)

		expect(deletedComment.status).toBe(204)

		const taskResponse = await api.get(
			`/projects/${project.id}/tasks/${task.id}`,
			{ headers },
		)

		expect(taskResponse.status).toBe(200)
		expect(taskResponse.data.comments).toEqual([])
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers },
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/${comment.data.id}`,
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(deletedComment.status).toBe(401)
		expect(deletedComment.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when user is not a project member", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)
		const task = await createTask(owner.headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/${comment.data.id}`,
			{ headers: notMember.headers },
		)

		expect(deletedComment.status).toBe(403)
		expect(deletedComment.data.error).toBe("Access denied")
	})

	it("return 403 when user is not the author of the comment", async () => {
		const owner = await authAs("Owner")
		const notAuthor = await authAs("Not Author")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: notAuthor.user.email,
			headers: notAuthor.headers,
		})

		const column = await createColumn(owner.headers, project.id)
		const task = await createTask(owner.headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/${comment.data.id}`,
			{ headers: notAuthor.headers },
		)

		expect(deletedComment.status).toBe(403)
		expect(deletedComment.data.error).toBe(
			"Only the author can delete this comment",
		)
	})

	it("return 404 when project is not found", async () => {
		const { headers } = await authAs()

		const deletedComment = await api.delete(
			"/projects/123/tasks/456/comments/789",
			{ headers },
		)

		expect(deletedComment.status).toBe(404)
		expect(deletedComment.data.error).toBe("Project not found")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/123/comments/456`,
			{ headers },
		)

		expect(deletedComment.status).toBe(404)
		expect(deletedComment.data.error).toBe("Task not found")
	})

	it("return 404 when comment is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)
		const column = await createColumn(headers, project.id)
		const task = await createTask(headers, project.id, {
			title: "Test Task",
			columnId: column.id,
		})

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/123`,
			{ headers },
		)

		expect(deletedComment.status).toBe(404)
		expect(deletedComment.data.error).toBe("Comment not found")
	})
})
