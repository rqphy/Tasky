import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { SOCKET_URL } from "./config"

export function createSocketClient(token: string) {
    return io(SOCKET_URL, {
        auth: {
            token
        },
        autoConnect: false,
        transports: ["websocket"],
        reconnection: false,
    })
}

export function connectSocket(socket: Socket) {
    return new Promise((resolve, reject) => {
        socket.once("connect", () => {resolve(socket)})
        socket.once("connect_error", (error) => {reject(error)})
        socket.connect()
    })
}

export function waitForEvent<T = any>(socket: Socket, event: string, timeout = 1000): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Timed out waiting for event ${event} after ${timeout}ms`))
        }, timeout)

        socket.once(event, (data: T) => {
            clearTimeout(timer)
            resolve(data)
        })
    })
}