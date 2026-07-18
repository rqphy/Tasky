import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"

export interface TaskMovedEvent {
	projectId: string
	taskId: string
	columnId: string
	position: number
}

export function useProjectSocketEvents(projectId: string | undefined) {
	const queryClient = useQueryClient()

	useEffect(() => {
		if (!projectId) return
		const socket = getSocket()
		if (!socket) return

		const onTaskMoved = (_payload: TaskMovedEvent) => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		}

		socket.on("task:moved", onTaskMoved)
		return () => {
			socket.off("task:moved", onTaskMoved)
		}
	}, [projectId, queryClient])
}
