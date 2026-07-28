import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import type { User } from "@/lib/auth"
import { getAccessToken } from "@/lib/auth"
import {
	getAccountErrorMessage,
	useRemoveProfileImage,
	useUpdateName,
} from "@/hooks/useAccount"
import { useUploadThing } from "@/lib/uploadthing"

interface GeneralFormProps {
	open: boolean
	user: User
	onUserUpdated: (user: User) => void
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()
}

export function GeneralForm({ open, user, onUserUpdated }: GeneralFormProps) {
	const [name, setName] = useState(user.name)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const fileInputRef = useRef<HTMLInputElement>(null)
	const updateName = useUpdateName()
	const removeProfileImage = useRemoveProfileImage()

	const { startUpload, isUploading } = useUploadThing("profilePicture", {
		headers: () => ({
			Authorization: `Bearer ${getAccessToken() ?? ""}`,
		}),
		onClientUploadComplete: (res) => {
			const imageUrl = res[0]?.serverData?.imageUrl
			if (typeof imageUrl === "string") {
				onUserUpdated({ ...user, imageUrl })
				setSuccess("Profile photo updated.")
			}
		},
		onUploadError: (uploadError) => {
			setError(uploadError.message || "Failed to upload profile photo.")
		},
	})

	useEffect(() => {
		if (open) {
			setName(user.name)
			setError("")
			setSuccess("")
		}
	}, [open, user])

	async function handleSubmit(e: SubmitEvent) {
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

	async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files
		if (!files?.length) return

		setError("")
		setSuccess("")

		await startUpload(Array.from(files))

		e.target.value = ""
	}

	async function handleRemovePhoto() {
		setError("")
		setSuccess("")

		try {
			const updatedUser = await removeProfileImage.mutateAsync()
			onUserUpdated(updatedUser)
			setSuccess("Profile photo removed.")
		} catch (submitError) {
			setError(
				getAccountErrorMessage(submitError, "Failed to remove profile photo."),
			)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="flex items-center gap-4">
				<Avatar size="lg">
					{user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name} />}
					<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-wrap gap-2">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={isUploading || removeProfileImage.isPending}
						onClick={() => fileInputRef.current?.click()}
					>
						{isUploading ? "Uploading..." : "Upload photo"}
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={!user.imageUrl || isUploading || removeProfileImage.isPending}
						onClick={handleRemovePhoto}
					>
						{removeProfileImage.isPending ? "Removing..." : "Remove photo"}
					</Button>
				</div>
			</div>

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
