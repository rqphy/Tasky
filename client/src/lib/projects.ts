import { api } from "./api"

export type ProjectRole = "OWNER" | "MEMBER" | "VIEWER"

export interface ProjectMember {
	id: string
	userId: string
	projectId: string
	role: ProjectRole
	createdAt: string
	user?: {
		id: string
		name: string
		email: string
	}
}

export interface Task {
	id: string
	columnId: string
	title: string
	description?: string
	assigneeId?: string
	label?: string
	priority: string
	position: number
	createdAt: string
	updatedAt: string
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

export const projectsApi = {
	list: () => api.get<Project[]>("/projects"),

	get: (id: string) => api.get<Project>(`/projects/${id}`),

	create: (data: CreateProjectInput) => api.post<Project>("/projects", data),

	update: (id: string, data: UpdateProjectInput) =>
		api.patch<Project>(`/projects/${id}`, data),

	delete: (id: string) => api.delete(`/projects/${id}`),

	createColumn: (projectId: string, data: CreateColumnInput) =>
		api.post<Column>(`/projects/${projectId}/columns`, data),

	updateColumn: (projectId: string, columnId: string, data: UpdateColumnInput) =>
		api.patch<Column>(`/projects/${projectId}/columns/${columnId}`, data),

	deleteColumn: (projectId: string, columnId: string) =>
		api.delete(`/projects/${projectId}/columns/${columnId}`),

	reorderColumns: (projectId: string, columnIds: string[]) =>
		api.post(`/projects/${projectId}/columns/reorder`, { columnIds }),
}
