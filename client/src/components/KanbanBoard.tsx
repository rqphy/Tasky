import { useState } from "react"
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	closestCorners,
	type DragStartEvent,
	type DragOverEvent,
	type DragEndEvent,
} from "@dnd-kit/core"
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableKanbanColumn } from "@/components/SortableKanbanColumn"
import { KanbanColumn } from "@/components/KanbanColumn"
import { ColumnDialog } from "@/components/ColumnDialog"
import { AddTaskDialog } from "@/components/AddTaskDialog"
import { EditTaskDialog } from "@/components/EditTaskDialog"
import { AssignTaskDialog } from "@/components/AssignTaskDialog"
import type { User } from "@/mocks/users"
import { TaskCard } from "@/components/TaskCard"
import { mockTasks, type Task } from "@/mocks/tasks"
import type { Column } from "@/types/task"

const DEFAULT_COLUMNS: Column[] = [
	{ id: "incoming", label: "Incoming", color: "bg-slate-400" },
	{ id: "progress", label: "In Progress", color: "bg-violet-500" },
	{ id: "done", label: "Done", color: "bg-emerald-500" },
]

type ActiveItem =
	| { type: "card"; task: Task }
	| { type: "column"; column: Column }

type DialogState = { mode: "add" } | { mode: "edit"; column: Column } | null
type AddTaskDialogState = { columnId: string } | null
type EditTaskDialogState = { task: Task } | null
type AssignTaskDialogState = {
	taskId: string
	currentAssigneeName?: string
} | null

