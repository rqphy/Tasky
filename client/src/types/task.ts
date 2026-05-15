export type TaskLabel =
	| "bug"
	| "feature"
	| "improvement"
	| "documentation"
	| "chore"

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none"

export interface TaskComment {
	id: string
	author: string
	avatarUrl?: string
	body: string
	createdAt: string
}
