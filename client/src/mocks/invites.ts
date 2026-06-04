export interface ProjectInvite {
	id: string
	projectId: string
	email: string
	role: "member" | "viewer"
	createdAt: string
}

export const mockInvites: ProjectInvite[] = []
