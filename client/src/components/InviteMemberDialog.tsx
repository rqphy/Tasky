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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { mockInvites } from "@/mocks/invites"

interface InviteMemberDialogProps {
	projectId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({
	projectId,
	open,
	onOpenChange,
}: InviteMemberDialogProps) {
	const [email, setEmail] = useState("")
	const [role, setRole] = useState<"member" | "viewer">("viewer")

	function handleSend() {
		if (!email.trim()) return

		mockInvites.push({
			id: `inv-${Date.now()}`,
			projectId,
			email: email.trim(),
			role,
			createdAt: new Date().toISOString(),
		})

		console.log("[InviteMemberDialog] Invite created:", {
			email: email.trim(),
			role,
			projectId,
		})

		setEmail("")
		setRole("viewer")
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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
							onKeyDown={(e) => e.key === "Enter" && handleSend()}
							autoFocus
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="invite-role">Role</Label>
						<Select
							value={role}
							onValueChange={(v) =>
								setRole(v as "member" | "viewer")
							}
						>
							<SelectTrigger id="invite-role">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="viewer">
									Viewer — can view tasks
								</SelectItem>
								<SelectItem value="member">
									Member — can edit tasks
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button onClick={handleSend} disabled={!email.trim()}>
						Send invite
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
