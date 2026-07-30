import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import type { PublicUserProfile } from "@/types/user"

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase()
}

function formatJobLine(jobTitle?: string | null, company?: string | null): string | null {
	if (jobTitle && company) return `${jobTitle} at ${company}`
	if (jobTitle) return jobTitle
	if (company) return company
	return null
}

interface UserHoverCardProps {
	user: PublicUserProfile
	children: ReactNode
	className?: string
}

export function UserHoverCard({ user, children, className }: UserHoverCardProps) {
	const jobLine = formatJobLine(user.jobTitle, user.company)

	return (
		<HoverCard openDelay={200} closeDelay={100}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					className={className ?? "inline-flex items-center gap-2 cursor-default text-left"}
				>
					{children}
				</button>
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
	)
}

export { getInitials }
