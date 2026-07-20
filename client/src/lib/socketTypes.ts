import type { Socket } from "socket.io-client"
import type { SocketEventPayloadMap } from "@/lib/socketPayloads"

export type ServerToClientEvents = {
	[K in keyof SocketEventPayloadMap]: (
		payload: SocketEventPayloadMap[K],
	) => void
}

export type ClientToServerEvents = {
	joinProject: (
		projectId: string,
		ack?: (res: { ok: boolean; error?: string }) => void,
	) => void
	leaveProject: (projectId: string) => void
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>
