import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { TaskLabel } from "@/types/task"
import type { TaskComment } from "@/types/task"

interface TaskDetailDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	id: string
	title: string
	description?: string
	assignee?: {
		name: string
		avatarUrl?: string
	}
	label?: TaskLabel
	initialComments?: TaskComment[]
}

const labelConfig: Record<TaskLabel, { text: string; className: string }> = {
	bug: {
		text: "Bug",
		className:
			"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	feature: {
		text: "Feature",
		className:
			"bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
	},
	improvement: {
		text: "Improvement",
		className:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	documentation: {
		text: "Docs",
		className:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	chore: {
		text: "Chore",
		className:
			"bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
	},
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase()
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

let commentIdCounter = 100

export function TaskDetailDialog({
	open,
	onOpenChange,
	id,
	title,
	description,
	assignee,
	label,
	initialComments = [],
}: TaskDetailDialogProps) {
	const [comments, setComments] = useState<TaskComment[]>(initialComments)
	const [draft, setDraft] = useState("")

	const labelMeta = label ? labelConfig[label] : null

	function handleAddComment() {
		const trimmed = draft.trim()
		if (!trimmed) return
		const newComment: TaskComment = {
			id: `new-${++commentIdCounter}`,
			author: "You",
			body: trimmed,
			createdAt: new Date().toISOString(),
		}
		setComments((prev) => [...prev, newComment])
		setDraft("")
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleAddComment()
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]">
				{/* ── Header ── */}
				<DialogHeader className="px-6 pt-6 pb-4 shrink-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-mono text-muted-foreground">
							{id}
						</span>
						{labelMeta && (
							<Badge
								variant="outline"
								className={labelMeta.className}
							>
								{labelMeta.text}
							</Badge>
						)}
					</div>
					<DialogTitle className="text-lg font-semibold leading-snug">
						{title}
					</DialogTitle>

					{assignee && (
						<div className="flex items-center gap-2 mt-2">
							<Avatar className="size-6">
								{assignee.avatarUrl && (
									<AvatarImage
										src={assignee.avatarUrl}
										alt={assignee.name}
									/>
								)}
								<AvatarFallback className="text-[10px]">
									{getInitials(assignee.name)}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs text-muted-foreground">
								{assignee.name}
							</span>
						</div>
					)}
				</DialogHeader>

				<Separator />

				{/* ── Scrollable body ── */}
				<ScrollArea className="flex-1 min-h-0">
					<div className="px-6 py-5 space-y-6">
						{/* Description */}
						{description ? (
							<section>
								<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
									Description
								</h3>
								<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
									{description}
								</p>
							</section>
						) : (
							<p className="text-sm text-muted-foreground italic">
								No description provided.
							</p>
						)}

						<Separator />

						{/* Comments */}
						<section>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
								Comments{" "}
								{comments.length > 0 && (
									<span className="text-muted-foreground/60">
										· {comments.length}
									</span>
								)}
							</h3>

							{comments.length === 0 && (
								<p className="text-sm text-muted-foreground italic mb-4">
									No comments yet. Be the first!
								</p>
							)}

							<ul className="space-y-4 mb-4">
								{comments.map((comment) => (
									<li key={comment.id} className="flex gap-3">
										<Avatar className="size-7 shrink-0 mt-0.5">
											{comment.avatarUrl && (
												<AvatarImage
													src={comment.avatarUrl}
													alt={comment.author}
												/>
											)}
											<AvatarFallback className="text-[10px]">
												{getInitials(comment.author)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="flex items-baseline gap-2 mb-1">
												<span className="text-xs font-semibold">
													{comment.author}
												</span>
												<span className="text-[10px] text-muted-foreground">
													{formatDate(
														comment.createdAt,
													)}
												</span>
											</div>
											<p className="text-sm text-foreground leading-relaxed">
												{comment.body}
											</p>
										</div>
									</li>
								))}
							</ul>

							{/* Reply input */}
							<div className="flex gap-3 items-start">
								<Avatar className="size-7 shrink-0 mt-0.5">
									<AvatarFallback className="text-[10px]">
										YO
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-2">
									<textarea
										value={draft}
										onChange={(e) =>
											setDraft(e.target.value)
										}
										onKeyDown={handleKeyDown}
										placeholder="Leave a comment… (⌘↵ to send)"
										rows={3}
										className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
									/>
									<div className="flex justify-end">
										<Button
											size="sm"
											onClick={handleAddComment}
											disabled={!draft.trim()}
										>
											Comment
										</Button>
									</div>
								</div>
							</div>
						</section>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
