import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useProjectMembers } from "@/hooks/useProjects"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"

export interface Assignee {
	id: string
	name: string
}

interface AssignTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	projectId: string
	/** Id of the currently assigned user, if any */
	currentAssigneeId?: string
	onAssign: (user: Assignee | null) => void
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase()
}

export function AssignTaskDialog({
	open,
	onOpenChange,
	projectId,
	currentAssigneeId,
	onAssign,
}: AssignTaskDialogProps) {
	const {
		data: members = [],
		isLoading,
		isError,
	} = useProjectMembers(projectId, open)

	function handleSelect(user: Assignee | null) {
		onAssign(user)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xs">
				<DialogHeader>
					<DialogTitle>Assign task</DialogTitle>
				</DialogHeader>

				<ul className="flex flex-col gap-1 py-1 max-h-[60vh] overflow-y-auto">
					{/* Unassign row */}
					<li>
						<button
							onClick={() => handleSelect(null)}
							className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
								!currentAssigneeId
									? "bg-muted font-medium"
									: "hover:bg-muted/60 text-muted-foreground"
							}`}
						>
							<span className="size-7 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center text-xs text-muted-foreground">
								—
							</span>
							Unassigned
						</button>
					</li>

					{isLoading && (
						<li className="flex items-center justify-center py-6 text-muted-foreground">
							<HugeiconsIcon
								icon={Loading01Icon}
								size={20}
								strokeWidth={2}
								className="animate-spin"
							/>
						</li>
					)}

					{isError && (
						<li className="px-3 py-4 text-sm text-destructive text-center">
							Failed to load members
						</li>
					)}

					{!isLoading &&
						!isError &&
						members.map((member) => {
							const user = member.user
							if (!user) return null

							const isActive = user.id === currentAssigneeId
							return (
								<li key={member.userId}>
									<button
										onClick={() =>
											handleSelect({
												id: user.id,
												name: user.name,
											})
										}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
											isActive
												? "bg-muted font-medium"
												: "hover:bg-muted/60"
										}`}
									>
										<Avatar className="size-7">
											<AvatarFallback className="text-[10px]">
												{getInitials(user.name)}
											</AvatarFallback>
										</Avatar>
										{user.name}
										{isActive && (
											<span className="ml-auto text-xs text-muted-foreground">
												assigned
											</span>
										)}
									</button>
								</li>
							)
						})}
				</ul>
			</DialogContent>
		</Dialog>
	)
}