export function KanbanBoard() {
	const [tasks, setTasks] = useState<Task[]>(mockTasks)
	const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS)
	const [activeItem, setActiveItem] = useState<ActiveItem | null>(null)
	const [dialog, setDialog] = useState<DialogState>(null)
	const [addTaskDialog, setAddTaskDialog] = useState<AddTaskDialogState>(null)
	const [editTaskDialog, setEditTaskDialog] =
		useState<EditTaskDialogState>(null)
	const [assignTaskDialog, setAssignTaskDialog] =
		useState<AssignTaskDialogState>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

	// ── Helpers ──────────────────────────────────────────────────────────────

	function getTasksByColumnId(columnId: string) {
		return tasks.filter((t) => t.status === columnId)
	}

	function getColumnById(id: string) {
		return columns.find((c) => c.id === id) ?? null
	}

	// ── Column CRUD ───────────────────────────────────────────────────────────

	function handleAddColumn(column: Column) {
		setColumns((prev) => [...prev, column])
	}

	function handleAddTask(task: Task) {
		setTasks((prev) => [...prev, task])
	}

	function handleOpenEditTask(id: string) {
		const task = tasks.find((t) => t.id === id)
		if (task) setEditTaskDialog({ task })
	}

	function handleSaveEditedTask(updated: Task) {
		setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
	}

	function handleDeleteTask(id: string) {
		setTasks((prev) => prev.filter((t) => t.id !== id))
	}

	function handleOpenAssignTask(id: string) {
		const task = tasks.find((t) => t.id === id)
		if (task)
			setAssignTaskDialog({
				taskId: id,
				currentAssigneeName: task.assignee?.name,
			})
	}

	function handleAssignTask(user: User | null) {
		if (!assignTaskDialog) return
		setTasks((prev) =>
			prev.map((t) =>
				t.id === assignTaskDialog.taskId
					? {
							...t,
							assignee: user
								? { name: user.name, avatarUrl: user.avatarUrl }
								: undefined,
						}
					: t,
			),
		)
	}

	function handleEditColumn(updated: Column) {
		setColumns((prev) =>
			prev.map((c) => (c.id === updated.id ? updated : c)),
		)
	}

	function handleDeleteColumn(columnId: string) {
		setColumns((prev) => {
			const remaining = prev.filter((c) => c.id !== columnId)
			// Move orphaned tasks to the first remaining column (if any)
			if (remaining.length > 0) {
				const fallbackId = remaining[0].id
				setTasks((prevTasks) =>
					prevTasks.map((t) =>
						t.status === columnId
							? { ...t, status: fallbackId }
							: t,
					),
				)
			} else {
				// No columns left — drop all tasks from deleted column
				setTasks((prevTasks) =>
					prevTasks.filter((t) => t.status !== columnId),
				)
			}
			return remaining
		})
	}

	// ── Drag & Drop ───────────────────────────────────────────────────────────

	function handleDragStart({ active }: DragStartEvent) {
		const dragType = active.data.current?.type
		if (dragType === "column") {
			const col = getColumnById(active.id as string)
			if (col) setActiveItem({ type: "column", column: col })
		} else {
			const task = tasks.find((t) => t.id === active.id)
			if (task) setActiveItem({ type: "card", task })
		}
	}

	function handleDragOver({ active, over }: DragOverEvent) {
		if (!over) return
		if (active.data.current?.type === "column") return

		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return

		const overIsColumn = columns.some((c) => c.id === overId)
		const overTask = tasks.find((t) => t.id === overId)
		const targetStatus = overIsColumn ? overId : overTask?.status

		if (!targetStatus || activeTask.status === targetStatus) return

		setTasks((prev) =>
			prev.map((t) =>
				t.id === activeId ? { ...t, status: targetStatus } : t,
			),
		)
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		const dragType = active.data.current?.type

		if (dragType === "column") {
			setActiveItem(null)
			if (!over || active.id === over.id) return
			setColumns((prev) => {
				const oldIndex = prev.findIndex((c) => c.id === active.id)
				const newIndex = prev.findIndex((c) => c.id === over.id)
				return arrayMove(prev, oldIndex, newIndex)
			})
			return
		}

		setActiveItem(null)
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		const activeTask = tasks.find((t) => t.id === activeId)
		const overTask = tasks.find((t) => t.id === overId)

		if (activeTask && overTask && activeTask.status === overTask.status) {
			const statusTasks = tasks.filter(
				(t) => t.status === activeTask.status,
			)
			const oldIndex = statusTasks.findIndex((t) => t.id === activeId)
			const newIndex = statusTasks.findIndex((t) => t.id === overId)
			const reordered = arrayMove(statusTasks, oldIndex, newIndex)
			setTasks((prev) => {
				const others = prev.filter(
					(t) => t.status !== activeTask.status,
				)
				return [...others, ...reordered]
			})
		}
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={columns.map((c) => c.id)}
					strategy={horizontalListSortingStrategy}
				>
					<div className="flex gap-6 h-full items-start w-max">
						{columns.map((column) => (
							<SortableKanbanColumn
								key={column.id}
								column={column}
								tasks={getTasksByColumnId(column.id)}
								onEdit={handleOpenEditTask}
								onDelete={handleDeleteTask}
								onAttribute={handleOpenAssignTask}
								onEditColumn={(col) =>
									setDialog({ mode: "edit", column: col })
								}
								onDeleteColumn={handleDeleteColumn}
								onAddTask={(columnId) =>
									setAddTaskDialog({ columnId })
								}
							/>
						))}

						{/* Add column button */}
						<button
							onClick={() => setDialog({ mode: "add" })}
							className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:border-foreground/30 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0 self-start mt-0"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							Add column
						</button>
					</div>
				</SortableContext>

				{/* Drag overlay */}
				<DragOverlay dropAnimation={null}>
					{activeItem?.type === "card" ? (
						<div className="rotate-1 shadow-2xl">
							<TaskCard {...activeItem.task} />
						</div>
					) : activeItem?.type === "column" ? (
						<div className="opacity-90 shadow-2xl rotate-1 flex-1 max-w-sm min-w-0 pointer-events-none">
							<KanbanColumn
								column={activeItem.column}
								tasks={getTasksByColumnId(activeItem.column.id)}
							/>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			{/* Column dialog */}
			{/* Add task dialog */}
			<AddTaskDialog
				open={addTaskDialog !== null}
				onOpenChange={(open) => {
					if (!open) setAddTaskDialog(null)
				}}
				columnId={addTaskDialog?.columnId ?? ""}
				onAdd={handleAddTask}
			/>

			{assignTaskDialog && (
				<AssignTaskDialog
					open={assignTaskDialog !== null}
					onOpenChange={(open) => {
						if (!open) setAssignTaskDialog(null)
					}}
					currentAssigneeName={assignTaskDialog.currentAssigneeName}
					onAssign={handleAssignTask}
				/>
			)}

			{editTaskDialog && (
				<EditTaskDialog
					open={editTaskDialog !== null}
					onOpenChange={(open) => {
						if (!open) setEditTaskDialog(null)
					}}
					task={editTaskDialog.task}
					onSave={handleSaveEditedTask}
				/>
			)}

			<ColumnDialog
				open={dialog !== null}
				onOpenChange={(open) => {
					if (!open) setDialog(null)
				}}
				column={dialog?.mode === "edit" ? dialog.column : undefined}
				onSave={
					dialog?.mode === "edit" ? handleEditColumn : handleAddColumn
				}
			/>
		</>
	)
}
