import { describe, it, expect, afterEach } from "vitest"
import type { Socket } from "socket.io-client"
import {
	authAs,
	createProject,
	addMemberViaInvite,
	createColumn,
} from "../helpers/fixtures.js"
import {
	connectSocket,
	createSocketClient,
	joinProject,
	waitForEvent,
	assertEventNotReceived,
} from "../helpers/socket.js"
import { api } from "../helpers/client.js"

describe("column socket broadcasts", () => {
	let ownerSocket: Socket | null = null
	let memberSocket: Socket | null = null

	afterEach(() => {
		ownerSocket?.disconnect()
		memberSocket?.disconnect()
		ownerSocket = null
		memberSocket = null
	})

	it("should broadcast column events", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

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

		/** 1. Create Column */
		const createEventPromise = waitForEvent(memberSocket, "column:created")
		const createSilencePromise = assertEventNotReceived(
			ownerSocket,
			"column:created",
		)

		const column1 = await createColumn(owner.headers, project.id, {
			name: "Todo",
			color: "#f2b093",
		})

		const createPayload = await createEventPromise
		expect(createPayload.projectId).toBe(project.id)
		expect(createPayload.column.id).toBe(column1.id)
		expect(createPayload.column.name).toBe("Todo")
		expect(createPayload.column.color).toBe("#f2b093")
		expect(createPayload.column.position).toBe(column1.position)
		expect(createPayload.column.createdAt).toBe(column1.createdAt)
		expect(createPayload.column.updatedAt).toBe(column1.updatedAt)

		await expect(createSilencePromise).resolves.toBeUndefined()

		/** Create second column for reordering */
		const column2 = await createColumn(owner.headers, project.id, {
			name: "Done",
			color: "#93c5fd",
		})

		/** 2. Update Column */
		const updateEventPromise = waitForEvent(memberSocket, "column:updated")
		const updateSilencePromise = assertEventNotReceived(
			ownerSocket,
			"column:updated",
		)

		const updateRes = await api.patch(
			`/projects/${project.id}/columns/${column1.id}`,
			{ name: "In Progress", color: "#fcd34d" },
			{ headers: owner.headers },
		)
		expect(updateRes.status).toBe(200)

		const updatePayload = await updateEventPromise
		expect(updatePayload.projectId).toBe(project.id)
		expect(updatePayload.column.id).toBe(column1.id)
		expect(updatePayload.column.name).toBe("In Progress")
		expect(updatePayload.column.color).toBe("#fcd34d")
		expect(updatePayload.column.updatedAt).toBe(updateRes.data.updatedAt)

		await expect(updateSilencePromise).resolves.toBeUndefined()

		/** 3. Reorder Columns */
		const reorderEventPromise = waitForEvent(
			memberSocket,
			"column:reordered",
		)
		const reorderSilencePromise = assertEventNotReceived(
			ownerSocket,
			"column:reordered",
		)

		const reorderedColumns = [
			{ id: column2.id, position: 1 },
			{ id: column1.id, position: 2 },
		]

		const reorderRes = await api.post(
			`/projects/${project.id}/columns/reorder`,
			{ columnIds: [column2.id, column1.id] },
			{ headers: owner.headers },
		)
		expect(reorderRes.status).toBe(200)

		const reorderPayload = await reorderEventPromise
		expect(reorderPayload.projectId).toBe(project.id)
		expect(reorderPayload.columns).toEqual(reorderedColumns)

		await expect(reorderSilencePromise).resolves.toBeUndefined()

		/** 4. Delete Column */
		const deleteEventPromise = waitForEvent(memberSocket, "column:deleted")
		const deleteSilencePromise = assertEventNotReceived(
			ownerSocket,
			"column:deleted",
		)

		const deleteRes = await api.delete(
			`/projects/${project.id}/columns/${column2.id}`,
			{ headers: owner.headers },
		)
		expect(deleteRes.status).toBe(204)

		const deletePayload = await deleteEventPromise
		expect(deletePayload.projectId).toBe(project.id)
		expect(deletePayload.columnId).toBe(column2.id)

		await expect(deleteSilencePromise).resolves.toBeUndefined()
	})
})
