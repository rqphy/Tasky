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
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { InviteMemberDialog } from "@/components/InviteMemberDialog"

const roleBadgeClass: Record<ProjectRole, string> = {
	OWNER: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	MEMBER: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	VIEWER: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
}

interface ProjectMembersPanelProps {
	project: Project
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ProjectMembersPanel({
	project,
	open,
	onOpenChange,
}: ProjectMembersPanelProps) {
	const [inviteOpen, setInviteOpen] = useState(false)
	const members = project.members ?? []

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
			</SheetContent>

			<InviteMemberDialog
				projectId={project.id}
				open={inviteOpen}
				onOpenChange={setInviteOpen}
			/>
		</Sheet>
	)
}
