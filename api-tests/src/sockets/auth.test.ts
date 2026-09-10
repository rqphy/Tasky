import { describe, it, expect, afterEach } from "vitest"
import { connectSocket, createSocketClient } from "../helpers/socket"
import { authAs } from "../helpers/fixtures"
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
