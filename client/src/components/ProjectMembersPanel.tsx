import { type Project, type ProjectRole } from "@/mocks/projects"
import { mockUsers } from "@/mocks/users"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const roleBadgeClass: Record<ProjectRole, string> = {
	owner: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	member: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	viewer: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
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
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Members</SheetTitle>
					<SheetDescription>
						{project.members.length} member
						{project.members.length !== 1 && "s"} in {project.name}
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-1 px-6 pb-6 overflow-y-auto">
					{project.members.map((pm) => {
						const user = mockUsers.find((u) => u.id === pm.userId)
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
									{pm.role}
								</Badge>
							</div>
						)
					})}
				</div>
			</SheetContent>
		</Sheet>
	)
}
