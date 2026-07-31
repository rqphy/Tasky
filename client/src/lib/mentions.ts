import type { ProjectMember } from "@/lib/projects"

export interface ActiveMention {
	start: number
	query: string
}

export function getMemberNames(members: ProjectMember[]): string[] {
	return members
		.map((m) => m.user?.name)
		.filter((name): name is string => Boolean(name))
		.sort((a, b) => b.length - a.length)
}

export function getActiveMention(
	text: string,
	cursor: number,
): ActiveMention | null {
	const beforeCursor = text.slice(0, cursor)
	const atIndex = beforeCursor.lastIndexOf("@")
	if (atIndex === -1) return null

	if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1]!)) return null

	const query = beforeCursor.slice(atIndex + 1)
	if (query.includes("\n")) return null

	return { start: atIndex, query }
}

export function filterMembersByQuery(
	members: ProjectMember[],
	query: string,
): ProjectMember[] {
	const normalizedQuery = query.toLowerCase()

	return members.filter((member) => {
		const name = member.user?.name
		if (!name) return false
		if (!normalizedQuery) return true
		return name.toLowerCase().startsWith(normalizedQuery)
	})
}

export function insertMention(
	text: string,
	mention: { start: number; end: number },
	name: string,
): { value: string; cursor: number } {
	const before = text.slice(0, mention.start)
	const after = text.slice(mention.end)
	const inserted = `@${name} `
	const value = before + inserted + after
	const cursor = before.length + inserted.length

	return { value, cursor }
}
