import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "@/components/KanbanColumn"
import type { Task } from "@/mocks/tasks"
import type { Column } from "@/types/task"

interface SortableKanbanColumnProps {
	column: Column
	tasks: Task[]
	onEdit: (id: string) => void
	onDelete: (id: string) => void
	onEditColumn: (column: Column) => void
	onDeleteColumn: (columnId: string) => void
	onAddTask: (columnId: string) => void
}

export function SortableKanbanColumn({
	column,
	tasks,
	onEdit,
	onDelete,
	onEditColumn,
	onDeleteColumn,
	onAddTask,
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
			className="flex flex-col gap-3 min-w-[280px] w-[280px]"
		>
			<KanbanColumn
				column={column}
				tasks={tasks}
				onEdit={onEdit}
				onDelete={onDelete}
				onEditColumn={onEditColumn}
				onDeleteColumn={onDeleteColumn}
				onAddTask={onAddTask}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	)
}
