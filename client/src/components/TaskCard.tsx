import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import type { TaskLabel } from "@/types/task"

interface TaskCardProps {
	id: string
	title: string
	description?: string
	assignee?: {
		name: string
		avatarUrl?: string
	}
	label?: TaskLabel
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

export function TaskCard({
	id,
	title,
	description,
	assignee,
	label,
}: TaskCardProps) {
	const labelMeta = label ? labelConfig[label] : null

	return (
		<Card className="w-full max-w-sm cursor-pointer transition-shadow hover:shadow-md">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
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

			{assignee && (
				<CardFooter className="pt-0">
					<div className="flex items-center gap-2">
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
				</CardFooter>
			)}
		</Card>
	)
}
