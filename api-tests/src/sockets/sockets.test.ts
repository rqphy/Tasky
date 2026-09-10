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
	assertEventNotReceived,
} from "../helpers/socket.js"
import type { Socket } from "socket.io-client"

describe("sockets auth", () => {
	let socket: Socket | null = null

	afterEach(() => {
		if (socket && socket.connected) {
			socket.disconnect()
			socket = null
		}
	})

	it("shoud connect with valid token", async () => {
		const owner = await authAs("Owner")
		socket = createSocketClient(owner.user.accessToken)

		await expect(connectSocket(socket)).resolves.toBe(socket)
		expect(socket.connected).toBe(true)
	})

	it("should reject connection with invalid token", async () => {
		socket = createSocketClient("invalid token")
		await expect(connectSocket(socket)).rejects.toThrow("Unauthorized")
		expect(socket.connected).toBe(false)
	})

	it("should reject connection without token", async () => {
		socket = createSocketClient("")

		await expect(connectSocket(socket)).rejects.toThrow("Unauthorized")
		expect(socket.connected).toBe(false)
	})
})

describe("socket room management", () => {
	let socket: Socket | null = null

	afterEach(() => {
		if (socket && socket.connected) {
			socket.disconnect()
			socket = null
		}
	})

	it("should join a project room", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		socket = createSocketClient(owner.user.accessToken)
		await connectSocket(socket)
		const data = await joinProject(socket, project.id)
		expect(data.ok).toBe(true)
	})

	it("should reject join when user is not project member", async () => {
		const owner = await authAs("Owner")
		const user = await authAs("User")
		const project = await createProject(owner.headers)

		socket = createSocketClient(user.user.accessToken)
		await connectSocket(socket)
		const data = await joinProject(socket, project.id)
		expect(data.ok).toBe(false)
		expect(data.error).toBe("Access denied")
	})

	it("should reject join when project does not exist", async () => {
		const owner = await authAs("Owner")

		socket = createSocketClient(owner.user.accessToken)
		await connectSocket(socket)
		const data = await joinProject(socket, "not-real-project-id")
		expect(data.ok).toBe(false)
		expect(data.error).toBe("Project not found")
	})

	it("should reject join when projectId is invalid", async () => {
		const owner = await authAs("Owner")

		socket = createSocketClient(owner.user.accessToken)
		await connectSocket(socket)
		const data = await joinProject(socket, "")
		expect(data.ok).toBe(false)
		expect(data.error).toBe("Invalid projectId")
	})

	it("should leave a project room", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)
		const column = await createColumn(owner.headers, project.id)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const memberSocket = createSocketClient(member.user.accessToken)
		await connectSocket(memberSocket)
		await joinProject(memberSocket, project.id)

		memberSocket.emit("leaveProject", project.id)

		await new Promise((resolve) => setTimeout(resolve, 50))

		const silencePromise = assertEventNotReceived(
			memberSocket,
			"task:created",
		)

		await createTask(owner.headers, project.id, {
			columnId: column.id,
			title: "New Task",
		})

		await expect(silencePromise).resolves.toBeUndefined()

		memberSocket.disconnect()
	})
})
