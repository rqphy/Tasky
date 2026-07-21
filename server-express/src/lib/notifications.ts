import { prisma } from "./db.js"
import type { Notification, NotificationType } from "../generated/client.js"

export type NotificationEvent =
	| {
			type: "TASK_ASSIGNED"
			taskId: string
			assigneeId: string
			actorId: string
	  }
	| { type: "TASK_COMMENT"; taskId: string; actorId: string }
	| { type: "TASK_STATUS_CHANGED"; taskId: string; actorId: string }

export type NotificationMetadata = {
	taskId: string
	taskTitle: string
	oldColumnName?: string
	newColumnName?: string
}

export type CreateNotificationInput = {
	recipientId: string
	projectId: string
	type: NotificationType
	actorId: string
	actorName: string
	taskId: string
	taskTitle: string
	oldColumnName?: string
	newColumnName?: string
}

function buildNotificationContent(input: CreateNotificationInput): {
	title: string
	message: string
} {
	switch (input.type) {
		case "TASK_ASSIGNED":
			return {
				title: "New task assigned",
				message: `${input.actorName} assigned you to '${input.taskTitle}'`,
			}
		case "TASK_COMMENT":
			return {
				title: "New comment on your task",
				message: `${input.actorName} commented on '${input.taskTitle}'`,
			}
		case "TASK_STATUS_CHANGED":
			return {
				title: "Task status updated",
				message: `${input.actorName} moved '${input.taskTitle}' to ${input.newColumnName}`,
			}
	}
}

export async function getRecipients(
	event: NotificationEvent,
): Promise<string[]> {
	switch (event.type) {
		case "TASK_ASSIGNED": {
			if (!event.assigneeId || event.assigneeId === event.actorId) {
				return []
			}
			return [event.assigneeId]
		}
		case "TASK_COMMENT": {
			const task = await prisma.task.findUnique({
				where: { id: event.taskId },
				select: {
					assigneeId: true,
					comments: { select: { authorId: true } },
				},
			})
			if (!task) return []

			const recipients = new Set<string>()
			if (task.assigneeId) recipients.add(task.assigneeId)
			for (const comment of task.comments) {
				recipients.add(comment.authorId)
			}
			recipients.delete(event.actorId)
			return [...recipients]
		}
		case "TASK_STATUS_CHANGED": {
			const task = await prisma.task.findUnique({
				where: { id: event.taskId },
				select: { assigneeId: true },
			})
			if (!task?.assigneeId || task.assigneeId === event.actorId) {
				return []
			}
			return [task.assigneeId]
		}
	}
}

export async function createNotification(
	input: CreateNotificationInput,
): Promise<Notification> {
	const { title, message } = buildNotificationContent(input)

	const metadata: NotificationMetadata = {
		taskId: input.taskId,
		taskTitle: input.taskTitle,
	}
	if (input.oldColumnName) metadata.oldColumnName = input.oldColumnName
	if (input.newColumnName) metadata.newColumnName = input.newColumnName

	return prisma.notification.create({
		data: {
			userId: input.recipientId,
			projectId: input.projectId,
			type: input.type,
			title,
			message,
			actorId: input.actorId,
			taskId: input.taskId,
			metadata,
		},
	})
}

export async function dispatchTaskNotifications(
	event: NotificationEvent,
	context: {
		projectId: string
		actorName: string
		taskId: string
		taskTitle: string
		oldColumnName?: string
		newColumnName?: string
	},
): Promise<void> {
	const recipients = await getRecipients(event)
	await Promise.all(
		recipients.map((recipientId) =>
			createNotification({
				recipientId,
				projectId: context.projectId,
				type: event.type,
				actorId: event.actorId,
				actorName: context.actorName,
				taskId: context.taskId,
				taskTitle: context.taskTitle,
				oldColumnName: context.oldColumnName,
				newColumnName: context.newColumnName,
			}),
		),
	)
}
