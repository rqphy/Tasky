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
		const { headers } = await authAs()

		const project = await createProject(headers)

		const column = await createColumn(headers, project.id)

		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{
				content: "Hello world...",
			},
			{ headers },
		)

		expect(comment.status).toBe(201)
		expect(comment.data.content).toBe("Hello world...")
	})

	it("return 400 when content is required", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const column = await createColumn(headers, project.id)

		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{
				content: "",
			},
			{ headers },
		)

		expect(comment.status).toBe(400)
		expect(comment.data.error).toBe("Validation failed")
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

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{
				content: "Hello world...",
			},
			{ headers: notMember.headers },
		)

		expect(comment.status).toBe(403)
		expect(comment.data.error).toBe("Access denied")
	})

	it("return 404 when task is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const comment = await api.post(
			`/projects/${project.id}/tasks/invalid-task-id/comments`,
			{
				content: "Hello world...",
			},
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

		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{
				content: "Hello world...",
			},
			{ headers },
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/${comment.data.id}`,
			{ headers },
		)

		expect(deletedComment.status).toBe(204)
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

		const task = await createTask(
			owner.headers,
			project.id,
			column.id,
			"Test Task",
		)

		const comment = await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{
				content: "Hello world...",
			},
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

	it("return 404 when comment is not found", async () => {
		const { headers } = await authAs()

		const project = await createProject(headers)

		const column = await createColumn(headers, project.id)

		const task = await createTask(
			headers,
			project.id,
			column.id,
			"Test Task",
		)

		const deletedComment = await api.delete(
			`/projects/${project.id}/tasks/${task.id}/comments/invalid-comment-id`,
			{ headers },
		)

		expect(deletedComment.status).toBe(404)
		expect(deletedComment.data.error).toBe("Comment not found")
	})
})
