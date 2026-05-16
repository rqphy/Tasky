import { useState, useEffect } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Column } from "@/types/task"

const PRESET_COLORS = [
	{ label: "Slate", value: "bg-slate-400" },
	{ label: "Red", value: "bg-red-500" },
	{ label: "Orange", value: "bg-orange-500" },
	{ label: "Amber", value: "bg-amber-400" },
	{ label: "Emerald", value: "bg-emerald-500" },
	{ label: "Teal", value: "bg-teal-500" },
	{ label: "Cyan", value: "bg-cyan-500" },
	{ label: "Violet", value: "bg-violet-500" },
	{ label: "Fuchsia", value: "bg-fuchsia-500" },
	{ label: "Pink", value: "bg-pink-500" },
]

interface ColumnDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** If provided, we're in edit mode; otherwise add mode */
	column?: Column
	onSave: (column: Column) => void
}

export function ColumnDialog({
	open,
	onOpenChange,
	column,
	onSave,
}: ColumnDialogProps) {
	const isEdit = !!column
	const [name, setName] = useState(column?.label ?? "")
	const [color, setColor] = useState(column?.color ?? PRESET_COLORS[0].value)

	// Reset form whenever the dialog opens or the target column changes
	useEffect(() => {
		if (open) {
			setName(column?.label ?? "")
			setColor(column?.color ?? PRESET_COLORS[0].value)
		}
	}, [open, column])

	function handleSave() {
		const trimmed = name.trim()
		if (!trimmed) return
		onSave({
			// Keep existing id in edit mode; generate a url-safe slug for new columns
			id:
				column?.id ??
				trimmed.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
			label: trimmed,
			color,
		})
		onOpenChange(false)
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") handleSave()
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit column" : "Add column"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-5 py-2">
					{/* Name */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Name
						</label>
						<input
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Column name…"
							className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
						/>
					</div>

					{/* Color swatches */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Color
						</label>
						<div className="flex flex-wrap gap-2">
							{PRESET_COLORS.map((c) => (
								<button
									key={c.value}
									type="button"
									title={c.label}
									onClick={() => setColor(c.value)}
									className={`size-6 rounded-full transition-all ${c.value} ${
										color === c.value
											? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
											: "opacity-60 hover:opacity-100 hover:scale-110"
									}`}
								/>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!name.trim()}>
						{isEdit ? "Save" : "Add"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
