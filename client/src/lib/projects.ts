import { api } from "./api"
import type { TaskComment } from "@/types/task"
import type { PublicUserProfile } from "@/types/user"

export type ProjectRole = "OWNER" | "MEMBER" | "VIEWER"

export interface ProjectMember {
	id: string
	userId: string
	projectId: string
	role: ProjectRole
	createdAt: string
	user?: PublicUserProfile
}

export interface Task {
	id: string
	columnId: string
	title: string
	description?: string
	assigneeId?: string
	assignee?: PublicUserProfile
	label?: string
	priority: string
	position: number
	createdAt: string
	updatedAt: string
	comments?: Comment[]
	_count?: { comments: number }
}

export interface Comment {
	id: string
	content: string
	taskId: string
	authorId: string
	createdAt: string
	author: PublicUserProfile
}

export interface Column {
	id: string
	projectId: string
	name: string
	color: string
	position: number
	createdAt: string
	updatedAt: string
	tasks?: Task[]
}

export interface Project {
	id: string
	name: string
	emoji: string
	ownerId: string
	createdAt: string
	updatedAt: string
	members?: ProjectMember[]
	columns?: Column[]
}

export interface CreateProjectInput {
	name: string
	emoji?: string
}

export interface UpdateProjectInput {
	name?: string
	emoji?: string
}

export interface CreateColumnInput {
	name: string
	color?: string
}

export interface UpdateColumnInput {
	name?: string
	color?: string
}

export type TaskLabel =
	| "BUG"
	| "FEATURE"
	| "IMPROVEMENT"
	| "DOCUMENTATION"
	| "CHORE"

export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE"

export interface CreateTaskInput {
	columnId: string
	title: string
	description?: string
	assigneeId?: string
	label?: TaskLabel
	priority?: TaskPriority
}

export interface UpdateTaskInput {
	columnId?: string
	title?: string
	description?: string
	assigneeId?: string | null
	label?: TaskLabel | null
	priority?: TaskPriority
}

export interface MoveTaskInput {
	columnId: string
	position: number
}

export interface CreateCommentInput {
	content: string
}

export function mapComment(comment: Comment): TaskComment {
	return {
		id: comment.id,
		authorId: comment.authorId,
		author: comment.author.name,
		imageUrl: comment.author.imageUrl ?? undefined,
		authorProfile: comment.author,
		body: comment.content,
		createdAt: comment.createdAt,
	}
}

export function patchTaskCount(
	project: Project,
	taskId: string,
	delta: number,
): Project {
	if (!project.columns) return project

	return {
		...project,
		columns: project.columns.map((column) => ({
			...column,
			tasks: column.tasks?.map((task) =>
				task.id === taskId
					? {
							...task,
							_count: {
								comments: Math.max(
									0,
									(task._count?.comments ?? 0) + delta,
								),
							},
						}
					: task,
			),
		})),
	}
}

export const projectsApi = {
	list: () => api.get<Project[]>("/projects"),

	get: (id: string) => api.get<Project>(`/projects/${id}`),

	getMembers: (id: string) =>
		api.get<ProjectMember[]>(`/projects/${id}/members`),

	create: (data: CreateProjectInput) => api.post<Project>("/projects", data),

	update: (id: string, data: UpdateProjectInput) =>
		api.patch<Project>(`/projects/${id}`, data),

	delete: (id: string) => api.delete(`/projects/${id}`),

	removeMember: (projectId: string, userId: string) =>
		api.delete(`/projects/${projectId}/members/${userId}`),

	transferOwnership: (projectId: string, userId: string) =>
		api.post<{ id: string; name: string; emoji: string; ownerId: string }>(
			`/projects/${projectId}/transfer-ownership`,
			{ userId },
		),

	createColumn: (projectId: string, data: CreateColumnInput) =>
		api.post<Column>(`/projects/${projectId}/columns`, data),

	updateColumn: (projectId: string, columnId: string, data: UpdateColumnInput) =>
		api.patch<Column>(`/projects/${projectId}/columns/${columnId}`, data),

	deleteColumn: (projectId: string, columnId: string) =>
		api.delete(`/projects/${projectId}/columns/${columnId}`),

	reorderColumns: (projectId: string, columnIds: string[]) =>
		api.post(`/projects/${projectId}/columns/reorder`, { columnIds }),

	createTask: (projectId: string, data: CreateTaskInput) =>
		api.post<Task>(`/projects/${projectId}/tasks`, data),

	getTask: (projectId: string, taskId: string) =>
		api.get<Task>(`/projects/${projectId}/tasks/${taskId}`),

	updateTask: (projectId: string, taskId: string, data: UpdateTaskInput) =>
		api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, data),

	moveTask: (projectId: string, taskId: string, data: MoveTaskInput) =>
		api.post<Task>(`/projects/${projectId}/tasks/${taskId}/move`, data),

	deleteTask: (projectId: string, taskId: string) =>
		api.delete(`/projects/${projectId}/tasks/${taskId}`),

	createComment: (
		projectId: string,
		taskId: string,
		data: CreateCommentInput,
	) =>
		api.post<Comment>(
			`/projects/${projectId}/tasks/${taskId}/comments`,
			data,
		),

	deleteComment: (projectId: string, taskId: string, commentId: string) =>
		api.delete(
			`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
		),
}
