import { useState, type ReactNode } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmMemberActionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: ReactNode
	confirmLabel: string
	confirmVariant?: "default" | "destructive"
	isPending?: boolean
	error?: string
	onConfirm: () => void | Promise<void>
}

export function ConfirmMemberActionDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	confirmVariant = "destructive",
	isPending = false,
	error,
	onConfirm,
}: ConfirmMemberActionDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleConfirm() {
		setIsSubmitting(true)
		try {
			await onConfirm()
		} finally {
			setIsSubmitting(false)
		}
	}

	const pending = isPending || isSubmitting

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={pending}
					>
						Cancel
					</Button>
					<Button
						variant={confirmVariant}
						onClick={handleConfirm}
						disabled={pending}
					>
						{pending ? "Working..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
