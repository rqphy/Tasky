import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import type { User } from "@/lib/auth"
import { getAccessToken } from "@/lib/auth"
import {
	getAccountErrorMessage,
	useRemoveProfileImage,
	useUpdateProfile,
} from "@/hooks/useAccount"
import { useUploadThing } from "@/lib/uploadthing"
import { getInitials } from "@/lib/user"

interface GeneralFormProps {
	open: boolean
	user: User
	onUserUpdated: (user: User) => void
}

function optionalField(value: string | null | undefined): string {
	return value ?? ""
}

function hasProfileChanges(
	user: User,
	fields: { name: string; bio: string; jobTitle: string; company: string },
): boolean {
	return (
		fields.name.trim() !== user.name ||
		fields.bio.trim() !== optionalField(user.bio).trim() ||
		fields.jobTitle.trim() !== optionalField(user.jobTitle).trim() ||
		fields.company.trim() !== optionalField(user.company).trim()
	)
}

export function GeneralForm({ open, user, onUserUpdated }: GeneralFormProps) {
	const [name, setName] = useState(user.name)
	const [bio, setBio] = useState(optionalField(user.bio))
	const [jobTitle, setJobTitle] = useState(optionalField(user.jobTitle))
	const [company, setCompany] = useState(optionalField(user.company))
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const fileInputRef = useRef<HTMLInputElement>(null)
	const updateProfile = useUpdateProfile()
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

	const isDirty = hasProfileChanges(user, { name, bio, jobTitle, company })

	useEffect(() => {
		if (open) {
			setError("")
			setSuccess("")
		}
	}, [open])

	useEffect(() => {
		if (open) {
			setName(user.name)
			setBio(optionalField(user.bio))
			setJobTitle(optionalField(user.jobTitle))
			setCompany(optionalField(user.company))
		}
	}, [open, user.name, user.bio, user.jobTitle, user.company])

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName) return

		setError("")
		setSuccess("")

		try {
			const updatedUser = await updateProfile.mutateAsync({
				name: trimmedName,
				bio,
				jobTitle,
				company,
			})
			onUserUpdated(updatedUser)
			setSuccess("Profile updated.")
		} catch (submitError) {
			setError(getAccountErrorMessage(submitError, "Failed to update profile."))
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

			<div className="space-y-2">
				<Label htmlFor="account-job-title">Job title</Label>
				<Input
					id="account-job-title"
					value={jobTitle}
					onChange={(e) => setJobTitle(e.target.value)}
					placeholder="Software Engineer"
					autoComplete="organization-title"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="account-company">Company</Label>
				<Input
					id="account-company"
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					placeholder="Acme Inc."
					autoComplete="organization"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="account-bio">Bio</Label>
				<Textarea
					id="account-bio"
					value={bio}
					onChange={(e) => setBio(e.target.value)}
					placeholder="Tell your team a little about yourself"
					rows={4}
					maxLength={500}
				/>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
			)}
			<DialogFooter className="px-0">
				<Button
					type="submit"
					disabled={!name.trim() || !isDirty || updateProfile.isPending}
				>
					{updateProfile.isPending ? "Saving..." : "Save changes"}
				</Button>
			</DialogFooter>
		</form>
	)
}
