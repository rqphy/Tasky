import { describe, it, expect, afterEach } from "vitest"
import {
	authAs,
	createColumn,
	createProject,
	addMemberViaInvite,
	createTask,
} from "../helpers/fixtures.js"
import {
	connectSocket,
	createSocketClient,
	joinProject,
	waitForEvent,
	assertEventNotReceived,
} from "../helpers/socket.js"
import { api } from "../helpers/client.js"
import { Socket } from "socket.io-client"

describe("socket broadcasts", () => {
	let ownerSocket: Socket | null = null
	let memberSocket: Socket | null = null

	afterEach(() => {
		ownerSocket?.disconnect()
		memberSocket?.disconnect()
		ownerSocket = null
		memberSocket = null
	})

	it("should broadcast task events", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)
		const otherColumn = await createColumn(owner.headers, project.id)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		ownerSocket = createSocketClient(owner.user.accessToken)
		memberSocket = createSocketClient(member.user.accessToken)
		await connectSocket(ownerSocket)
		await connectSocket(memberSocket)
		await joinProject(ownerSocket, project.id)
		await joinProject(memberSocket, project.id)

		/** Create task */

		const eventPromise = waitForEvent(memberSocket, "task:created")
		const silencePromise = assertEventNotReceived(
			ownerSocket,
			"task:created",
		)

		const task = await createTask(owner.headers, project.id, {
			columnId: column.id,
		})

		const payload = await eventPromise

		expect(payload.projectId).toBe(project.id)

		expect(payload.task.id).toBe(task.id)
		expect(payload.task.columnId).toBe(column.id)
		expect(payload.task.title).toBe(task.title)
		expect(payload.task.createdAt).toBe(task.createdAt)
		expect(payload.task.updatedAt).toBe(task.updatedAt)

		await expect(silencePromise).resolves.toBeUndefined()

		/** Update task */

		const updateEventPromise = waitForEvent(memberSocket, "task:updated")
		const updateSilencePromise = assertEventNotReceived(
			ownerSocket,
			"task:updated",
		)

		const updatedTask = await api.patch(
			`/projects/${project.id}/tasks/${task.id}`,
			{ title: "Updated Task" },
			{ headers: owner.headers },
		)

		expect(updatedTask.status).toBe(200)

		const updatePayload = await updateEventPromise

		expect(updatePayload.projectId).toBe(project.id)

		expect(updatePayload.task.id).toBe(task.id)
		expect(updatePayload.task.title).toBe("Updated Task")
		expect(updatePayload.task.columnId).toBe(column.id)
		expect(updatePayload.task.createdAt).toBe(task.createdAt)
		expect(updatePayload.task.updatedAt).toBe(updatedTask.data.updatedAt)

		await expect(updateSilencePromise).resolves.toBeUndefined()

		/** Move task to different column */

		const moveEventPromise = waitForEvent(memberSocket, "task:moved")
		const moveSilencePromise = assertEventNotReceived(
			ownerSocket,
			"task:moved",
		)

		const moveResponse = await api.post(
			`/projects/${project.id}/tasks/${task.id}/move`,
			{ columnId: otherColumn.id, position: 1 },
			{ headers: owner.headers },
		)

		expect(moveResponse.status).toBe(200)

		const movePayload = await moveEventPromise

		expect(movePayload.projectId).toBe(project.id)
		expect(movePayload.taskId).toBe(task.id)
		expect(movePayload.columnId).toBe(otherColumn.id)
		expect(movePayload.position).toBe(1)

		await expect(moveSilencePromise).resolves.toBeUndefined()

		/** Delete task */

		const deleteEventPromise = waitForEvent(memberSocket, "task:deleted")
		const deleteSilencePromise = assertEventNotReceived(
			ownerSocket,
			"task:deleted",
		)

		const deleteResponse = await api.delete(
			`/projects/${project.id}/tasks/${task.id}`,
			{
				headers: owner.headers,
			},
		)

		expect(deleteResponse.status).toBe(204)

		const deletePayload = await deleteEventPromise

		expect(deletePayload.projectId).toBe(project.id)
		expect(deletePayload.taskId).toBe(task.id)

		await expect(deleteSilencePromise).resolves.toBeUndefined()
	})
})
