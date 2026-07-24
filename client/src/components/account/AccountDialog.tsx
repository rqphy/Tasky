import { useNavigate } from "react-router-dom"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import type { User } from "@/lib/auth"
import { GeneralForm } from "./GeneralForm"
import { EmailForm } from "./EmailForm"
import { PasswordForm } from "./PasswordForm"
import { DeleteAccountForm } from "./DeleteAccountForm"

interface AccountDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	user: User | null
}

export function AccountDialog({ open, onOpenChange, user }: AccountDialogProps) {
	const { setUser, logout } = useAuth()
	const navigate = useNavigate()

	async function handleSessionEnd() {
		onOpenChange(false)
		await logout()
		navigate("/auth")
	}

	if (!user) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Account settings</DialogTitle>
					<DialogDescription>
						Manage your profile, credentials, and account.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="email">Email</TabsTrigger>
						<TabsTrigger value="password">Password</TabsTrigger>
						<TabsTrigger value="delete">Delete</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-4 pt-4">
						<GeneralForm
							open={open}
							user={user}
							onUserUpdated={setUser}
						/>
					</TabsContent>

					<TabsContent value="email" className="space-y-4 pt-4">
						<EmailForm open={open} user={user} onUserUpdated={setUser} />
					</TabsContent>

					<TabsContent value="password" className="space-y-4 pt-4">
						<PasswordForm open={open} onSuccess={handleSessionEnd} />
					</TabsContent>

					<TabsContent value="delete" className="space-y-4 pt-4">
						<DeleteAccountForm open={open} onSuccess={handleSessionEnd} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
