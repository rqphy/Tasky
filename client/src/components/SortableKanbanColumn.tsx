import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "@/components/KanbanColumn"
import type { Task } from "@/mocks/tasks"
import type { Column } from "@/types/task"

interface SortableKanbanColumnProps {
	column: Column
	tasks: Task[]
	onEditColumn: (column: Column) => void
	onDeleteColumn: (columnId: string) => void
}

export function SortableKanbanColumn({
	column,
	tasks,
	onEditColumn,
	onDeleteColumn,
}: SortableKanbanColumnProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
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
				column={column}
				tasks={tasks}
				onEditColumn={onEditColumn}
				onDeleteColumn={onDeleteColumn}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	)
}
