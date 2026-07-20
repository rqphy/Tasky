import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/socketEvents"
import {
	patchProjectDeleted,
	patchProjectUpdated,
} from "@/lib/projectCachePatches"
import type {
	ProjectDeletedPayload,
	ProjectUpdatedPayload,
} from "@/lib/socketPayloads"

export function useGlobalProjectSocketEvents() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { projectId } = useParams<{ projectId?: string }>()

	useEffect(() => {
		const socket = getSocket()
		if (!socket) return

		const onProjectUpdated = (payload: ProjectUpdatedPayload) => {
			patchProjectUpdated(queryClient, payload)
		}

		const onProjectDeleted = (payload: ProjectDeletedPayload) => {
			patchProjectDeleted(queryClient, payload)
			if (projectId === payload.projectId) {
				navigate("/")
			}
		}

		socket.on(SOCKET_EVENTS.PROJECT_UPDATED, onProjectUpdated)
		socket.on(SOCKET_EVENTS.PROJECT_DELETED, onProjectDeleted)

		return () => {
			socket.off(SOCKET_EVENTS.PROJECT_UPDATED, onProjectUpdated)
			socket.off(SOCKET_EVENTS.PROJECT_DELETED, onProjectDeleted)
		}
	}, [queryClient, navigate, projectId])
}
