import type { PublicUserProfile } from "@/types/user"

export type TaskLabel =
	| "bug"
	| "feature"
	| "improvement"
	| "documentation"
	| "chore"

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none"

/** A Kanban column. `id` is used as the task status value. */
export interface Column {
	id: string
	label: string
	/** Tailwind bg-* class for the accent dot, e.g. "bg-violet-500" */
	color: string
}

export interface TaskComment {
	id: string
	authorId: string
	author: string
	imageUrl?: string
	authorProfile?: PublicUserProfile
	body: string
	createdAt: string
}

/** UI task shape used on the Kanban board and in dialogs. */
export interface Task {
	id: string
	title: string
	description?: string
	assignee?: PublicUserProfile
	label?: TaskLabel
	priority?: TaskPriority
	/** Holds the id of the Column this task belongs to */
	status: string
	position: number
	commentCount?: number
	comments?: TaskComment[]
}
