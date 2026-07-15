import { api } from "./api"
import type { ProjectMember, ProjectRole } from "./projects"

export interface ProjectInvite {
	id: string
	projectId: string
	email: string
	role: ProjectRole
	status: "PENDING" | "ACCEPTED" | "REVOKED"
	expiresAt: string
	createdAt: string
	invitedBy: {
		id: string
		name: string
		email: string
	}
}

export interface CreateInviteResponse extends ProjectInvite {
	token: string
	emailSent: boolean
}

export interface InviteValidation {
	valid: boolean
	reason?: string
	project?: {
		id: string
		name: string
		emoji: string
	}
	email?: string
	role?: string
	expiresAt?: string
}

export interface AcceptInviteResponse {
	member: ProjectMember
	project: {
		id: string
		name: string
		emoji: string
	}
}

export interface CreateInviteInput {
	email: string
}

export const invitesApi = {
	createInvite: (projectId: string, data: CreateInviteInput) =>
		api
			.post<CreateInviteResponse>(`/projects/${projectId}/invites`, {
				email: data.email,
				role: "MEMBER",
			})
			.then((response) => response.data),

	listInvites: (projectId: string) =>
		api
			.get<ProjectInvite[]>(`/projects/${projectId}/invites`)
			.then((response) => response.data),

	revokeInvite: (projectId: string, inviteId: string) =>
		api.delete(`/projects/${projectId}/invites/${inviteId}`),

	validateInvite: (token: string) =>
		api
			.get<InviteValidation>("/invites/validate", {
				params: { token },
			})
			.then((response) => response.data),

	acceptInvite: (token: string) =>
		api
			.post<AcceptInviteResponse>("/invites/accept", { token })
			.then((response) => response.data),
}
