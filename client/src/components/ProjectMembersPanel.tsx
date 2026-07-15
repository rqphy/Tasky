import { useState } from "react"
import { type Project, type ProjectRole } from "@/lib/projects"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { InviteMemberDialog } from "@/components/InviteMemberDialog"
import { useProjectInvites, useRevokeInvite } from "@/hooks/useInvites"

const roleBadgeClass: Record<ProjectRole, string> = {
	OWNER: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	MEMBER: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	VIEWER: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
}

interface ProjectMembersPanelProps {
	project: Project
	isOwner: boolean
	open: boolean
	onOpenChange: (open: boolean) => void
}

function formatInviteDate(value: string): string {
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	})
}

export function ProjectMembersPanel({
	project,
	isOwner,
	open,
	onOpenChange,
}: ProjectMembersPanelProps) {
	const [inviteOpen, setInviteOpen] = useState(false)
	const members = project.members ?? []
	const { data: pendingInvites = [], isLoading: invitesLoading } =
		useProjectInvites(project.id, open && isOwner)
	const revokeInvite = useRevokeInvite(project.id)

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Members</SheetTitle>
					<SheetDescription>
						{members.length} member
						{members.length !== 1 && "s"} in {project.name}
					</SheetDescription>
				</SheetHeader>
				{isOwner && (
					<div className="px-6 pb-6">
						<Button
							variant="outline"
							className="w-full"
							onClick={() => setInviteOpen(true)}
						>
							<HugeiconsIcon
								icon={UserAdd01Icon}
								size={16}
								strokeWidth={2}
							/>
							Invite member
						</Button>
					</div>
				)}
				<div className="flex flex-col gap-1 px-6 pb-6 overflow-y-auto">
					{members.map((pm) => {
						const user = pm.user
						if (!user) return null
						return (
							<div
								key={pm.userId}
								className="flex items-center gap-3 rounded-md px-2 py-2"
							>
								<Avatar className="size-8">
									<AvatarFallback className="text-xs">
										{user.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<span className="flex-1 text-sm font-medium truncate">
									{user.name}
								</span>
								<Badge
									variant="secondary"
									className={roleBadgeClass[pm.role]}
								>
									{pm.role.toLowerCase()}
								</Badge>
							</div>
						)
					})}
				</div>
				{isOwner && (
					<div className="flex flex-col gap-3 px-6 pb-6 border-t pt-6">
						<div>
							<h3 className="text-sm font-medium">Pending invites</h3>
							<p className="text-muted-foreground text-xs mt-1">
								Invitations waiting to be accepted
							</p>
						</div>
						{invitesLoading ? (
							<p className="text-muted-foreground text-sm">
								Loading invites...
							</p>
						) : pendingInvites.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No pending invites
							</p>
						) : (
							<div className="flex flex-col gap-1">
								{pendingInvites.map((invite) => (
									<div
										key={invite.id}
										className="flex items-center gap-3 rounded-md px-2 py-2"
									>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{invite.email}
											</p>
											<p className="text-muted-foreground text-xs">
												Sent {formatInviteDate(invite.createdAt)}
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() =>
												revokeInvite.mutate(invite.id)
											}
											disabled={revokeInvite.isPending}
											aria-label={`Revoke invite for ${invite.email}`}
										>
											<HugeiconsIcon
												icon={Delete02Icon}
												size={16}
												strokeWidth={2}
											/>
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</SheetContent>

			<InviteMemberDialog
				projectId={project.id}
				open={inviteOpen}
				onOpenChange={setInviteOpen}
			/>
		</Sheet>
	)
}
