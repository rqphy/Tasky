import { mockNotifications, type Notification } from "@/mocks/notifications"

/**
 * Get the count of unread notifications for a specific project
 */
export function getUnreadCountForProject(projectId: string): number {
	return mockNotifications.filter(
		(n) => n.projectId === projectId && !n.isRead
	).length
}

/**
 * Get all unread notifications for a specific project
 */
export function getUnreadNotifications(projectId: string): Notification[] {
	return mockNotifications
		.filter((n) => n.projectId === projectId && !n.isRead)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get all read notifications for a specific project
 */
export function getReadNotifications(projectId: string): Notification[] {
	return mockNotifications
		.filter((n) => n.projectId === projectId && n.isRead)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get all notifications for a specific project
 */
export function getNotificationsForProject(projectId: string): Notification[] {
	return mockNotifications
		.filter((n) => n.projectId === projectId)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Mark a notification as read
 * TODO: Replace with API call when backend is implemented
 */
export function markNotificationAsRead(notificationId: string): void {
	const notification = mockNotifications.find((n) => n.id === notificationId)
	if (notification) {
		notification.isRead = true
	}
}

/**
 * Toggle notification read status
 * TODO: Replace with API call when backend is implemented
 */
export function toggleNotificationRead(notificationId: string): void {
	const notification = mockNotifications.find((n) => n.id === notificationId)
	if (notification) {
		notification.isRead = !notification.isRead
	}
}

/**
 * Mark all notifications as read for a specific project
 * TODO: Replace with API call when backend is implemented
 */
export function markAllAsReadForProject(projectId: string): void {
	mockNotifications.forEach((notification) => {
		if (notification.projectId === projectId) {
			notification.isRead = true
		}
	})
}

/**
 * Format timestamp as relative time
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

	if (diffInSeconds < 60) {
		return "Just now"
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60)
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
	}

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
	}

	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays === 1) {
		return "Yesterday"
	}

	if (diffInDays < 7) {
		return `${diffInDays} days ago`
	}

	// For older dates, show formatted date
	const options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
	}
	return date.toLocaleDateString("en-US", options)
}
