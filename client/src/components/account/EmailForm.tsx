import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import type { User } from "@/lib/auth"
import { getAccountErrorMessage, useUpdateEmail } from "@/hooks/useAccount"

interface EmailFormProps {
	open: boolean
	user: User
	onUserUpdated: (user: User) => void
}

export function EmailForm({ open, user, onUserUpdated }: EmailFormProps) {
	const [email, setEmail] = useState(user.email)
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const updateEmail = useUpdateEmail()

	useEffect(() => {
		if (open) {
			setEmail(user.email)
			setPassword("")
			setError("")
			setSuccess("")
		}
	}, [open, user])

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		const trimmedEmail = email.trim()
		if (!trimmedEmail || !password) return

		setError("")
		setSuccess("")

		try {
			const updatedUser = await updateEmail.mutateAsync({
				email: trimmedEmail,
				password,
			})
			onUserUpdated(updatedUser)
			setPassword("")
			setSuccess("Email updated.")
		} catch (submitError) {
			setError(getAccountErrorMessage(submitError, "Failed to update email."))
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="account-email">Email</Label>
				<Input
					id="account-email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="account-email-password">Current password</Label>
				<Input
					id="account-email-password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="current-password"
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && <p className="text-sm text-muted-foreground">{success}</p>}
			<DialogFooter className="px-0">
				<Button
					type="submit"
					disabled={
						!email.trim() ||
						!password ||
						email.trim() === user.email ||
						updateEmail.isPending
					}
				>
					{updateEmail.isPending ? "Saving..." : "Save changes"}
				</Button>
			</DialogFooter>
		</form>
	)
}
