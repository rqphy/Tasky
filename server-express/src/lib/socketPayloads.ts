import { SOCKET_EVENTS } from "./socketEvents.js"
import { userPublicSelect } from "./userHelpers.js"

export type PublicUser = {
	id: string
	name: string
	email: string
	imageUrl: string | null
}

export type BoardTaskPayload = {
	id: string
	columnId: string
	title: string
	description: string | null
	assigneeId: string | null
	label: string | null
	priority: string
	position: number
	createdAt: Date
	updatedAt: Date
	assignee: PublicUser | null
	_count: { comments: number }
}

export type BoardColumnPayload = {
	id: string
	projectId: string
	name: string
	color: string
	position: number
	createdAt: Date
	updatedAt: Date
}

export type BoardMemberPayload = {
	id: string
	userId: string
	projectId: string
	role: string
	createdAt: Date
	user: PublicUser
}

export type TaskCreatedPayload = {
	projectId: string
	task: BoardTaskPayload
}

export type TaskUpdatedPayload = {
	projectId: string
	task: BoardTaskPayload
}

export type TaskDeletedPayload = {
	projectId: string
	taskId: string
}

export type TaskMovedPayload = {
	projectId: string
	taskId: string
	columnId: string
	position: number
}

export type ColumnCreatedPayload = {
	projectId: string
	column: BoardColumnPayload
}

export type ColumnUpdatedPayload = {
	projectId: string
	column: BoardColumnPayload
}

export type ColumnDeletedPayload = {
	projectId: string
	columnId: string
}

export type ColumnReorderedPayload = {
	projectId: string
	columns: { id: string; position: number }[]
}

export type MemberJoinedPayload = {
	projectId: string
	member: BoardMemberPayload
}

export type MemberRemovedPayload = {
	projectId: string
	userId: string
}

export type ProjectUpdatedPayload = {
	projectId: string
	name: string
	emoji: string
	updatedAt: Date
}

export type ProjectDeletedPayload = {
	projectId: string
}

export type NotificationCreatedPayload = {
	id: string
	projectId: string
	type: string
	title: string
	message: string
	timestamp: Date
	isRead: boolean
	actorId: string
	metadata?: {
		taskId: string
		taskTitle: string
		oldStatus?: string
		newStatus?: string
	}
}

export type SocketEventPayloadMap = {
	[SOCKET_EVENTS.PROJECT_UPDATED]: ProjectUpdatedPayload
	[SOCKET_EVENTS.PROJECT_DELETED]: ProjectDeletedPayload
	[SOCKET_EVENTS.TASK_CREATED]: TaskCreatedPayload
	[SOCKET_EVENTS.TASK_UPDATED]: TaskUpdatedPayload
	[SOCKET_EVENTS.TASK_DELETED]: TaskDeletedPayload
	[SOCKET_EVENTS.TASK_MOVED]: TaskMovedPayload
	[SOCKET_EVENTS.COLUMN_CREATED]: ColumnCreatedPayload
	[SOCKET_EVENTS.COLUMN_UPDATED]: ColumnUpdatedPayload
	[SOCKET_EVENTS.COLUMN_DELETED]: ColumnDeletedPayload
	[SOCKET_EVENTS.COLUMN_REORDERED]: ColumnReorderedPayload
	[SOCKET_EVENTS.MEMBER_JOINED]: MemberJoinedPayload
	[SOCKET_EVENTS.MEMBER_REMOVED]: MemberRemovedPayload
	[SOCKET_EVENTS.NOTIFICATION_CREATED]: NotificationCreatedPayload
}

export type ServerBroadcastEvent = keyof SocketEventPayloadMap

export const boardTaskInclude = {
	assignee: { select: userPublicSelect },
	_count: { select: { comments: true } },
} as const
