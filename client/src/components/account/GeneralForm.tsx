import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import type { User } from "@/lib/auth"
import { getAccountErrorMessage, useUpdateName } from "@/hooks/useAccount"

interface GeneralFormProps {
	open: boolean
	user: User
	onUserUpdated: (user: User) => void
}

export function GeneralForm({ open, user, onUserUpdated }: GeneralFormProps) {
	const [name, setName] = useState(user.name)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const updateName = useUpdateName()

	useEffect(() => {
		if (open) {
			setName(user.name)
			setError("")
			setSuccess("")
		}
	}, [open, user])

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		const trimmed = name.trim()
		if (!trimmed) return

		setError("")
		setSuccess("")

		try {
			const updatedUser = await updateName.mutateAsync(trimmed)
			onUserUpdated(updatedUser)
			setSuccess("Display name updated.")
		} catch (submitError) {
			setError(getAccountErrorMessage(submitError, "Failed to update name."))
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="account-name">Display name</Label>
				<Input
					id="account-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					autoComplete="name"
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && <p className="text-sm text-muted-foreground">{success}</p>}
			<DialogFooter className="px-0">
				<Button
					type="submit"
					disabled={
						!name.trim() ||
						name.trim() === user.name ||
						updateName.isPending
					}
				>
					{updateName.isPending ? "Saving..." : "Save changes"}
				</Button>
			</DialogFooter>
		</form>
	)
}
