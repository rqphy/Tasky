import { describe, it, expect } from "vitest"
import { api } from "../helpers/client.js"
import {
	authAs,
	createProject,
	createColumn,
	createTask,
	addMemberViaInvite,
} from "../helpers/fixtures.js"

type NotificationMetadata = {
	taskId: string
	taskTitle: string
	oldStatus?: string
	newStatus?: string
}

type Notification = {
	id: string
	projectId: string
	type: string
	title: string
	message: string
	timestamp: string
	isRead: boolean
	actorId: string
	metadata?: NotificationMetadata
}

type ApiError = {
	error: string
}

describe("get notifications", () => {
	it("return 200 when notifications are fetched", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const response = await api.get<Notification[]>("/notifications", {
			params: {
				projectId: project.id,
			},
			headers: member.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toHaveLength(2)

		const latest = response.data[0]!
		expect(latest.type).toBe("task_comment")
		expect(latest.projectId).toBe(project.id)
		expect(latest.metadata?.taskId).toBe(task.id)
		expect(latest.actorId).toBe(owner.user.id)
		expect(latest.isRead).toBe(false)
	})

	it("return 200 when fetching without projectId filter", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const response = await api.get<Notification[]>("/notifications", {
			headers: member.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toHaveLength(2)
		expect(response.data.every((n) => n.projectId === project.id)).toBe(
			true,
		)
	})

	it("return 200 with empty list when projectId matches no notifications", async () => {
		const { headers } = await authAs()

		// Server treats projectId as a filter only — it does not verify the project exists.
		const response = await api.get<Notification[]>("/notifications", {
			params: { projectId: "nonexistent-project-id" },
			headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toEqual([])
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get<ApiError>("/notifications", {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("read all notifications", () => {
	it("return 200 when all notifications are read", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const response = await api.patch<{ success: boolean }>(
			"/notifications/read-all",
			undefined,
			{
				params: {
					projectId: project.id,
				},
				headers: member.headers,
			},
		)

		expect(response.status).toBe(200)
		expect(response.data.success).toBe(true)

		const notifications = await api.get<Notification[]>("/notifications", {
			params: {
				projectId: project.id,
			},
			headers: member.headers,
		})

		expect(notifications.status).toBe(200)
		expect(notifications.data).toHaveLength(2)
		expect(notifications.data[0]!.isRead).toBe(true)
		expect(notifications.data[1]!.isRead).toBe(true)
	})

	it("return 200 when marking all read without projectId filter", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const response = await api.patch<{ success: boolean }>(
			"/notifications/read-all",
			undefined,
			{
				headers: member.headers,
			},
		)

		expect(response.status).toBe(200)
		expect(response.data.success).toBe(true)

		const notifications = await api.get<Notification[]>("/notifications", {
			headers: member.headers,
		})

		expect(notifications.status).toBe(200)
		expect(notifications.data).toHaveLength(2)
		expect(notifications.data.every((n) => n.isRead)).toBe(true)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.patch<ApiError>(
			"/notifications/read-all",
			undefined,
			{
				headers: { Authorization: "Bearer invalid" },
			},
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("read single notification", () => {
	it("return 200 when notification is read", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const notifications = await api.get<Notification[]>("/notifications", {
			params: {
				projectId: project.id,
			},
			headers: member.headers,
		})

		expect(notifications.status).toBe(200)
		expect(notifications.data).toHaveLength(2)
		expect(notifications.data[0]!.isRead).toBe(false)
		expect(notifications.data[1]!.isRead).toBe(false)

		const target = notifications.data[0]!
		const response = await api.patch<Notification>(
			`/notifications/${target.id}/read`,
			undefined,
			{
				headers: member.headers,
			},
		)

		expect(response.status).toBe(200)
		expect(response.data.type).toBe("task_comment")
		expect(response.data.projectId).toBe(project.id)
		expect(response.data.metadata?.taskId).toBe(task.id)
		expect(response.data.actorId).toBe(owner.user.id)
		expect(response.data.isRead).toBe(true)

		const updatedNotifications = await api.get<Notification[]>("/notifications", {
			params: {
				projectId: project.id,
			},
			headers: member.headers,
		})

		expect(updatedNotifications.status).toBe(200)
		expect(updatedNotifications.data).toHaveLength(2)
		expect(updatedNotifications.data[0]!.isRead).toBe(true)
		expect(updatedNotifications.data[1]!.isRead).toBe(false)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.patch<ApiError>(
			"/notifications/any-id/read",
			undefined,
			{
				headers: { Authorization: "Bearer invalid" },
			},
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 404 when notification is not found", async () => {
		const owner = await authAs("Owner")

		const response = await api.patch<ApiError>(`/notifications/123/read`, undefined, {
			headers: owner.headers,
		})

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Notification not found")
	})

	it("return 404 when notification is not owned by the user", async () => {
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
			assigneeId: member.user.id,
		})

		await api.post(
			`/projects/${project.id}/tasks/${task.id}/comments`,
			{ content: "Hello world..." },
			{ headers: owner.headers },
		)

		const notifications = await api.get<Notification[]>("/notifications", {
			params: {
				projectId: project.id,
			},
			headers: member.headers,
		})

		const target = notifications.data[0]!
		const response = await api.patch<ApiError>(
			`/notifications/${target.id}/read`,
			undefined,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Notification not found")
	})
})
