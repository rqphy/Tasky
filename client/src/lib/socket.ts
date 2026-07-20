import { io, type Socket } from "socket.io-client"
import { SOCKET_EVENTS } from "@/lib/socketEvents"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"

let socket: Socket | null = null

export function getSocket() {
	return socket
}

export function connectSocket() {
	const token = localStorage.getItem("accessToken")
	if (!token) return null
	if (socket?.connected) return socket

	socket?.disconnect()
	socket = io(SOCKET_URL, { auth: { token } })

	socket.on("connect", () => {
		console.log("Socket connected:", socket!.id)
	})

	return socket
}

export function disconnectSocket() {
	socket?.disconnect()
	socket = null
}

export function joinProjectRoom(projectId: string) {
	getSocket()?.emit(
		SOCKET_EVENTS.PROJECT_JOIN,
		projectId,
		(res: { ok: boolean; error?: string }) => {
			console.log("Joined project room:", projectId, res)
		},
	)
}

export function leaveProjectRoom(projectId: string) {
	getSocket()?.emit(SOCKET_EVENTS.PROJECT_LEAVE, projectId)
}
