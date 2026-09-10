import { describe, it, expect, afterEach } from "vitest"
import type { Socket } from "socket.io-client"
import {
	authAs,
	createProject,
	addMemberViaInvite,
	createColumn,
	createTask,
} from "../helpers/fixtures.js"
import {
	connectSocket,
	createSocketClient,
	waitForEvent,
	assertEventNotReceived,
} from "../helpers/socket.js"

describe("notification socket broadcasts", () => {
	let ownerSocket: Socket | null = null
	let memberSocket: Socket | null = null

	afterEach(() => {
		ownerSocket?.disconnect()
		memberSocket?.disconnect()
		ownerSocket = null
		memberSocket = null
	})

	it("should broadcast notification events", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		const column = await createColumn(owner.headers, project.id, {
			name: "Todo",
			color: "#f2b093",
		})

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		ownerSocket = createSocketClient(owner.user.accessToken)
		memberSocket = createSocketClient(member.user.accessToken)
		await connectSocket(ownerSocket)
		await connectSocket(memberSocket)

		/** Create notification */
		const createNotificationEventPromise = waitForEvent(
			memberSocket,
			"notification:created",
		)
		const createNotificationSilencePromise = assertEventNotReceived(
			ownerSocket,
			"notification:created",
		)

		const task = await createTask(owner.headers, project.id, {
			title: "Test Task",
			columnId: column.id,
			assigneeId: member.user.id,
		})

		const createNotificationPayload = await createNotificationEventPromise
		expect(createNotificationPayload.id).toBeDefined()
		expect(createNotificationPayload.metadata.taskId).toBe(task.id)
		expect(createNotificationPayload.metadata.taskTitle).toBe("Test Task")
		expect(createNotificationPayload.projectId).toBe(project.id)
		expect(createNotificationPayload.type).toBe("task_assigned")
		expect(createNotificationPayload.title).toBe("New task assigned")
		expect(createNotificationPayload.message).toBe(
			"Owner assigned you to 'Test Task'",
		)
		expect(createNotificationPayload.timestamp).toBeDefined()
		expect(createNotificationPayload.isRead).toBe(false)
		expect(createNotificationPayload.actorId).toBe(owner.user.id)

		await expect(createNotificationSilencePromise).resolves.toBeUndefined()
	})
})
