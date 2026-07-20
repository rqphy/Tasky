import { io } from "socket.io-client"
import { SOCKET_EVENTS } from "@/lib/socketEvents"
import type { AppSocket } from "@/lib/socketTypes"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"

let socket: AppSocket | null = null
const joinedProjectRooms = new Set<string>()

function rejoinProjectRooms() {
	if (!socket) return
	for (const projectId of joinedProjectRooms) {
		socket.emit(
			SOCKET_EVENTS.PROJECT_JOIN,
			projectId,
			(res: { ok: boolean; error?: string }) => {
				console.log("Rejoined project room:", projectId, res)
			},
		)
	}
}

function createSocket(token: string): AppSocket {
	const sock = io(SOCKET_URL, { auth: { token } }) as AppSocket

	sock.on("connect", () => {
		console.log("Socket connected:", sock.id)
		rejoinProjectRooms()
	})

	return sock
}

export function getSocket() {
	return socket
}

export function connectSocket() {
	const token = localStorage.getItem("accessToken")
	if (!token) return null
	if (socket?.connected) return socket

	if (socket) {
		socket.auth = { token }
		socket.connect()
		return socket
	}

	socket = createSocket(token)
	return socket
}

export function refreshSocketAuth(accessToken: string) {
	if (!socket) return

	socket.auth = { token: accessToken }

	if (socket.connected) {
		socket.disconnect().connect()
		return
	}

	if (!socket.active) {
		socket.connect()
	}
}

export function disconnectSocket() {
	socket?.disconnect()
	socket = null
	joinedProjectRooms.clear()
}

export function joinProjectRoom(projectId: string) {
	joinedProjectRooms.add(projectId)
	getSocket()?.emit(
		SOCKET_EVENTS.PROJECT_JOIN,
		projectId,
		(res: { ok: boolean; error?: string }) => {
			console.log("Joined project room:", projectId, res)
		},
	)
}

export function leaveProjectRoom(projectId: string) {
	joinedProjectRooms.delete(projectId)
	getSocket()?.emit(SOCKET_EVENTS.PROJECT_LEAVE, projectId)
}

export type { AppSocket, ServerToClientEvents } from "@/lib/socketTypes"
