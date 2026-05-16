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
import { TaskCard } from "@/components/TaskCard"
import { mockTasks, type Task } from "@/mocks/tasks"
import type { TaskStatus } from "@/types/task"

const INITIAL_COLUMNS: TaskStatus[] = ["incoming", "progress", "done"]

type ActiveItem =
	| { type: "card"; task: Task }
	| { type: "column"; status: TaskStatus }

export function KanbanBoard() {
	const [tasks, setTasks] = useState<Task[]>(mockTasks)
	const [columns, setColumns] = useState<TaskStatus[]>(INITIAL_COLUMNS)
	const [activeItem, setActiveItem] = useState<ActiveItem | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				// Require 8px movement before starting a drag —
				// so clicks (to open the dialog) still work normally
				distance: 8,
			},
		}),
	)

	function getTasksByStatus(status: TaskStatus) {
		return tasks.filter((t) => t.status === status)
	}

	function handleDragStart({ active }: DragStartEvent) {
		const dragType = active.data.current?.type

		if (dragType === "column") {
			setActiveItem({ type: "column", status: active.id as TaskStatus })
		} else {
			const task = tasks.find((t) => t.id === active.id)
			if (task) setActiveItem({ type: "card", task })
		}
	}

	function handleDragOver({ active, over }: DragOverEvent) {
		if (!over) return
		// Only handle card-over-column or card-over-card transitions
		if (active.data.current?.type === "column") return

		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return

		// Check if we're hovering over a column (status id) or another card
		const overIsColumn = columns.includes(overId as TaskStatus)
		const overTask = tasks.find((t) => t.id === overId)
		const targetStatus: TaskStatus | undefined = overIsColumn
			? (overId as TaskStatus)
			: overTask?.status

		if (!targetStatus || activeTask.status === targetStatus) return

		setTasks((prev) =>
			prev.map((t) =>
				t.id === activeId ? { ...t, status: targetStatus } : t,
			),
		)
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		const dragType = active.data.current?.type

		// Column reorder
		if (dragType === "column") {
			setActiveItem(null)
			if (!over || active.id === over.id) return
			setColumns((prev) => {
				const oldIndex = prev.indexOf(active.id as TaskStatus)
				const newIndex = prev.indexOf(over.id as TaskStatus)
				return arrayMove(prev, oldIndex, newIndex)
			})
			return
		}

		// Card reorder within same column
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

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={columns}
				strategy={horizontalListSortingStrategy}
			>
				<div className="flex gap-6 h-full items-start">
					{columns.map((status) => {
						const columnTasks = getTasksByStatus(status)
						return (
							<SortableKanbanColumn
								key={status}
								status={status}
								tasks={columnTasks}
							/>
						)
					})}
				</div>
			</SortableContext>

			{/* Drag overlay — the floating item while dragging */}
			<DragOverlay dropAnimation={null}>
				{activeItem?.type === "card" ? (
					<div className="rotate-1 shadow-2xl">
						<TaskCard {...activeItem.task} />
					</div>
				) : activeItem?.type === "column" ? (
					<div className="opacity-90 shadow-2xl rotate-1 flex-1 max-w-sm min-w-0 pointer-events-none">
						<KanbanColumn
							status={activeItem.status}
							tasks={getTasksByStatus(activeItem.status)}
						/>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	)
}
