import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { ConfirmMemberActionDialog } from "@/components/ConfirmMemberActionDialog"
import {
	getAccountErrorMessage,
	getOwnedProjectsFromError,
	useDeleteAccount,
	type OwnedProject,
} from "@/hooks/useAccount"

interface DeleteAccountFormProps {
	open: boolean
	onSuccess: () => Promise<void>
}

export function DeleteAccountForm({ open, onSuccess }: DeleteAccountFormProps) {
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [ownedProjects, setOwnedProjects] = useState<OwnedProject[]>([])
	const [confirmOpen, setConfirmOpen] = useState(false)
	const deleteAccount = useDeleteAccount()

	useEffect(() => {
		if (open) {
			setPassword("")
			setError("")
			setOwnedProjects([])
			setConfirmOpen(false)
		}
	}, [open])

	function handleDeleteClick() {
		if (password.length < 8) return
		setError("")
		setOwnedProjects([])
		setConfirmOpen(true)
	}

	async function handleConfirm() {
		setError("")
		setOwnedProjects([])

		try {
			await deleteAccount.mutateAsync(password)
			setConfirmOpen(false)
			await onSuccess()
		} catch (submitError) {
			setConfirmOpen(false)
			setError(getAccountErrorMessage(submitError, "Failed to delete account."))
			setOwnedProjects(getOwnedProjectsFromError(submitError))
		}
	}

	return (
		<>
			<div className="space-y-4">
				<div className="space-y-3 text-sm text-muted-foreground">
					<p>
						This permanently removes your account. Your comments will remain
						visible as &quot;Deleted User&quot; and task assignments will be
						cleared.
					</p>
					<p>
						If you own any projects, transfer ownership first using the Members
						panel on each project board.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="account-delete-password">
						Confirm with your password
					</Label>
					<Input
						id="account-delete-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
					/>
				</div>
				{error && <p className="text-sm text-destructive">{error}</p>}
				{ownedProjects.length > 0 && (
					<div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
						<p className="text-sm font-medium text-destructive">
							Transfer ownership of these projects first:
						</p>
						<ul className="list-inside list-disc text-sm text-muted-foreground">
							{ownedProjects.map((project) => (
								<li key={project.id}>{project.name}</li>
							))}
						</ul>
					</div>
				)}
				<DialogFooter className="px-0">
					<Button
						variant="destructive"
						onClick={handleDeleteClick}
						disabled={password.length < 8}
					>
						Delete account
					</Button>
				</DialogFooter>
			</div>

			<ConfirmMemberActionDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete account"
				description={
					<>
						This action cannot be undone. Your account will be anonymized and
						you will lose access to all projects.
					</>
				}
				confirmLabel="Delete account"
				isPending={deleteAccount.isPending}
				error={confirmOpen ? error : ""}
				onConfirm={handleConfirm}
			/>
		</>
	)
}
