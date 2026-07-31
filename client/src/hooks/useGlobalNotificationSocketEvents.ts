import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/socket-events"
import {
	mapNotification,
	patchNotificationCreated,
} from "@/lib/notifications"
import type { NotificationCreatedPayload } from "@/lib/socket-payloads"

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
