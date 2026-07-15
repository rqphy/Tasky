import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateInvite } from "@/hooks/useInvites"

interface InviteMemberDialogProps {
	projectId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const axiosError = error as { response?: { data?: { error?: string } } }
		return axiosError.response?.data?.error || "Failed to send invite."
	}

	return "Failed to send invite."
}

export function InviteMemberDialog({
	projectId,
	open,
	onOpenChange,
}: InviteMemberDialogProps) {
	const [email, setEmail] = useState("")
	const [error, setError] = useState("")
	const [emailWarning, setEmailWarning] = useState("")
	const createInvite = useCreateInvite(projectId)

	async function handleSend() {
		if (!email.trim()) return

		setError("")
		setEmailWarning("")

		try {
			const result = await createInvite.mutateAsync({
				email: email.trim(),
			})

			if (!result.emailSent) {
				setEmailWarning(
					"Invite saved but the email could not be sent. You can share the invite link manually.",
				)
			}

			setEmail("")
			if (result.emailSent) {
				onOpenChange(false)
			}
		} catch (inviteError) {
			setError(getErrorMessage(inviteError))
		}
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setEmail("")
			setError("")
			setEmailWarning("")
		}

		onOpenChange(nextOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite a member</DialogTitle>
					<DialogDescription>
						Send an invite by email. They'll get access once they
						accept.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="invite-email">Email address</Label>
						<Input
							id="invite-email"
							type="email"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" &&
								!createInvite.isPending &&
								handleSend()
							}
							autoFocus
							disabled={createInvite.isPending}
						/>
					</div>

					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}
					{emailWarning && (
						<p className="text-sm text-amber-600 dark:text-amber-400">
							{emailWarning}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={createInvite.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSend}
						disabled={!email.trim() || createInvite.isPending}
					>
						{createInvite.isPending ? "Sending..." : "Send invite"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
