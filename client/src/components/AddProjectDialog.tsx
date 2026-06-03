import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddProjectDialogProps {
	dialogOpen: boolean
	setDialogOpen: (open: boolean) => void
	projectName: string
	setProjectName: (name: string) => void
	handleCreate: () => void
}

export function AddProjectDialog({
	dialogOpen,
	setDialogOpen,
	projectName,
	setProjectName,
	handleCreate,
}: AddProjectDialogProps) {
	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New project</DialogTitle>
				</DialogHeader>
				<Input
					placeholder="Project name"
					value={projectName}
					onChange={(e) => setProjectName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleCreate()}
					autoFocus
				/>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setDialogOpen(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!projectName.trim()}
					>
						Create project
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
