import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "@/components/KanbanColumn"
import type { Task } from "@/mocks/tasks"
import type { TaskStatus } from "@/types/task"

interface SortableKanbanColumnProps {
	status: TaskStatus
	tasks: Task[]
}

export function SortableKanbanColumn({
	status,
	tasks,
}: SortableKanbanColumnProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: status,
		data: { type: "column" },
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 50 : undefined,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex flex-col gap-3 min-w-0 flex-1 max-w-sm"
		>
			<KanbanColumn
				status={status}
				tasks={tasks}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	)
}
