import type { QueryClient } from "@tanstack/react-query"
import { api } from "./api"
import type { NotificationCreatedPayload } from "./socket-payloads"

export type NotificationType =
	| "task_assigned"
	| "task_comment"
	| "task_status_changed"
	| "project_invite"
	| "member_added"
	| "member_removed"

export interface Notification {
	id: string
	projectId: string
	type: NotificationType
	title: string
	message: string
	timestamp: Date
	isRead: boolean
	actorId?: string
	metadata?: {
		taskId?: string
		taskTitle?: string
		oldStatus?: string
		newStatus?: string
	}
}

export type NotificationDto = Omit<Notification, "timestamp"> & {
	timestamp: string
}

const NOTIFICATION_TYPES = new Set<NotificationType>([
	"task_assigned",
	"task_comment",
	"task_status_changed",
	"project_invite",
	"member_added",
	"member_removed",
])

export function mapNotification(raw: NotificationDto | NotificationCreatedPayload): Notification {
	return {
		...raw,
		type: NOTIFICATION_TYPES.has(raw.type as NotificationType)
			? (raw.type as NotificationType)
			: "task_assigned",
		timestamp: new Date(raw.timestamp),
	}
}

export function getUnreadCountForProject(
	notifications: Notification[],
	projectId: string,
): number {
	return notifications.filter(
		(n) => n.projectId === projectId && !n.isRead,
	).length
}

export const notificationsApi = {
	list: (projectId?: string) =>
		api.get<NotificationDto[]>("/notifications", {
			params: projectId ? { projectId } : undefined,
		}),

	markRead: (notificationId: string) =>
		api.patch<NotificationDto>(`/notifications/${notificationId}/read`),

	markAllRead: (projectId?: string) =>
		api.patch("/notifications/read-all", undefined, {
			params: projectId ? { projectId } : undefined,
		}),
}

export function patchNotificationCreated(
	queryClient: QueryClient,
	notification: Notification,
): void {
	queryClient.setQueryData<Notification[]>(["notifications"], (prev) => {
		if (!prev) return [notification]
		if (prev.some((n) => n.id === notification.id)) return prev
		return [notification, ...prev]
	})
}

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

	const options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
	}
	return date.toLocaleDateString("en-US", options)
}
