import React from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { SortableTaskCard } from "@/components/SortableTaskCard"
import type { Task } from "@/mocks/tasks"
import type { TaskStatus } from "@/types/task"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"

const columnMeta: Record<TaskStatus, { label: string; accent: string }> = {
	incoming: { label: "Incoming", accent: "bg-slate-400" },
	progress: { label: "In Progress", accent: "bg-violet-500" },
	done: { label: "Done", accent: "bg-emerald-500" },
}

interface KanbanColumnProps {
	status: TaskStatus
	tasks: Task[]
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function KanbanColumn({
	status,
	tasks,
	onEdit,
	onDelete,
	dragHandleProps,
}: KanbanColumnProps) {
	const meta = columnMeta[status]
	const { setNodeRef, isOver } = useDroppable({ id: status })

	return (
		<div className="flex flex-col gap-3 w-full">
			{/* Column header */}
			<div className="flex items-center gap-2 px-1">
				{/* Drag handle */}
				<div
					{...dragHandleProps}
					className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 touch-none"
					title="Drag to reorder column"
				>
					<HugeiconsIcon icon={DragDropVerticalIcon} size={16} />
				</div>
				<span
					className={`size-2 rounded-full shrink-0 ${meta.accent}`}
				/>
				<h2 className="text-sm font-semibold text-foreground">
					{meta.label}
				</h2>
				<span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 leading-none">
					{tasks.length}
				</span>
			</div>

			{/* Drop zone */}
			<div
				ref={setNodeRef}
				className={`flex flex-col gap-3 min-h-32 rounded-xl p-3 transition-colors ${
					isOver
						? "bg-muted/80 ring-2 ring-violet-500/30"
						: "bg-muted/40"
				}`}
			>
				<SortableContext
					items={tasks.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.map((task) => (
						<SortableTaskCard
							key={task.id}
							task={task}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</SortableContext>

				{tasks.length === 0 && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-xs text-muted-foreground/50 italic select-none">
							Drop tasks here
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
