export type TaskLabel =
	| "bug"
	| "feature"
	| "improvement"
	| "documentation"
	| "chore"

export interface TaskComment {
	id: string
	author: string
	avatarUrl?: string
	body: string
	createdAt: string
}
