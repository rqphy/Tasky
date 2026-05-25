import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockUsers, type User } from "@/mocks/users"

interface AssignTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Name of the currently assigned user, if any */
	currentAssigneeName?: string
	onAssign: (user: User | null) => void
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
	currentAssigneeName,
	onAssign,
}: AssignTaskDialogProps) {
	function handleSelect(user: User | null) {
		onAssign(user)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xs">
				<DialogHeader>
					<DialogTitle>Assign task</DialogTitle>
				</DialogHeader>

				<ul className="flex flex-col gap-1 py-1">
					{/* Unassign row */}
					<li>
						<button
							onClick={() => handleSelect(null)}
							className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
								!currentAssigneeName
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

					{mockUsers.map((user) => {
						const isActive = user.name === currentAssigneeName
						return (
							<li key={user.id}>
								<button
									onClick={() => handleSelect(user)}
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
