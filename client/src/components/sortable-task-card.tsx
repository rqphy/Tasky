import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "@/components/task-card"
import type { Task } from "@/types/task"

interface SortableTaskCardProps {
	task: Task
	onOpen?: (task: Task) => void
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	onAttribute?: (id: string) => void
}

export function SortableTaskCard({
	task,
	onOpen,
	onEdit,
	onDelete,
	onAttribute,
}: SortableTaskCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 50 : undefined,
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<TaskCard
				{...task}
				onOpen={() => onOpen?.(task)}
				onEdit={onEdit}
				onDelete={onDelete}
				onAttribute={onAttribute}
			/>
		</div>
	)
}
