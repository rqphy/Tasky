export interface Project {
	id: string
	name: string
	emoji: string
}

export const mockProjects: Project[] = [
	{ id: "p1", name: "Tasky", emoji: "✅" },
	{ id: "p2", name: "Website Redesign", emoji: "🎨" },
	{ id: "p3", name: "Mobile App", emoji: "📱" },
]
