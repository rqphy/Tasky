import { useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogDescription,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	EmojiPicker,
	EmojiPickerSearch,
	EmojiPickerContent,
	EmojiPickerFooter,
} from "@/components/ui/emoji-picker"
import type { Project } from "@/lib/projects"

const DEFAULT_EMOJI = "📋"

interface EditProjectDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	project: Project | null
	onSave: (data: { name: string; emoji: string }) => void
	isPending?: boolean
}

export function EditProjectDialog({
	open,
	onOpenChange,
	project,
	onSave,
	isPending = false,
}: EditProjectDialogProps) {
	const [name, setName] = useState("")
	const [emoji, setEmoji] = useState(DEFAULT_EMOJI)
	const [emojiOpen, setEmojiOpen] = useState(false)

	useEffect(() => {
		if (open && project) {
			setName(project.name)
			setEmoji(project.emoji || DEFAULT_EMOJI)
			setEmojiOpen(false)
		}
		if (!open) {
			setEmojiOpen(false)
		}
	}, [open, project])

	function handleSave() {
		const trimmed = name.trim()
		if (!trimmed || isPending) return
		onSave({ name: trimmed, emoji })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit project</DialogTitle>
					<DialogDescription className="sr-only">
						Edit the name and emoji of the project.
					</DialogDescription>
				</DialogHeader>
				<div className="flex gap-2">
					<Popover open={emojiOpen} onOpenChange={setEmojiOpen} modal>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-9 shrink-0 text-xl"
								aria-label="Choose project emoji"
							>
								{emoji}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-fit p-0"
							align="start"
							side="bottom"
						>
							<EmojiPicker
								className="h-85.5"
								onEmojiSelect={({ emoji: selected }) => {
									setEmoji(selected)
									setEmojiOpen(false)
								}}
							>
								<EmojiPickerSearch />
								<EmojiPickerContent />
								<EmojiPickerFooter />
							</EmojiPicker>
						</PopoverContent>
					</Popover>
					<Input
						placeholder="Project name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						autoFocus
					/>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={!name.trim() || isPending}
					>
						{isPending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
