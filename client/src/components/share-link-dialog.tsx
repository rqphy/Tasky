import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useShareLink, useUpdateShareLink } from "@/hooks/useShare"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"

interface ShareLinkDialogProps {
	projectId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ShareLinkDialog({
	projectId,
	open,
	onOpenChange,
}: ShareLinkDialogProps) {
	const { data: shareLink, isLoading } = useShareLink(projectId, open)
	const updateShareLink = useUpdateShareLink(projectId)
	const [copied, setCopied] = useState(false)

	const isActive = shareLink?.isActive ?? false
	const url = shareLink?.url ?? ""

	async function handleCopy() {
		if (!url) return
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	function handleToggle(checked: boolean) {
		updateShareLink.mutate({ isActive: checked })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share board</DialogTitle>
					<DialogDescription>
						Anyone with the link can view this board in read-only
						mode.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex justify-center py-6">
						<HugeiconsIcon
							icon={Loading01Icon}
							size={20}
							strokeWidth={2}
							className="animate-spin text-muted-foreground"
						/>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between gap-4">
							<Label htmlFor="share-enabled" className="text-sm">
								Enable public link
							</Label>
							<Switch
								id="share-enabled"
								checked={isActive}
								disabled={updateShareLink.isPending}
								onCheckedChange={handleToggle}
							/>
						</div>

						{isActive && url && (
							<div className="flex flex-col gap-2">
								<Label htmlFor="share-url" className="text-sm">
									Shareable link
								</Label>
								<div className="flex gap-2">
									<Input
										id="share-url"
										readOnly
										value={url}
										className="font-mono text-xs"
									/>
									<Button
										variant="outline"
										onClick={handleCopy}
										className="shrink-0"
									>
										{copied ? "Copied!" : "Copy"}
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
