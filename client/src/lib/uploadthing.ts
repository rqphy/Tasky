import {
	generateUploadButton,
	generateReactHelpers,
} from "@uploadthing/react"

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export const UploadButton = generateUploadButton({
	url: `${apiUrl}/uploadthing`,
})

export const { useUploadThing } = generateReactHelpers({
	url: `${apiUrl}/uploadthing`,
})
