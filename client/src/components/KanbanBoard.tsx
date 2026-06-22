import { useState, useMemo, useEffect } from "react"
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
import { type Task } from "@/mocks/tasks"
import type { Column as UIColumn, TaskLabel, TaskPriority } from "@/types/task"
import type { Column as BackendColumn } from "@/lib/projects"
import { hexToTailwind, tailwindToHex } from "@/lib/colors"
import {
	useCreateColumn,
	useUpdateColumn,
	useDeleteColumn,
	useReorderColumns,
	useMoveTask,
} from "@/hooks/useProjects"

interface KanbanBoardProps {
	projectId: string
	columns: BackendColumn[]
}

function computeInsertPosition(
	sortedTasks: { position: number }[],
	insertIndex: number,
): number {
	if (sortedTasks.length === 0) return 1.0
	if (insertIndex === 0) return sortedTasks[0].position / 2
	if (insertIndex >= sortedTasks.length) {
		return sortedTasks[sortedTasks.length - 1].position + 1
	}
	const prev = sortedTasks[insertIndex - 1].position
	const next = sortedTasks[insertIndex].position
	return (prev + next) / 2
}

type ActiveItem =
	| { type: "card"; task: Task }
	| { type: "column"; column: UIColumn }

type DialogState = { mode: "add" } | { mode: "edit"; column: UIColumn } | null
type AddTaskDialogState = { columnId: string } | null
type EditTaskDialogState = { task: Task } | null
type AssignTaskDialogState = {
	taskId: string
	currentAssigneeName?: string
} | null

export function KanbanBoard({ projectId, columns: backendColumns }: KanbanBoardProps) {
	const backendTasks = useMemo(
		() =>
			backendColumns.flatMap((col) =>
				(col.tasks ?? []).map((t) => ({
					id: t.id,
					title: t.title,
					description: t.description,
					label: t.label?.toLowerCase() as TaskLabel | undefined,
					priority: t.priority?.toLowerCase() as TaskPriority | undefined,
					status: t.columnId,
					position: t.position,
				}))
			),
		[backendColumns]
	)

	const [tasks, setTasks] = useState<Task[]>(backendTasks)
	const [activeItem, setActiveItem] = useState<ActiveItem | null>(null)
	const [dialog, setDialog] = useState<DialogState>(null)
	const [addTaskDialog, setAddTaskDialog] = useState<AddTaskDialogState>(null)
	const [editTaskDialog, setEditTaskDialog] =
		useState<EditTaskDialogState>(null)
	const [assignTaskDialog, setAssignTaskDialog] =
		useState<AssignTaskDialogState>(null)

	const createColumn = useCreateColumn(projectId)
	const updateColumn = useUpdateColumn(projectId)
	const deleteColumn = useDeleteColumn(projectId)
	const reorderColumns = useReorderColumns(projectId)
	const moveTask = useMoveTask(projectId)

	const columns: UIColumn[] = useMemo(
		() =>
			backendColumns.map((col) => ({
				id: col.id,
				label: col.name,
				color: hexToTailwind(col.color),
			})),
		[backendColumns]
	)

	useEffect(() => {
		setTasks(backendTasks)
	}, [backendTasks])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

	// ── Helpers ──────────────────────────────────────────────────────────────

	function getTasksByColumnId(columnId: string) {
		return tasks
			.filter((t) => t.status === columnId)
			.sort((a, b) => a.position - b.position)
	}

	function getColumnById(id: string) {
		return columns.find((c) => c.id === id) ?? null
	}

	// ── Column CRUD ───────────────────────────────────────────────────────────

	function handleAddColumn(column: UIColumn) {
		createColumn.mutate({
			name: column.label,
			color: tailwindToHex(column.color),
		})
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

	function handleEditColumn(updated: UIColumn) {
		updateColumn.mutate({
			columnId: updated.id,
			data: {
				name: updated.label,
				color: tailwindToHex(updated.color),
			},
		})
	}

	function handleDeleteColumn(columnId: string) {
		deleteColumn.mutate(columnId)
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
			const oldIndex = columns.findIndex((c) => c.id === active.id)
			const newIndex = columns.findIndex((c) => c.id === over.id)
			const reordered = arrayMove(columns, oldIndex, newIndex)
			reorderColumns.mutate(reordered.map((c) => c.id))
			return
		}

		setActiveItem(null)
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return

		const overIsColumn = columns.some((c) => c.id === overId)
		const overTask = tasks.find((t) => t.id === overId)
		const targetColumnId = overIsColumn ? overId : overTask?.status

		if (!targetColumnId) return

		let columnTasks = tasks
			.filter((t) => t.status === targetColumnId)
			.sort((a, b) => a.position - b.position)

		if (!columnTasks.some((t) => t.id === activeId)) {
			columnTasks = [
				...columnTasks,
				{ ...activeTask, status: targetColumnId },
			].sort((a, b) => a.position - b.position)
		}

		const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
		const newIndex = overIsColumn
			? columnTasks.length - 1
			: columnTasks.findIndex((t) => t.id === overId)

		if (newIndex === -1) return

		const columnChanged = activeTask.status !== targetColumnId
		if (!columnChanged && oldIndex === newIndex) return

		const reordered = arrayMove(columnTasks, oldIndex, newIndex)
		const insertIndex = reordered.findIndex((t) => t.id === activeId)
		const position = computeInsertPosition(
			reordered.filter((t) => t.id !== activeId),
			insertIndex,
		)

		const snapshot = tasks
		const updatedActiveTask = {
			...activeTask,
			status: targetColumnId,
			position,
		}

		setTasks((prev) => {
			const others = prev.filter(
				(t) => t.status !== targetColumnId && t.id !== activeId,
			)
			const columnReordered = reordered.map((t) =>
				t.id === activeId ? updatedActiveTask : t,
			)
			return [...others, ...columnReordered]
		})

		moveTask.mutate(
			{
				taskId: activeId,
				data: { columnId: targetColumnId, position },
			},
			{ onError: () => setTasks(snapshot) },
		)
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
				projectId={projectId}
				columnId={addTaskDialog?.columnId ?? ""}
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
