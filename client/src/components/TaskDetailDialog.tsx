import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
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
import type { TaskLabel, TaskPriority } from "@/types/task"
import { priorityConfig } from "@/lib/priority"
import { mapComment } from "@/lib/projects"
import {
	useTask,
	useCreateComment,
	useDeleteComment,
} from "@/hooks/useProjects"
import { useAuth } from "@/contexts/AuthContext"

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
	priority?: TaskPriority
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

export function TaskDetailDialog({
	open,
	onOpenChange,
	id,
	title,
	description,
	assignee,
	label,
	priority,
}: TaskDetailDialogProps) {
	const { projectId } = useParams<{ projectId: string }>()
	const { user } = useAuth()
	const { data: task, isLoading } = useTask(projectId, id, open)
	const createComment = useCreateComment(projectId!)
	const deleteComment = useDeleteComment(projectId!)
	const [draft, setDraft] = useState("")

	const comments = (task?.comments ?? []).map(mapComment)
	const labelMeta = label ? labelConfig[label] : null

	useEffect(() => {
		if (!open) setDraft("")
	}, [open])

	function handleAddComment() {
		const trimmed = draft.trim()
		if (!trimmed || !projectId) return

		createComment.mutate(
			{ taskId: id, content: trimmed },
			{ onSuccess: () => setDraft("") },
		)
	}

	function handleDeleteComment(commentId: string) {
		deleteComment.mutate({ taskId: id, commentId })
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleAddComment()
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 overflow-hidden h-[90vh]">
				<DialogHeader className="px-6 pt-6 pb-4 shrink-0">
					<span className="text-xs font-mono text-muted-foreground">
						TSK: {id}
					</span>
					<DialogTitle className="text-lg font-semibold leading-snug mt-0.5">
						{title}
					</DialogTitle>
					<div className="flex items-center gap-3 mt-2 flex-wrap">
						{labelMeta && (
							<Badge
								variant="outline"
								className={labelMeta.className}
							>
								{labelMeta.text}
							</Badge>
						)}
						{priority &&
							priority !== "none" &&
							(() => {
								const p = priorityConfig[priority]
								return (
									<div
										className={`flex items-center gap-1.5 ${p.color}`}
									>
										<span
											className={`size-2 rounded-full shrink-0 ${p.dotColor}`}
										/>
										<span className="text-xs font-medium">
											{p.label}
										</span>
									</div>
								)
							})()}
						{assignee && (
							<div className="flex items-center gap-2">
								<Avatar className="size-5">
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
					</div>
				</DialogHeader>

				<Separator />

				<ScrollArea className="flex-1 min-h-0">
					<div className="px-6 py-5 space-y-6">
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

						<section>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
								Comments{" "}
								{comments.length > 0 && (
									<span className="text-muted-foreground/60">
										· {comments.length}
									</span>
								)}
							</h3>

							{isLoading ? (
								<p className="text-sm text-muted-foreground italic mb-4">
									Loading comments…
								</p>
							) : comments.length === 0 ? (
								<p className="text-sm text-muted-foreground italic mb-4">
									No comments yet. Be the first!
								</p>
							) : null}

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
												{comment.authorId ===
													user?.id && (
													<button
														type="button"
														onClick={() =>
															handleDeleteComment(
																comment.id,
															)
														}
														disabled={
															deleteComment.isPending
														}
														className="ml-auto text-[10px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
													>
														Delete
													</button>
												)}
											</div>
											<p className="text-sm text-foreground leading-relaxed">
												{comment.body}
											</p>
										</div>
									</li>
								))}
							</ul>

							<div className="flex gap-3 items-start">
								<Avatar className="size-7 shrink-0 mt-0.5">
									<AvatarFallback className="text-[10px]">
										{getInitials(user?.name ?? "")}
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
											disabled={
												!draft.trim() ||
												createComment.isPending
											}
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
