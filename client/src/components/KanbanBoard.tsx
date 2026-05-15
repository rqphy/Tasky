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
import { arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "@/components/KanbanColumn"
import { TaskCard } from "@/components/TaskCard"
import { mockTasks, type Task } from "@/mocks/tasks"
import type { TaskStatus } from "@/types/task"

const COLUMNS: TaskStatus[] = ["incoming", "progress", "done"]

export function KanbanBoard() {
	const [tasks, setTasks] = useState<Task[]>(mockTasks)
	const [activeTask, setActiveTask] = useState<Task | null>(null)

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
		const task = tasks.find((t) => t.id === active.id)
		setActiveTask(task ?? null)
	}

	function handleDragOver({ active, over }: DragOverEvent) {
		if (!over) return
		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return

		// Check if we're hovering over a column (status id) or another card
		const overIsColumn = COLUMNS.includes(overId as TaskStatus)
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
		setActiveTask(null)
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string
		if (activeId === overId) return

		// Reorder within the same column
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
			<div className="flex gap-6 h-full items-start">
				{COLUMNS.map((status) => {
					const columnTasks = getTasksByStatus(status)
					return (
						<KanbanColumn
							key={status}
							status={status}
							tasks={columnTasks}
						/>
					)
				})}
			</div>

			{/* Drag overlay — the floating card while dragging */}
			<DragOverlay dropAnimation={null}>
				{activeTask ? (
					<div className="rotate-1 shadow-2xl">
						<TaskCard {...activeTask} />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	)
}
