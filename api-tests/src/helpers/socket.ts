import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { SOCKET_URL } from "./config"

export function createSocketClient(token: string): Socket {
	return io(SOCKET_URL, {
		auth: {
			token,
		},
		autoConnect: false,
		transports: ["websocket"],
		reconnection: false,
	})
}

export function connectSocket(socket: Socket): Promise<Socket> {
	return new Promise((resolve, reject) => {
		socket.once("connect", () => {
			resolve(socket)
		})
		socket.once("connect_error", (error) => {
			reject(error)
		})
		socket.connect()
	})
}

export function waitForEvent<T = any>(
	socket: Socket,
	event: string,
	timeout = 1000,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(
				new Error(
					`Timed out waiting for event ${event} after ${timeout}ms`,
				),
			)
		}, timeout)

		socket.once(event, (data: T) => {
			clearTimeout(timer)
			resolve(data)
		})
	})
}

type JoinProjectResponse = {
	ok: boolean
	error?: string
}

export function joinProject(
	socket: Socket,
	projectId: string,
): Promise<JoinProjectResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"joinProject",
			projectId,
			(response: JoinProjectResponse) => {
				resolve(response)
			},
		)
	})
}

/** Resolves if the event is NOT received within timeoutMs. Rejects if it IS received. */
export function assertEventNotReceived(
	socket: Socket,
	event: string,
	timeout = 500,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const handler = (data: any) => {
			cleanup()
			reject(
				new Error(
					`Expected event "${event}" to NOT be received, but got: ${JSON.stringify(data)}`,
				),
			)
		}

		const timer = setTimeout(() => {
			cleanup()
			resolve()
		}, timeout)

		const cleanup = () => {
			clearTimeout(timer)
			socket.off(event, handler)
		}

		socket.on(event, handler)
	})
}
