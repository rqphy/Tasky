import type { ReactNode } from "react"
import type { ProjectMember } from "@/lib/projects"

const MEMBER_MENTION_CLASS = "text-sky-600 dark:text-sky-400 font-medium"
const SELF_MENTION_CLASS = "text-violet-600 dark:text-violet-400 font-semibold"

const WORD_BOUNDARY = /[\s,.!?;:)]/

function getMemberNames(members: ProjectMember[]): string[] {
	return members
		.map((m) => m.user?.name)
		.filter((name): name is string => Boolean(name))
		.sort((a, b) => b.length - a.length)
}

function findMemberMatch(
	text: string,
	memberNames: string[],
): { name: string; rest: string } | null {
	const lower = text.toLowerCase()

	for (const name of memberNames) {
		if (!lower.startsWith(name.toLowerCase())) continue

		const after = text[name.length]
		if (after !== undefined && !WORD_BOUNDARY.test(after)) continue

		return { name, rest: text.slice(name.length) }
	}

	return null
}

function parseMentionSegment(
	segment: string,
	memberNames: string[],
	currentUserName: string | undefined,
	keyPrefix: string,
): ReactNode[] {
	const match = findMemberMatch(segment, memberNames)

	if (!match) {
		return [`@${segment}`]
	}

	const isSelf =
		currentUserName !== undefined &&
		match.name.toLowerCase() === currentUserName.toLowerCase()

	const nodes: ReactNode[] = [
		<span
			key={`${keyPrefix}-mention`}
			className={isSelf ? SELF_MENTION_CLASS : MEMBER_MENTION_CLASS}
		>
			@{match.name}
		</span>,
	]

	if (match.rest) {
		nodes.push(
			...parseSegmentWithMentions(
				match.rest,
				memberNames,
				currentUserName,
				`${keyPrefix}-rest`,
			),
		)
	}

	return nodes
}

function parseSegmentWithMentions(
	segment: string,
	memberNames: string[],
	currentUserName: string | undefined,
	keyPrefix: string,
): ReactNode[] {
	const parts = segment.split("@")
	const nodes: ReactNode[] = [parts[0]]

	for (let i = 1; i < parts.length; i++) {
		nodes.push(
			...parseMentionSegment(
				parts[i],
				memberNames,
				currentUserName,
				`${keyPrefix}-${i}`,
			),
		)
	}

	return nodes
}

export function renderComment(
	text: string,
	members: ProjectMember[],
	currentUserName?: string,
): ReactNode {
	if (!text.includes("@")) return text

	const memberNames = getMemberNames(members)
	const parts = text.split("@")
	const nodes: ReactNode[] = [parts[0]]

	for (let i = 1; i < parts.length; i++) {
		nodes.push(
			...parseMentionSegment(
				parts[i],
				memberNames,
				currentUserName,
				`${i}`,
			),
		)
	}

	return nodes
}
