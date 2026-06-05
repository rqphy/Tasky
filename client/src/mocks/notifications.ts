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

export const mockNotifications: Notification[] = [
	// Project p1 (Tasky) - Recent notifications
	{
		id: "n1",
		projectId: "p1",
		type: "task_assigned",
		title: "New task assigned",
		message: "Bob Chen assigned you to 'Implement user authentication'",
		timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
		isRead: false,
		actorId: "u2",
		metadata: {
			taskId: "t1",
			taskTitle: "Implement user authentication",
		},
	},
	{
		id: "n2",
		projectId: "p1",
		type: "task_comment",
		title: "New comment on your task",
		message: "Carol Lee commented on 'Design homepage mockups'",
		timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
		isRead: false,
		actorId: "u3",
		metadata: {
			taskId: "t2",
			taskTitle: "Design homepage mockups",
		},
	},
	{
		id: "n3",
		projectId: "p1",
		type: "task_status_changed",
		title: "Task status updated",
		message: "Eva Rossi moved 'Fix navigation bug' to Done",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
		isRead: false,
		actorId: "u5",
		metadata: {
			taskId: "t3",
			taskTitle: "Fix navigation bug",
			oldStatus: "progress",
			newStatus: "done",
		},
	},
	{
		id: "n4",
		projectId: "p1",
		type: "member_added",
		title: "New member joined",
		message: "Frank White joined the project",
		timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
		isRead: true,
		actorId: "u1",
		metadata: {},
	},
	{
		id: "n5",
		projectId: "p1",
		type: "task_comment",
		title: "New comment on your task",
		message: "David Kim commented on 'Implement user authentication'",
		timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
		isRead: true,
		actorId: "u4",
		metadata: {
			taskId: "t1",
			taskTitle: "Implement user authentication",
		},
	},
	{
		id: "n6",
		projectId: "p1",
		type: "task_assigned",
		title: "New task assigned",
		message: "Alice Martin assigned you to 'Update documentation'",
		timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
		isRead: true,
		actorId: "u1",
		metadata: {
			taskId: "t4",
			taskTitle: "Update documentation",
		},
	},

	// Project p2 (Website Redesign) - Some notifications
	{
		id: "n7",
		projectId: "p2",
		type: "task_assigned",
		title: "New task assigned",
		message: "Alice Martin assigned you to 'Create color palette'",
		timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
		isRead: false,
		actorId: "u1",
		metadata: {
			taskId: "t5",
			taskTitle: "Create color palette",
		},
	},
	{
		id: "n8",
		projectId: "p2",
		type: "task_status_changed",
		title: "Task status updated",
		message: "Eva Rossi moved 'Design landing page' to In Progress",
		timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
		isRead: false,
		actorId: "u5",
		metadata: {
			taskId: "t6",
			taskTitle: "Design landing page",
			oldStatus: "incoming",
			newStatus: "progress",
		},
	},
	{
		id: "n9",
		projectId: "p2",
		type: "project_invite",
		title: "Project invitation",
		message: "You were invited to join this project",
		timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
		isRead: true,
		actorId: "u1",
		metadata: {},
	},

	// Project p3 (Mobile App) - Few notifications
	{
		id: "n10",
		projectId: "p3",
		type: "task_comment",
		title: "New comment on your task",
		message: "Bob Chen commented on 'Setup React Native environment'",
		timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
		isRead: false,
		actorId: "u2",
		metadata: {
			taskId: "t7",
			taskTitle: "Setup React Native environment",
		},
	},
	{
		id: "n11",
		projectId: "p3",
		type: "member_removed",
		title: "Member left project",
		message: "Carol Lee left the project",
		timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
		isRead: true,
		actorId: "u3",
		metadata: {},
	},
	{
		id: "n12",
		projectId: "p3",
		type: "task_assigned",
		title: "New task assigned",
		message: "Bob Chen assigned you to 'Design app icons'",
		timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
		isRead: true,
		actorId: "u2",
		metadata: {
			taskId: "t8",
			taskTitle: "Design app icons",
		},
	},
]
