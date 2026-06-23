import type { TaskLabel, TaskPriority, TaskComment } from "@/types/task"

export interface Task {
	id: string
	title: string
	description?: string
	assignee?: {
		id?: string
		name: string
		avatarUrl?: string
	}
	label?: TaskLabel
	priority?: TaskPriority
	/** Holds the id of the Column this task belongs to */
	status: string
	position: number
	comments?: TaskComment[]
}

export const mockTasks: Task[] = [
	{
		id: "TSK-001",
		title: "Set up authentication with OAuth",
		description:
			"Integrate GitHub OAuth so users can sign in without a password. Should support refresh tokens and silent refresh. We also need to handle edge cases like expired sessions gracefully — ideally redirect to a login screen with a friendly message rather than a blank error page.",
		assignee: { name: "Alice Martin" },
		label: "feature",
		priority: "urgent",
		status: "progress",
		position: 1,
		comments: [
			{
				id: "c1",
				author: "Bob Chen",
				body: "Should we also support Google OAuth in the first iteration, or keep it GitHub-only for now?",
				createdAt: "2026-04-22T09:15:00Z",
			},
			{
				id: "c2",
				author: "Alice Martin",
				body: "Let's keep it GitHub-only for the MVP. We can add Google later behind a feature flag.",
				createdAt: "2026-04-22T10:02:00Z",
			},
			{
				id: "c3",
				author: "Carol Lee",
				body: "Reminder: refresh token rotation must be enabled in the GitHub app settings, otherwise silent refresh won't work.",
				createdAt: "2026-04-23T14:30:00Z",
			},
			{
				id: "c4",
				author: "Carol Lee",
				body: "Reminder: refresh token rotation must be enabled in the GitHub app settings, otherwise silent refresh won't work.",
				createdAt: "2026-04-23T15:30:00Z",
			},
			{
				id: "c5",
				author: "Carol Lee",
				body: "Reminder: refresh token rotation must be enabled in the GitHub app settings, otherwise silent refresh won't work.",
				createdAt: "2026-04-23T16:30:00Z",
			},
		],
	},
	{
		id: "TSK-002",
		title: "Fix card drag-and-drop on mobile",
		description:
			"Cards can't be dragged on touch screens. Investigate pointer events and consider using a touch-friendly DnD library.",
		assignee: { name: "Bob Chen" },
		label: "bug",
		priority: "high",
		status: "incoming",
		position: 1,
		comments: [
			{
				id: "c4",
				author: "Alice Martin",
				body: "I can reproduce this on iOS 17 with Safari. Chrome Android seems fine.",
				createdAt: "2026-04-23T11:00:00Z",
			},
		],
	},
	{
		id: "TSK-003",
		title: "Write API documentation",
		label: "documentation",
		priority: "low",
		status: "done",
		position: 1,
	},
]
