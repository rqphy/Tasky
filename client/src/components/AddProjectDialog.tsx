import { useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
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

const DEFAULT_EMOJI = "📋"

interface AddProjectDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onCreate: (data: { name: string; emoji: string }) => void
	isPending?: boolean
}

export function AddProjectDialog({
	open,
	onOpenChange,
	onCreate,
	isPending = false,
}: AddProjectDialogProps) {
	const [name, setName] = useState("")
	const [emoji, setEmoji] = useState(DEFAULT_EMOJI)
	const [emojiOpen, setEmojiOpen] = useState(false)

	useEffect(() => {
		if (!open) {
			setName("")
			setEmoji(DEFAULT_EMOJI)
			setEmojiOpen(false)
		}
	}, [open])

	function handleCreate() {
		const trimmed = name.trim()
		if (!trimmed || isPending) return
		onCreate({ name: trimmed, emoji })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New project</DialogTitle>
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
								className="h-[342px]"
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
						onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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
						onClick={handleCreate}
						disabled={!name.trim() || isPending}
					>
						{isPending ? "Creating..." : "Create project"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
