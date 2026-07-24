import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { getAccountErrorMessage, useUpdatePassword } from "@/hooks/useAccount"

interface PasswordFormProps {
	open: boolean
	onSuccess: () => Promise<void>
}

export function PasswordForm({ open, onSuccess }: PasswordFormProps) {
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [error, setError] = useState("")
	const updatePassword = useUpdatePassword()

	useEffect(() => {
		if (open) {
			setCurrentPassword("")
			setNewPassword("")
			setError("")
		}
	}, [open])

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (!currentPassword || !newPassword) return

		setError("")

		try {
			await updatePassword.mutateAsync({ currentPassword, newPassword })
			await onSuccess()
		} catch (submitError) {
			setError(
				getAccountErrorMessage(submitError, "Failed to update password."),
			)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<p className="text-sm text-muted-foreground">
				You will be signed out on all devices after changing your password.
			</p>
			<div className="space-y-2">
				<Label htmlFor="account-current-password">Current password</Label>
				<Input
					id="account-current-password"
					type="password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					autoComplete="current-password"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="account-new-password">New password</Label>
				<Input
					id="account-new-password"
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					autoComplete="new-password"
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<DialogFooter className="px-0">
				<Button
					type="submit"
					disabled={
						!currentPassword ||
						newPassword.length < 8 ||
						updatePassword.isPending
					}
				>
					{updatePassword.isPending ? "Saving..." : "Update password"}
				</Button>
			</DialogFooter>
		</form>
	)
}
