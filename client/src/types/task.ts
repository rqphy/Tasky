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
	author: string
	avatarUrl?: string
	body: string
	createdAt: string
}
