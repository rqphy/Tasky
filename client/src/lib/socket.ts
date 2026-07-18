import { io, type Socket } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"

let socket: Socket | null = null

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
