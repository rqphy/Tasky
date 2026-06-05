import { useState, useEffect } from "react"
import { type Notification } from "@/mocks/notifications"
import {
	getNotificationsForProject,
	getUnreadCountForProject,
	markNotificationAsRead,
	markAllAsReadForProject,
	toggleNotificationRead,
} from "@/lib/notifications"

/**
 * Hook to fetch notifications for a specific project
 * TODO: Replace with API call and WebSocket updates when backend is implemented
 * Future: GET /api/notifications?projectId={id}
 * Future: WebSocket /ws/notifications for real-time updates
 */
export function useNotifications(projectId: string) {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	// Simulate fetching notifications
	useEffect(() => {
		const fetchNotifications = () => {
			const projectNotifications = getNotificationsForProject(projectId)
			const count = getUnreadCountForProject(projectId)
			setNotifications(projectNotifications)
			setUnreadCount(count)
		}

		fetchNotifications()

		// Refresh every 5 seconds to simulate real-time updates
		// TODO: Replace with WebSocket subscription
		const interval = setInterval(fetchNotifications, 5000)

		return () => clearInterval(interval)
	}, [projectId])

	const refresh = () => {
		const projectNotifications = getNotificationsForProject(projectId)
		const count = getUnreadCountForProject(projectId)
		setNotifications(projectNotifications)
		setUnreadCount(count)
	}

	return {
		notifications,
		unreadCount,
		refresh,
	}
}

/**
 * Hook to handle notification read/unread actions
 * TODO: Replace with API calls when backend is implemented
 * Future: PATCH /api/notifications/{id}/read
 * Future: PATCH /api/notifications/mark-all-read?projectId={id}
 */
export function useMarkAsRead() {
	const markAsRead = (notificationId: string, onSuccess?: () => void) => {
		// TODO: Optimistic update + API call
		// Future: await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
		markNotificationAsRead(notificationId)
		onSuccess?.()
	}

	const toggleRead = (notificationId: string, onSuccess?: () => void) => {
		// TODO: Optimistic update + API call
		toggleNotificationRead(notificationId)
		onSuccess?.()
	}

	const markAllAsRead = (projectId: string, onSuccess?: () => void) => {
		// TODO: Optimistic update + API call
		// Future: await fetch(`/api/notifications/mark-all-read?projectId=${projectId}`, { method: 'PATCH' })
		markAllAsReadForProject(projectId)
		onSuccess?.()
	}

	return {
		markAsRead,
		toggleRead,
		markAllAsRead,
	}
}
