import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMentionAutocomplete } from "@/hooks/useMentionAutocomplete"
import { getInitials } from "@/lib/user"
import type { ProjectMember } from "@/lib/projects"

interface CommentTextareaProps {
	value: string
	onChange: (value: string) => void
	members: ProjectMember[]
	onSubmit: () => void
	disabled?: boolean
	placeholder?: string
}

export function CommentTextarea({
	value,
	onChange,
	members,
	onSubmit,
	disabled = false,
	placeholder = "Leave a comment… (⌘↵ to send)",
}: CommentTextareaProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [cursor, setCursor] = useState(0)

	const {
		mentionOpen,
		filteredMembers,
		highlightIndex,
		setHighlightIndex,
		selectMember,
		handleKeyDown: handleMentionKeyDown,
	} = useMentionAutocomplete({
		value,
		onChange,
		members,
		textareaRef,
		cursor,
	})

	function syncCursor() {
		const textarea = textareaRef.current
		if (textarea) setCursor(textarea.selectionStart)
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		handleMentionKeyDown(e)
		if (e.defaultPrevented) return

		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			onSubmit()
		}
	}

	return (
		<div className="relative flex-1 space-y-0">
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => {
					onChange(e.target.value)
					setCursor(e.target.selectionStart)
				}}
				onKeyDown={handleKeyDown}
				onKeyUp={syncCursor}
				onClick={syncCursor}
				onSelect={syncCursor}
				disabled={disabled}
				placeholder={placeholder}
				rows={3}
				className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-50"
			/>

			{mentionOpen && (
				<ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
					{filteredMembers.map((member, index) => {
						const user = member.user
						if (!user?.name) return null

						const isHighlighted = index === highlightIndex

						return (
							<li key={member.userId}>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onMouseEnter={() => setHighlightIndex(index)}
									onClick={() => selectMember(user.name)}
									className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
										isHighlighted
											? "bg-muted font-medium"
											: "hover:bg-muted/60"
									}`}
								>
									<Avatar className="size-6">
										{user.imageUrl && (
											<AvatarImage
												src={user.imageUrl}
												alt={user.name}
											/>
										)}
										<AvatarFallback className="text-[10px]">
											{getInitials(user.name)}
										</AvatarFallback>
									</Avatar>
									<span>{user.name}</span>
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
