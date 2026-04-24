import type { TaskLabel } from "@/types/task"

export interface Task {
	id: string
	title: string
	description?: string
	assignee?: {
		name: string
		avatarUrl?: string
	}
	label?: TaskLabel
}

export const mockTasks: Task[] = [
	{
		id: "TSK-001",
		title: "Set up authentication with OAuth",
		description:
			"Integrate GitHub OAuth so users can sign in without a password. Should support refresh tokens.",
		assignee: { name: "Alice Martin" },
		label: "feature",
	},
	{
		id: "TSK-002",
		title: "Fix card drag-and-drop on mobile",
		description:
			"Cards can't be dragged on touch screens. Investigate pointer events.",
		assignee: { name: "Bob Chen" },
		label: "bug",
	},
	{
		id: "TSK-003",
		title: "Write API documentation",
		label: "documentation",
	},
]
