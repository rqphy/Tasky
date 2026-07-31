import { useState, useEffect } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { TaskLabel, TaskPriority } from "@/types/task"
import { TASK_LABELS } from "@/lib/labels"
import { TASK_PRIORITIES } from "@/lib/priority"
import { useCreateTask, useProjectMembers } from "@/hooks/useProjects"
import type { CreateTaskInput } from "@/lib/projects"

interface AddTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	projectId: string
	columnId: string
}

export function AddTaskDialog({
	open,
	onOpenChange,
	projectId,
	columnId,
}: AddTaskDialogProps) {
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [label, setLabel] = useState<TaskLabel | "">("")
	const [priority, setPriority] = useState<TaskPriority>("medium")
	const [assigneeId, setAssigneeId] = useState("")

	const createTask = useCreateTask(projectId)
	const { data: members = [] } = useProjectMembers(projectId, open)

	// Reset form whenever dialog opens
	useEffect(() => {
		if (open) {
			setTitle("")
			setDescription("")
			setLabel("")
			setPriority("medium")
			setAssigneeId("")
		}
	}, [open])

	function handleSave() {
		const trimmedTitle = title.trim()
		if (!trimmedTitle) return

		createTask.mutate(
			{
				columnId,
				title: trimmedTitle,
				description: description.trim() || undefined,
				label: label
					? (label.toUpperCase() as CreateTaskInput["label"])
					: undefined,
				priority: priority.toUpperCase() as CreateTaskInput["priority"],
				assigneeId: assigneeId || undefined,
			},
			{
				onSuccess: () => onOpenChange(false),
			},
		)
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey && e.target === e.currentTarget) {
			e.preventDefault()
			handleSave()
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Add task</DialogTitle>
					<DialogDescription className="sr-only">
						Add a new task with a title, description, label,
						priority, and assignee.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-1">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Title <span className="text-destructive">*</span>
						</label>
						<input
							autoFocus
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Task title…"
							className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional description…"
							rows={3}
							className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Label
							</label>
							<select
								value={label}
								onChange={(e) =>
									setLabel(e.target.value as TaskLabel | "")
								}
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
							>
								<option value="">None</option>
								{TASK_LABELS.map((l) => (
									<option key={l.value} value={l.value}>
										{l.label}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Priority
							</label>
							<select
								value={priority}
								onChange={(e) =>
									setPriority(e.target.value as TaskPriority)
								}
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
							>
								{TASK_PRIORITIES.map((p) => (
									<option key={p.value} value={p.value}>
										{p.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Assignee
						</label>
						<select
							value={assigneeId}
							onChange={(e) => setAssigneeId(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
						>
							<option value="">Unassigned</option>
							{members.map((member) => {
								if (!member.user) return null
								return (
									<option
										key={member.userId}
										value={member.user.id}
									>
										{member.user.name}
									</option>
								)
							})}
						</select>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={createTask.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={!title.trim() || createTask.isPending}
					>
						{createTask.isPending ? "Adding…" : "Add task"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
