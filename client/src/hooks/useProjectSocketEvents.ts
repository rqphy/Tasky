import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/socket-events"
import {
	patchColumnCreated,
	patchColumnDeleted,
	patchColumnReordered,
	patchColumnUpdated,
	patchMemberJoined,
	patchMemberRemoved,
	patchTaskCreated,
	patchTaskDeleted,
	patchTaskMoved,
	patchTaskUpdated,
} from "@/lib/project-cache-patches"
import type {
	ColumnCreatedPayload,
	ColumnDeletedPayload,
	ColumnReorderedPayload,
	ColumnUpdatedPayload,
	MemberJoinedPayload,
	MemberRemovedPayload,
	TaskCreatedPayload,
	TaskDeletedPayload,
	TaskMovedPayload,
	TaskUpdatedPayload,
} from "@/lib/socket-payloads"

export function useProjectSocketEvents(projectId: string | undefined) {
	const queryClient = useQueryClient()

	useEffect(() => {
		if (!projectId) return
		const socket = getSocket()
		if (!socket) return

		const onTaskCreated = (payload: TaskCreatedPayload) => {
			patchTaskCreated(queryClient, payload)
		}
		const onTaskUpdated = (payload: TaskUpdatedPayload) => {
			patchTaskUpdated(queryClient, payload)
		}
		const onTaskDeleted = (payload: TaskDeletedPayload) => {
			patchTaskDeleted(queryClient, payload)
		}
		const onTaskMoved = (payload: TaskMovedPayload) => {
			patchTaskMoved(queryClient, payload)
		}
		const onColumnCreated = (payload: ColumnCreatedPayload) => {
			patchColumnCreated(queryClient, payload)
		}
		const onColumnUpdated = (payload: ColumnUpdatedPayload) => {
			patchColumnUpdated(queryClient, payload)
		}
		const onColumnDeleted = (payload: ColumnDeletedPayload) => {
			patchColumnDeleted(queryClient, payload)
		}
		const onColumnReordered = (payload: ColumnReorderedPayload) => {
			patchColumnReordered(queryClient, payload)
		}
		const onMemberJoined = (payload: MemberJoinedPayload) => {
			patchMemberJoined(queryClient, payload)
		}
		const onMemberRemoved = (payload: MemberRemovedPayload) => {
			patchMemberRemoved(queryClient, payload)
		}

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
