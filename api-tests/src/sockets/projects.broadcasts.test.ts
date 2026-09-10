import { describe, it, expect, afterEach } from "vitest"
import {
	authAs,
	createProject,
	addMemberViaInvite,
} from "../helpers/fixtures.js"
import {
	connectSocket,
	createSocketClient,
	waitForEvent,
	assertEventNotReceived,
} from "../helpers/socket.js"
import { api } from "../helpers/client.js"
import type { Socket } from "socket.io-client"

describe("project socket broadcasts", () => {
	let ownerSocket: Socket | null = null
	let memberSocket: Socket | null = null

	afterEach(() => {
		ownerSocket?.disconnect()
		memberSocket?.disconnect()
		ownerSocket = null
		memberSocket = null
	})

	it("should broadcast project events", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		ownerSocket = createSocketClient(owner.user.accessToken)
		await connectSocket(ownerSocket)

		memberSocket = createSocketClient(member.user.accessToken)
		await connectSocket(memberSocket)

		/** Update project */

		const updateProjectEventPromise = waitForEvent(
			memberSocket,
			"project:updated",
		)
		const updateSilencePromise = assertEventNotReceived(
			ownerSocket,
			"project:updated",
		)

		const updateProjectResponse = await api.patch(
			`/projects/${project.id}`,
			{ name: "Updated Project", emoji: "👀" },
			{ headers: owner.headers },
		)

		expect(updateProjectResponse.status).toBe(200)

		const updateProjectPayload = await updateProjectEventPromise
		expect(updateProjectPayload.projectId).toBe(project.id)
		expect(updateProjectPayload.name).toBe("Updated Project")
		expect(updateProjectPayload.emoji).toBe("👀")
		expect(updateProjectPayload.updatedAt).toBeDefined()

		await expect(updateSilencePromise).resolves.toBeUndefined()

		/** Delete project */

		const deleteProjectEventPromise = waitForEvent(
			memberSocket,
			"project:deleted",
		)
		const deleteSilencePromise = assertEventNotReceived(
			ownerSocket,
			"project:deleted",
		)

		const deleteProjectResponse = await api.delete(
			`/projects/${project.id}`,
			{ headers: owner.headers },
		)

		expect(deleteProjectResponse.status).toBe(204)

		const deleteProjectPayload = await deleteProjectEventPromise
		expect(deleteProjectPayload.projectId).toBe(project.id)

		await expect(deleteSilencePromise).resolves.toBeUndefined()
	})
})
