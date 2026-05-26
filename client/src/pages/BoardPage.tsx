import { useParams } from "react-router-dom"
import { KanbanBoard } from "@/components/KanbanBoard"
import { mockProjects } from "@/mocks/projects"

export function BoardPage() {
	const { projectId } = useParams<{ projectId: string }>()
	const project = mockProjects.find((p) => p.id === projectId)

	return (
		<div className="flex flex-1 flex-col min-h-0">
			<div className="border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">
					{project ? `${project.emoji} ${project.name}` : "Board"}
				</h1>
			</div>
			<div className="flex-1 px-8 py-6 overflow-x-auto min-h-0">
				<KanbanBoard />
			</div>
		</div>
	)
}
