export interface PublicUserProfile {
	id: string
	name: string
	email: string
	imageUrl?: string | null
	bio?: string | null
	jobTitle?: string | null
	company?: string | null
}
