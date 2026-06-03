export type ProjectRole = "owner" | "member" | "viewer"

export interface ProjectMember {
	userId: string
	role: ProjectRole
}

export interface Project {
	id: string
	name: string
	emoji: string
	members: ProjectMember[]
}

export const mockProjects: Project[] = [
	{
		id: "p1",
		name: "Tasky",
		emoji: "✅",
		members: [
			{ userId: "u1", role: "owner" },
			{ userId: "u2", role: "member" },
			{ userId: "u3", role: "member" },
			{ userId: "u4", role: "viewer" },
			{ userId: "u5", role: "member" },
			{ userId: "u6", role: "member" },
			{ userId: "u7", role: "viewer" },
			{ userId: "u8", role: "member" },
			{ userId: "u9", role: "member" },
			{ userId: "u10", role: "viewer" },
			{ userId: "u11", role: "member" },
			{ userId: "u12", role: "member" },
			{ userId: "u13", role: "viewer" },
			{ userId: "u14", role: "member" },
			{ userId: "u15", role: "member" },
			{ userId: "u16", role: "viewer" },
			{ userId: "u17", role: "member" },
			{ userId: "u18", role: "member" },
			{ userId: "u19", role: "viewer" },
			{ userId: "u20", role: "member" },
			{ userId: "u21", role: "member" },
			{ userId: "u22", role: "viewer" },
			{ userId: "u23", role: "member" },
			{ userId: "u24", role: "member" },
			{ userId: "u25", role: "viewer" },
			{ userId: "u26", role: "member" },
			{ userId: "u27", role: "member" },
			{ userId: "u28", role: "viewer" },
			{ userId: "u29", role: "member" },
			{ userId: "u30", role: "member" },
			{ userId: "u31", role: "viewer" },
			{ userId: "u32", role: "member" },
			{ userId: "u33", role: "member" },
			{ userId: "u34", role: "viewer" },
		],
	},
	{
		id: "p2",
		name: "Website Redesign",
		emoji: "🎨",
		members: [
			{ userId: "u1", role: "owner" },
			{ userId: "u5", role: "member" },
		],
	},
	{
		id: "p3",
		name: "Mobile App",
		emoji: "📱",
		members: [
			{ userId: "u2", role: "owner" },
			{ userId: "u1", role: "member" },
			{ userId: "u3", role: "viewer" },
			{ userId: "u5", role: "viewer" },
		],
	},
]
