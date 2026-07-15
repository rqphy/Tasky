import { useState } from "react"
import { useParams } from "react-router-dom"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectMembersPanel } from "@/components/ProjectMembersPanel"
import { NotificationPanel } from "@/components/NotificationPanel"
import { ShareLinkDialog } from "@/components/ShareLinkDialog"
import { useNotifications } from "@/hooks/useNotifications"
import { useProject } from "@/hooks/useProjects"
import { useShareLink } from "@/hooks/useShare"
import { useAuth } from "@/contexts/AuthContext"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	Notification02Icon,
	Loading01Icon,
	Share01Icon,
} from "@hugeicons/core-free-icons"

export function BoardPage() {
	const { projectId } = useParams<{ projectId: string }>()
	const { user } = useAuth()
	const { data: project, isLoading, error } = useProject(projectId)
	const isOwner = project?.ownerId === user?.id
	const { data: shareLink } = useShareLink(
		projectId,
		!!projectId && !!project && !isOwner,
	)
	const [membersOpen, setMembersOpen] = useState(false)
	const [notificationsOpen, setNotificationsOpen] = useState(false)
	const [shareOpen, setShareOpen] = useState(false)
	const [copied, setCopied] = useState(false)
	const { unreadCount } = useNotifications(projectId || "")

	async function handleCopyLink() {
		if (!shareLink?.url) return
		await navigator.clipboard.writeText(shareLink.url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="animate-spin text-muted-foreground"
				/>
			</div>
		)
	}

	if (error || !project) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<p className="text-destructive">
					{error ? "Failed to load project" : "Project not found"}
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col min-h-0">
			<div className="flex items-center justify-between border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">
					{project.emoji} {project.name}
				</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="relative"
						onClick={() => setNotificationsOpen(true)}
					>
						<HugeiconsIcon
							icon={Notification02Icon}
							size={16}
							strokeWidth={2}
						/>
						{unreadCount > 0 && (
							<Badge
								variant="destructive"
								className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center p-0 text-[10px]"
							>
								{unreadCount > 9 ? "9+" : unreadCount}
							</Badge>
						)}
					</Button>
					{isOwner ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShareOpen(true)}
						>
							<HugeiconsIcon
								icon={Share01Icon}
								size={16}
								strokeWidth={2}
							/>
							Share
						</Button>
					) : shareLink?.isActive && shareLink.url ? (
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopyLink}
						>
							<HugeiconsIcon
								icon={Share01Icon}
								size={16}
								strokeWidth={2}
							/>
							{copied ? "Copied!" : "Copy link"}
						</Button>
					) : null}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setMembersOpen(true)}
					>
						Members · {project.members?.length ?? 0}
					</Button>
				</div>
			</div>
			<div className="flex-1 px-8 py-6 overflow-x-auto min-h-0 min-w-0">
				<KanbanBoard projectId={project.id} columns={project.columns ?? []} />
			</div>
			<NotificationPanel
				projectId={project.id}
				open={notificationsOpen}
				onOpenChange={setNotificationsOpen}
			/>
			<ProjectMembersPanel
				project={project}
				isOwner={isOwner}
				open={membersOpen}
				onOpenChange={setMembersOpen}
			/>
			{isOwner && (
				<ShareLinkDialog
					projectId={project.id}
					open={shareOpen}
					onOpenChange={setShareOpen}
				/>
			)}
		</div>
	)
}
