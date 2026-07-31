import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "@/components/kanban-column"
import type { Task } from "@/types/task"
import type { Column } from "@/types/task"

interface SortableKanbanColumnProps {
	column: Column
	tasks: Task[]
	onOpenTask?: (task: Task) => void
	onEdit: (id: string) => void
	onDelete: (id: string) => void
	onAttribute: (id: string) => void
	onEditColumn: (column: Column) => void
	onDeleteColumn: (columnId: string) => void
	onAddTask: (columnId: string) => void
}

export function SortableKanbanColumn({
	column,
	tasks,
	onOpenTask,
	onEdit,
	onDelete,
	onAttribute,
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
			className="flex flex-col gap-3 min-w-70 w-70"
		>
			<KanbanColumn
				column={column}
				tasks={tasks}
				onOpenTask={onOpenTask}
				onEdit={onEdit}
				onDelete={onDelete}
				onAttribute={onAttribute}
				onEditColumn={onEditColumn}
				onDeleteColumn={onDeleteColumn}
				onAddTask={onAddTask}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	)
}
