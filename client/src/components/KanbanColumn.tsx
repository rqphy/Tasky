import React from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { SortableTaskCard } from "@/components/SortableTaskCard"
import { TaskCard } from "@/components/TaskCard"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import type { Task } from "@/types/task"
import type { Column } from "@/types/task"

interface KanbanColumnProps {
	column: Column
	tasks: Task[]
	readOnly?: boolean
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	onAttribute?: (id: string) => void
	onEditColumn?: (column: Column) => void
	onDeleteColumn?: (columnId: string) => void
	onAddTask?: (columnId: string) => void
	dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function KanbanColumn({
	column,
	tasks,
	readOnly = false,
	onEdit,
	onDelete,
	onAttribute,
	onEditColumn,
	onDeleteColumn,
	onAddTask,
	dragHandleProps,
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
		disabled: readOnly,
	})

	return (
		<div className="flex flex-col gap-3 w-full">
			{/* Column header */}
			<div className="flex items-center gap-2 px-1">
				{!readOnly && (
					<div
						{...dragHandleProps}
						className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 touch-none"
						title="Drag to reorder column"
					>
						<HugeiconsIcon icon={DragDropVerticalIcon} size={16} />
					</div>
				)}
				<span
					className={`size-2 rounded-full shrink-0 ${column.color}`}
				/>
				<h2 className="text-sm font-semibold text-foreground truncate">
					{column.label}
				</h2>
				<span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 leading-none shrink-0">
					{tasks.length}
				</span>

				{!readOnly && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors rounded p-0.5 hover:bg-muted focus-visible:outline-none"
								title="Column options"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<circle cx="12" cy="5" r="1.5" />
									<circle cx="12" cy="12" r="1.5" />
									<circle cx="12" cy="19" r="1.5" />
								</svg>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuItem
								onClick={() => onEditColumn?.(column)}
							>
								Edit
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => onDeleteColumn?.(column.id)}
							>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Drop zone */}
			<div
				className={`flex flex-col rounded-xl transition-colors ${
					isOver
						? "bg-muted/80 ring-2 ring-violet-500/30"
						: "bg-muted/40"
				}`}
			>
				{/* Scrollable task list */}
				<div
					ref={setNodeRef}
					className="flex flex-col gap-3 min-h-32 max-h-[calc(100vh-14rem)] overflow-y-auto p-3 pb-1"
				>
					{readOnly ? (
						tasks.map((task) => (
							<TaskCard key={task.id} {...task} readOnly />
						))
					) : (
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
									onAttribute={onAttribute}
								/>
							))}
						</SortableContext>
					)}

					{tasks.length === 0 && (
						<div className="flex-1 flex items-center justify-center">
							<p className="text-xs text-muted-foreground/50 italic select-none">
								Drop tasks here
							</p>
						</div>
					)}
				</div>

				{!readOnly && (
					<div className="p-1.5 pt-0">
						<button
							onClick={() => onAddTask?.(column.id)}
							className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-background/60 transition-colors"
						>
							<HugeiconsIcon icon={PlusSignIcon} size={12} />
							Add task
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
