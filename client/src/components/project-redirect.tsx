import { Navigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"

export function ProjectRedirect() {
	const { data: projects, isLoading, error } = useProjects()

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="animate-spin text-muted-foreground"
				/>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-destructive">Failed to load projects</p>
			</div>
		)
	}

	if (projects && projects.length > 0) {
		return <Navigate to={`/board/${projects[0].id}`} replace />
	}

	return (
		<div className="flex h-full flex-col items-center justify-center gap-4">
			<p className="text-muted-foreground">No projects yet</p>
			<p className="text-sm text-muted-foreground">
				Create your first project using the sidebar
			</p>
		</div>
	)
}
