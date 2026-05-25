import { useState, useEffect } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Task } from "@/mocks/tasks"
import type { TaskLabel, TaskPriority } from "@/types/task"

const LABELS: { value: TaskLabel; label: string }[] = [
	{ value: "feature", label: "Feature" },
	{ value: "bug", label: "Bug" },
	{ value: "improvement", label: "Improvement" },
	{ value: "documentation", label: "Documentation" },
	{ value: "chore", label: "Chore" },
]

const PRIORITIES: { value: TaskPriority; label: string }[] = [
	{ value: "urgent", label: "Urgent" },
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
	{ value: "none", label: "None" },
]

interface EditTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	task: Task
	onSave: (updated: Task) => void
}

export function EditTaskDialog({
	open,
	onOpenChange,
	task,
	onSave,
}: EditTaskDialogProps) {
	const [title, setTitle] = useState(task.title)
	const [description, setDescription] = useState(task.description ?? "")
	const [label, setLabel] = useState<TaskLabel | "">(task.label ?? "")
	const [priority, setPriority] = useState<TaskPriority>(
		task.priority ?? "medium",
	)

	// Sync form state whenever a different task is opened
	useEffect(() => {
		if (open) {
			setTitle(task.title)
			setDescription(task.description ?? "")
			setLabel(task.label ?? "")
			setPriority(task.priority ?? "medium")
		}
	}, [open, task])

	function handleSave() {
		const trimmedTitle = title.trim()
		if (!trimmedTitle) return
		onSave({
			...task,
			title: trimmedTitle,
			description: description.trim() || undefined,
			label: label || undefined,
			priority,
		})
		onOpenChange(false)
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
					<DialogTitle>Edit task</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-1">
					{/* Title */}
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

					{/* Description */}
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

					{/* Label + Priority side by side */}
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
								{LABELS.map((l) => (
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
								{PRIORITIES.map((p) => (
									<option key={p.value} value={p.value}>
										{p.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!title.trim()}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
