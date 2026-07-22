import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { NotificationItem } from "@/components/NotificationItem"
import { type Notification } from "@/lib/notifications"
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge02Icon } from "@hugeicons/core-free-icons"

interface NotificationPanelProps {
	projectId: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onTaskOpen: (notification: Notification) => void
}

export function NotificationPanel({
	projectId,
	open,
	onOpenChange,
	onTaskOpen,
}: NotificationPanelProps) {
	const { unreadCount, unreadNotifications, readNotifications, refresh } =
		useNotifications(projectId)
	const { markAsRead, markAllAsRead } = useMarkAsRead()
	const hasNotifications = unreadNotifications.length > 0 || readNotifications.length > 0

	const handleMarkAsRead = (id: string) => {
		markAsRead(id, refresh)
	}

	const handleMarkAllAsRead = () => {
		markAllAsRead(projectId, refresh)
	}

	const handleOpenTask = (notification: Notification) => {
		if (!notification.metadata?.taskId) return
		if (!notification.isRead) {
			markAsRead(notification.id, refresh)
		}
		onOpenChange(false)
		onTaskOpen(notification)
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Notifications</SheetTitle>
					<SheetDescription>
						{unreadCount > 0
							? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
							: "All caught up!"}
					</SheetDescription>
				</SheetHeader>

				{hasNotifications && (
					<>
						{unreadCount > 0 && (
							<div className="px-6 pb-4">
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={handleMarkAllAsRead}
								>
									<HugeiconsIcon
										icon={CheckmarkBadge02Icon}
										size={16}
										strokeWidth={2}
									/>
									Mark all as read
								</Button>
							</div>
						)}

						<ScrollArea className="h-[calc(100vh-12rem)] px-6 pb-6">
							<div className="space-y-4">
								{unreadNotifications.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											New
										</h3>
										<div className="space-y-2">
											{unreadNotifications.map((notification) => (
												<NotificationItem
													key={notification.id}
													notification={notification}
													onMarkAsRead={handleMarkAsRead}
													onOpen={
														notification.metadata?.taskId
															? () => handleOpenTask(notification)
															: undefined
													}
												/>
											))}
										</div>
									</div>
								)}

								{unreadNotifications.length > 0 &&
									readNotifications.length > 0 && (
										<Separator className="my-4" />
									)}

								{readNotifications.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											Earlier
										</h3>
										<div className="space-y-2">
											{readNotifications.map((notification) => (
												<NotificationItem
													key={notification.id}
													notification={notification}
													onMarkAsRead={handleMarkAsRead}
													onOpen={
														notification.metadata?.taskId
															? () => handleOpenTask(notification)
															: undefined
													}
												/>
											))}
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
					</>
				)}

				{!hasNotifications && (
					<div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] px-6 text-center">
						<div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<HugeiconsIcon
								icon={CheckmarkBadge02Icon}
								size={32}
								className="text-muted-foreground"
							/>
						</div>
						<h3 className="text-lg font-semibold mb-2">No notifications</h3>
						<p className="text-sm text-muted-foreground">
							You're all caught up! Check back later for updates.
						</p>
					</div>
				)}
			</SheetContent>
		</Sheet>
	)
}
