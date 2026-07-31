import { useCallback, useEffect, useMemo, useState } from "react"
import type { ProjectMember } from "@/lib/projects"
import {
	filterMembersByQuery,
	getActiveMention,
	insertMention,
} from "@/lib/mentions"

interface UseMentionAutocompleteOptions {
	value: string
	onChange: (value: string) => void
	members: ProjectMember[]
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	cursor: number
}

export function useMentionAutocomplete({
	value,
	onChange,
	members,
	textareaRef,
	cursor,
}: UseMentionAutocompleteOptions) {
	const [highlightIndex, setHighlightIndex] = useState(0)
	const [dismissed, setDismissed] = useState(false)

	const activeMention = useMemo(
		() => getActiveMention(value, cursor),
		[value, cursor],
	)

	const filteredMembers = useMemo(
		() =>
			activeMention
				? filterMembersByQuery(members, activeMention.query)
				: [],
		[activeMention, members],
	)

	const mentionOpen =
		!dismissed && activeMention !== null && filteredMembers.length > 0

	useEffect(() => {
		setHighlightIndex(0)
		setDismissed(false)
	}, [activeMention?.start, activeMention?.query])

	const selectMember = useCallback(
		(name: string) => {
			if (!activeMention) return

			const { value: nextValue, cursor: nextCursor } = insertMention(
				value,
				{ start: activeMention.start, end: cursor },
				name,
			)

			onChange(nextValue)
			setDismissed(true)

			requestAnimationFrame(() => {
				const textarea = textareaRef.current
				if (!textarea) return
				textarea.focus()
				textarea.setSelectionRange(nextCursor, nextCursor)
			})
		},
		[activeMention, cursor, onChange, textareaRef, value],
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (mentionOpen) {
				if (e.key === "ArrowDown") {
					e.preventDefault()
					setHighlightIndex(
						(prev) => (prev + 1) % filteredMembers.length,
					)
					return
				}

				if (e.key === "ArrowUp") {
					e.preventDefault()
					setHighlightIndex(
						(prev) =>
							(prev - 1 + filteredMembers.length) %
							filteredMembers.length,
					)
					return
				}

				if (e.key === "Enter" || e.key === "Tab") {
					e.preventDefault()
					const selected = filteredMembers[highlightIndex]
					const name = selected?.user?.name
					if (name) selectMember(name)
					return
				}

				if (e.key === "Escape") {
					e.preventDefault()
					setDismissed(true)
					return
				}
			}
		},
		[filteredMembers, highlightIndex, mentionOpen, selectMember],
	)

	return {
		mentionOpen,
		filteredMembers,
		highlightIndex,
		setHighlightIndex,
		selectMember,
		handleKeyDown,
	}
}
