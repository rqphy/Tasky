import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/socketEvents"

export function useProjectSocketEvents(projectId: string | undefined) {
	const queryClient = useQueryClient()

	useEffect(() => {
		if (!projectId) return
		const socket = getSocket()
		if (!socket) return

		const invalidateProject = () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		}

		const invalidateMembers = () => {
			invalidateProject()
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "members"],
			})
			queryClient.invalidateQueries({ queryKey: ["projects"] })
		}

		const onTaskCreated = () => invalidateProject()
		const onTaskUpdated = () => invalidateProject()
		const onTaskDeleted = () => invalidateProject()
		const onTaskMoved = () => invalidateProject()
		const onColumnCreated = () => invalidateProject()
		const onColumnUpdated = () => invalidateProject()
		const onColumnDeleted = () => invalidateProject()
		const onColumnReordered = () => invalidateProject()

		const onMemberJoined = () => invalidateMembers()
		const onMemberRemoved = () => invalidateMembers()

		socket.on(SOCKET_EVENTS.TASK_CREATED, onTaskCreated)
		socket.on(SOCKET_EVENTS.TASK_UPDATED, onTaskUpdated)
		socket.on(SOCKET_EVENTS.TASK_DELETED, onTaskDeleted)
		socket.on(SOCKET_EVENTS.TASK_MOVED, onTaskMoved)
		socket.on(SOCKET_EVENTS.COLUMN_CREATED, onColumnCreated)
		socket.on(SOCKET_EVENTS.COLUMN_UPDATED, onColumnUpdated)
		socket.on(SOCKET_EVENTS.COLUMN_DELETED, onColumnDeleted)
		socket.on(SOCKET_EVENTS.COLUMN_REORDERED, onColumnReordered)

		socket.on(SOCKET_EVENTS.MEMBER_JOINED, onMemberJoined)
		socket.on(SOCKET_EVENTS.MEMBER_REMOVED, onMemberRemoved)

		return () => {
			socket.off(SOCKET_EVENTS.TASK_CREATED, onTaskCreated)
			socket.off(SOCKET_EVENTS.TASK_UPDATED, onTaskUpdated)
			socket.off(SOCKET_EVENTS.TASK_DELETED, onTaskDeleted)
			socket.off(SOCKET_EVENTS.TASK_MOVED, onTaskMoved)
			socket.off(SOCKET_EVENTS.COLUMN_CREATED, onColumnCreated)
			socket.off(SOCKET_EVENTS.COLUMN_UPDATED, onColumnUpdated)
			socket.off(SOCKET_EVENTS.COLUMN_DELETED, onColumnDeleted)
			socket.off(SOCKET_EVENTS.COLUMN_REORDERED, onColumnReordered)

			socket.off(SOCKET_EVENTS.MEMBER_JOINED, onMemberJoined)
			socket.off(SOCKET_EVENTS.MEMBER_REMOVED, onMemberRemoved)
		}
	}, [projectId, queryClient])
}
