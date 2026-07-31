import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TaskLabel, TaskPriority } from "@/types/task"
import type { PublicUserProfile } from "@/types/user"
import { labelConfig } from "@/lib/labels"
import { priorityConfig } from "@/lib/priority"
import { getInitials } from "@/lib/user"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	MoreVerticalIcon,
	MessageMultiple01Icon,
} from "@hugeicons/core-free-icons"

interface TaskCardProps {
	id: string
	title: string
	description?: string
	assignee?: PublicUserProfile
	label?: TaskLabel
	priority?: TaskPriority
	commentCount?: number
	readOnly?: boolean
	onOpen?: () => void
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	onAttribute?: (id: string) => void
}

export function TaskCard({
	id,
	title,
	description,
	assignee,
	label,
	priority,
	commentCount = 0,
	readOnly = false,
	onOpen,
	onEdit,
	onDelete,
	onAttribute,
}: TaskCardProps) {
	const labelMeta = label ? labelConfig[label] : null

	return (
		<Card
			className={
				readOnly
					? "w-full max-w-sm"
					: "w-full max-w-sm cursor-pointer transition-shadow hover:shadow-md"
			}
			onClick={readOnly ? undefined : () => onOpen?.()}
		>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-1.5">
							{priority &&
								priority !== "none" &&
								(() => {
									const p = priorityConfig[priority]
									return (
										<div
											className={`flex items-center gap-1 ${p.color}`}
										>
											<span
												className={`size-1.5 rounded-full shrink-0 ${p.dotColor}`}
											/>
											<span className="text-[10px] font-medium">
												{p.label}
											</span>
										</div>
									)
								})()}
							{labelMeta && (
								<Badge
									variant="outline"
									className={labelMeta.className}
								>
									{labelMeta.text}
								</Badge>
							)}
						</div>
					</div>
					<CardTitle className="text-sm font-semibold leading-snug">
						{title}
					</CardTitle>
				</CardHeader>

				{description && (
					<CardContent className="pb-3">
						<p className="text-xs text-muted-foreground line-clamp-2">
							{description}
						</p>
					</CardContent>
				)}

				<CardFooter className="pt-0 flex items-center justify-between">
					{assignee ? (
						<div className="flex items-center gap-2">
							<Avatar className="size-6">
								{assignee.imageUrl && (
									<AvatarImage
										src={assignee.imageUrl}
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
					) : (
						<span className="text-xs text-muted-foreground/50 italic">
							Unassigned
						</span>
					)}

					<div className="flex items-center gap-1">
						{commentCount > 0 && (
							<div className="flex items-center gap-1 text-muted-foreground mr-1">
								<HugeiconsIcon
									icon={MessageMultiple01Icon}
									size={13}
								/>
								<span className="text-xs">{commentCount}</span>
							</div>
						)}

						{!readOnly && (
							<DropdownMenu>
								<DropdownMenuTrigger
									className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={(e) => e.stopPropagation()}
								>
									<HugeiconsIcon
										icon={MoreVerticalIcon}
										size={16}
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation()
											onEdit?.(id)
										}}
									>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation()
											onAttribute?.(id)
										}}
									>
										Assign
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onClick={(e) => {
											e.stopPropagation()
											onDelete?.(id)
										}}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</CardFooter>
		</Card>
	)
}
