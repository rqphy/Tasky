import { useState } from "react"
import { useParams } from "react-router-dom"
import { KanbanBoard } from "@/components/KanbanBoard"
import { mockProjects } from "@/mocks/projects"
import { Button } from "@/components/ui/button"
import { ProjectMembersPanel } from "@/components/ProjectMembersPanel"

export function BoardPage() {
	const { projectId } = useParams<{ projectId: string }>()
	const project = mockProjects.find((p) => p.id === projectId)
	const [membersOpen, setMembersOpen] = useState(false)

	return (
		<div className="flex flex-1 flex-col min-h-0">
			<div className="flex items-center justify-between border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">
					{project ? `${project.emoji} ${project.name}` : "Board"}
				</h1>
				{project && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setMembersOpen(true)}
					>
						Members · {project.members.length}
					</Button>
				)}
			</div>
			<div className="flex-1 px-8 py-6 overflow-x-auto min-h-0 min-w-0">
				<KanbanBoard />
			</div>
			{project && (
				<ProjectMembersPanel
					project={project}
					open={membersOpen}
					onOpenChange={setMembersOpen}
				/>
			)}
		</div>
	)
}
