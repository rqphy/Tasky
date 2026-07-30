import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/user"
import type { PublicUserProfile } from "@/types/user"

function formatJobLine(jobTitle?: string | null, company?: string | null): string | null {
	if (jobTitle && company) return `${jobTitle} at ${company}`
	if (jobTitle) return jobTitle
	if (company) return company
	return null
}

interface UserHoverCardProps {
	user: PublicUserProfile
	avatar?: ReactNode
	className?: string
	nameClassName?: string
}

export function UserHoverCard({
	user,
	avatar,
	className,
	nameClassName,
}: UserHoverCardProps) {
	const jobLine = formatJobLine(user.jobTitle, user.company)

	return (
		<span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
			{avatar}
			<HoverCard openDelay={200} closeDelay={100}>
				<HoverCardTrigger asChild>
					<span
						className={cn(
							"cursor-default truncate hover:underline underline-offset-2",
							nameClassName,
						)}
					>
						{user.name}
					</span>
				</HoverCardTrigger>
				<HoverCardContent align="start" className="w-72">
					<div className="flex gap-3">
						<Avatar className="size-10 shrink-0">
							{user.imageUrl && (
								<AvatarImage src={user.imageUrl} alt={user.name} />
							)}
							<AvatarFallback className="text-xs">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="font-semibold truncate">{user.name}</p>
							{user.email && (
								<p className="text-xs text-muted-foreground truncate">
									{user.email}
								</p>
							)}
						</div>
					</div>
					{jobLine && (
						<p className="mt-3 text-xs text-muted-foreground">{jobLine}</p>
					)}
					{user.bio && (
						<p className="mt-2 text-sm text-foreground leading-relaxed line-clamp-3">
							{user.bio}
						</p>
					)}
				</HoverCardContent>
			</HoverCard>
		</span>
	)
}
