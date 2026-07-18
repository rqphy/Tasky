import type { Socket } from "socket.io"
import { verifyAccessToken } from "../lib/jwt.js"

declare module "socket.io" {
	interface SocketData {
		userId: string
	}
}

export function socketAuthMiddleware(
	socket: Socket,
	next: (err?: Error) => void,
): void {
	const token = socket.handshake.auth.token as string | undefined

	if (!token) {
		next(new Error("Unauthorized"))
		return
	}

	const payload = verifyAccessToken(token)
	if (!payload) {
		next(new Error("Unauthorized"))
		return
	}

	socket.data.userId = payload.userId
	next()
}
