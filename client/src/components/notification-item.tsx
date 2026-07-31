import { type Notification } from "@/lib/notifications"
import { formatRelativeTime } from "@/lib/notifications"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
	notification: Notification
	onMarkAsRead: (id: string) => void
	onOpen?: () => void
}

export function NotificationItem({
	notification,
	onMarkAsRead,
	onOpen,
}: NotificationItemProps) {
	const isClickable = !!onOpen

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!onOpen) return
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			onOpen()
		}
	}

	return (
		<div
			className={cn(
				"group relative flex gap-3 p-3 rounded-lg border transition-colors",
				notification.isRead
					? "bg-transparent border-transparent"
					: "bg-accent border-border",
				isClickable && "cursor-pointer hover:bg-accent/80"
			)}
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onClick={onOpen}
			onKeyDown={handleKeyDown}
		>
			<div className="shrink-0 mt-0.5">
				<div
					className={cn(
						"size-8 rounded-full flex items-center justify-center",
						notification.isRead
							? "bg-muted text-muted-foreground"
							: "bg-primary/10 text-primary"
					)}
				>
					<HugeiconsIcon icon={Notification02Icon} size={16} />
				</div>
			</div>

			<div className="flex-1 min-w-0 space-y-1">
				<p
					className={cn(
						"text-sm leading-snug",
						notification.isRead ? "font-normal" : "font-semibold"
					)}
				>
					{notification.title}
				</p>
				<p
					className={cn(
						"text-sm leading-snug",
						notification.isRead
							? "text-muted-foreground/70"
							: "text-muted-foreground"
					)}
				>
					{notification.message}
				</p>
				<p className="text-xs text-muted-foreground/60">
					{formatRelativeTime(notification.timestamp)}
				</p>
			</div>

			{!notification.isRead && (
				<button
					type="button"
					className={cn(
						"absolute inset-y-0 right-0 w-[12%] min-w-11",
						"flex items-center justify-center",
						"rounded-r-lg border-l border-border/60",
						"bg-muted/95 text-muted-foreground",
						"hover:bg-primary/15 hover:text-primary",
						"opacity-0 pointer-events-none transition-opacity",
						"group-hover:opacity-100 group-hover:pointer-events-auto"
					)}
					onClick={(e) => {
						e.stopPropagation()
						onMarkAsRead(notification.id)
					}}
					title="Mark as read"
					aria-label="Mark as read"
				>
					<HugeiconsIcon icon={Tick02Icon} size={18} />
				</button>
			)}
		</div>
	)
}
