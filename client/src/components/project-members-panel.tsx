import { useState } from "react"
import { type Project, type ProjectMember, type ProjectRole } from "@/lib/projects"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	UserAdd01Icon,
	Delete02Icon,
	MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { ConfirmMemberActionDialog } from "@/components/confirm-member-action-dialog"
import { UserHoverCard } from "@/components/user-hover-card"
import { useProjectInvites, useRevokeInvite } from "@/hooks/useInvites"
import {
	useRemoveMember,
	useTransferOwnership,
} from "@/hooks/useProjects"
import { isAxiosError } from "axios"

const roleBadgeClass: Record<ProjectRole, string> = {
	OWNER: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	MEMBER: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	VIEWER: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
}

type PendingAction =
	| { type: "kick"; member: ProjectMember }
	| { type: "transfer"; member: ProjectMember }
	| null

interface ProjectMembersPanelProps {
	project: Project
	isOwner: boolean
	currentUserId?: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

function formatInviteDate(value: string): string {
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	})
}

function getErrorMessage(error: unknown, fallback: string): string {
	if (isAxiosError(error) && error.response?.data && typeof error.response.data === "object" && "error" in error.response.data && typeof error.response.data.error === "string") {
		return error.response.data.error
	}
	return fallback
}

export function ProjectMembersPanel({
	project,
	isOwner,
	currentUserId,
	open,
	onOpenChange,
}: ProjectMembersPanelProps) {
	const [inviteOpen, setInviteOpen] = useState(false)
	const [pendingAction, setPendingAction] = useState<PendingAction>(null)
	const [actionError, setActionError] = useState("")
	const members = project.members ?? []
	const { data: pendingInvites = [], isLoading: invitesLoading } =
		useProjectInvites(project.id, open && isOwner)
	const revokeInvite = useRevokeInvite(project.id)
	const removeMember = useRemoveMember()
	const transferOwnership = useTransferOwnership(project.id)

	const isActionPending =
		removeMember.isPending || transferOwnership.isPending

	function closeActionDialog() {
		setPendingAction(null)
		setActionError("")
	}

	async function handleConfirmAction() {
		if (!pendingAction) return

		setActionError("")

		try {
			if (pendingAction.type === "kick") {
				await removeMember.mutateAsync({
					projectId: project.id,
					userId: pendingAction.member.userId,
				})
			} else {
				await transferOwnership.mutateAsync(pendingAction.member.userId)
			}
			closeActionDialog()
		} catch (error) {
			setActionError(
				getErrorMessage(
					error,
					pendingAction.type === "kick"
						? "Failed to remove member."
						: "Failed to transfer ownership.",
				),
			)
		}
	}

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

						const isSelf = pm.userId === currentUserId
						const isProjectOwner = pm.userId === project.ownerId
						const showMenu =
							isOwner && !isSelf && !isProjectOwner

						return (
							<div
								key={pm.userId}
								className="flex items-center gap-3 rounded-md px-2 py-2"
							>
								<UserHoverCard
									user={user}
									className="min-w-0 flex-1 items-center gap-3"
									nameClassName="flex-1 text-sm font-medium truncate"
									avatar={
										<Avatar className="size-8 shrink-0">
											{user.imageUrl && (
												<AvatarImage src={user.imageUrl} alt={user.name} />
											)}
											<AvatarFallback className="text-xs">
												{getInitials(user.name)}
											</AvatarFallback>
										</Avatar>
									}
								/>
								<Badge
									variant="secondary"
									className={roleBadgeClass[pm.role]}
								>
									{pm.role.toLowerCase()}
								</Badge>
								{showMenu && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Actions for ${user.name}`}
											>
												<HugeiconsIcon
													icon={MoreHorizontalIcon}
													size={16}
													strokeWidth={2}
												/>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => {
													setActionError("")
													setPendingAction({
														type: "transfer",
														member: pm,
													})
												}}
											>
												Transfer ownership
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => {
													setActionError("")
													setPendingAction({
														type: "kick",
														member: pm,
													})
												}}
											>
												Remove from project
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
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

			<ConfirmMemberActionDialog
				open={pendingAction?.type === "kick"}
				onOpenChange={(next) => {
					if (!next) closeActionDialog()
				}}
				title="Remove member"
				description={
					<>
						Remove {pendingAction?.member.user?.name} from{" "}
						{project.name}? They will lose access to this board.
					</>
				}
				confirmLabel="Remove"
				isPending={isActionPending}
				error={actionError}
				onConfirm={handleConfirmAction}
			/>

			<ConfirmMemberActionDialog
				open={pendingAction?.type === "transfer"}
				onOpenChange={(next) => {
					if (!next) closeActionDialog()
				}}
				title="Transfer ownership"
				description={
					<>
						Make {pendingAction?.member.user?.name} the owner of{" "}
						{project.name}? You will become a member.
					</>
				}
				confirmLabel="Transfer ownership"
				confirmVariant="default"
				isPending={isActionPending}
				error={actionError}
				onConfirm={handleConfirmAction}
			/>
		</Sheet>
	)
}
