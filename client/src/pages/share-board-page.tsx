import { useParams } from "react-router-dom"
import { KanbanBoard } from "@/components/kanban-board"
import { Badge } from "@/components/ui/badge"
import { useSharedProject } from "@/hooks/useShare"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"

export function ShareBoardPage() {
	const { token } = useParams<{ token: string }>()
	const { data: project, isLoading, error } = useSharedProject(token)

	if (isLoading) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="animate-spin text-muted-foreground"
				/>
			</div>
		)
	}

	if (error || !project) {
		return (
			<div className="flex min-h-svh items-center justify-center px-6">
				<p className="text-muted-foreground text-center">
					This link is no longer available.
				</p>
			</div>
		)
	}

	return (
		<div className="flex min-h-svh flex-col">
			<div className="flex items-center justify-between border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">
					{project.emoji} {project.name}
				</h1>
				<Badge variant="secondary">View-only</Badge>
			</div>
			<div className="flex-1 overflow-x-auto px-8 py-6 min-h-0">
				<KanbanBoard
					projectId={project.id}
					columns={project.columns ?? []}
					readOnly
				/>
			</div>
		</div>
	)
}
