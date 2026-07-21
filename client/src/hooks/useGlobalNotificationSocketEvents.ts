import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/socketEvents"
import {
	mapNotification,
	patchNotificationCreated,
} from "@/lib/notifications"
import type { NotificationCreatedPayload } from "@/lib/socketPayloads"

export function useGlobalNotificationSocketEvents() {
	const queryClient = useQueryClient()

	useEffect(() => {
		const socket = getSocket()
		if (!socket) return

		const onNotificationCreated = (payload: NotificationCreatedPayload) => {
			patchNotificationCreated(queryClient, mapNotification(payload))
		}

		socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotificationCreated)

		return () => {
			socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotificationCreated)
		}
	}, [queryClient])
}
