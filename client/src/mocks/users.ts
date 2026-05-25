export interface User {
	id: string
	name: string
	avatarUrl?: string
}

export const mockUsers: User[] = [
	{ id: "u1", name: "Alice Martin" },
	{ id: "u2", name: "Bob Chen" },
	{ id: "u3", name: "Carol Lee" },
	{ id: "u4", name: "David Kim" },
	{ id: "u5", name: "Eva Rossi" },
]
