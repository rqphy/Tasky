import type { Server, Socket } from "socket.io"
import { verifyProjectMember } from "../lib/projectAccess.js"

type Ack = (response: { ok: boolean; error?: string }) => void

function projectRoom(projectId: string) {
	return `project:${projectId}`
}

function registerHandlers(socket: Socket) {
	socket.on(
		"joinProject",
		async (projectId: string, ack?: Ack) => {
			if (typeof projectId !== "string" || !projectId) {
				ack?.({ ok: false, error: "Invalid projectId" })
				return
			}

			const result = await verifyProjectMember(
				projectId,
				socket.data.userId,
			)
			if ("error" in result) {
				ack?.({ ok: false, error: result.error })
				return
			}

			await socket.join(projectRoom(projectId))
			console.log(
				`Socket ${socket.id} joined ${projectRoom(projectId)}`,
			)
			ack?.({ ok: true })
		},
	)

	socket.on("leaveProject", async (projectId: string) => {
		if (typeof projectId !== "string" || !projectId) return
		await socket.leave(projectRoom(projectId))
		console.log(`Socket ${socket.id} left ${projectRoom(projectId)}`)
	})
}

export function registerProjectRoomHandlers(io: Server) {
	io.on("connection", (socket) => {
		registerHandlers(socket)
	})
}
