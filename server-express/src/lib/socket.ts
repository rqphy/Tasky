import type { Server } from "socket.io"
import type {
	ServerBroadcastEvent,
	SocketEventPayloadMap,
} from "./socketPayloads.js"

let io: Server | null = null
const socketsByUserId = new Map<string, Set<string>>()

export function setSocketServer(server: Server) {
	io = server
}

export function registerUserSocket(userId: string, socketId: string) {
	if (!socketsByUserId.has(userId)) socketsByUserId.set(userId, new Set())
	socketsByUserId.get(userId)!.add(socketId)
}

export function unregisterUserSocket(userId: string, socketId: string) {
	const set = socketsByUserId.get(userId)
	if (!set) return
	set.delete(socketId)
	if (set.size === 0) socketsByUserId.delete(userId)
}

export function projectRoom(projectId: string) {
	return `project:${projectId}`
}

export function emitToProjectExceptUser<E extends ServerBroadcastEvent>(
	projectId: string,
	excludeUserId: string,
	event: E,
	payload: SocketEventPayloadMap[E],
): void {
	const excludeSocketIds = [...(socketsByUserId.get(excludeUserId) ?? [])]
	io?.to(projectRoom(projectId)).except(excludeSocketIds).emit(event, payload)
}
