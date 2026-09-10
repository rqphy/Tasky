import { describe, it, expect, afterEach } from "vitest"
import {
	authAs,
	createProject,
	addMemberViaInvite,
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

describe("membership socket broadcasts", () => {
	let ownerSocket: Socket | null = null
	let memberSocket: Socket | null = null

	afterEach(() => {
		ownerSocket?.disconnect()
		memberSocket?.disconnect()
		ownerSocket = null
		memberSocket = null
	})

	it("should broadcast member events", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		ownerSocket = createSocketClient(owner.user.accessToken)
		await connectSocket(ownerSocket)
		await joinProject(ownerSocket, project.id)

		/** Add member */
		const addMemberEventPromise = waitForEvent(ownerSocket, "member:joined")

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const addMemberPayload = await addMemberEventPromise

		expect(addMemberPayload.projectId).toBe(project.id)
		expect(addMemberPayload.member.userId).toBe(member.user.id)
		expect(addMemberPayload.member.user.email).toBe(member.user.email)
		expect(addMemberPayload.member.role).toBe("MEMBER")

		memberSocket = createSocketClient(member.user.accessToken)
		await connectSocket(memberSocket)
		await joinProject(memberSocket, project.id)

		/** Remove member */

		const removeMemberEventPromise = waitForEvent(
			ownerSocket,
			"member:removed",
		)
		const memberSilencePromise = assertEventNotReceived(
			memberSocket,
			"member:removed",
		)

		const removeMemberResponse = await api.delete(
			`/projects/${project.id}/members/${member.user.id}`,
			{ headers: member.headers },
		)

		expect(removeMemberResponse.status).toBe(204)

		const removeMemberPayload = await removeMemberEventPromise
		expect(removeMemberPayload.projectId).toBe(project.id)
		expect(removeMemberPayload.userId).toBe(member.user.id)

		await expect(memberSilencePromise).resolves.toBeUndefined()
	})
})
