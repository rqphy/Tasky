import {
	createUploadthing,
	type FileRouter,
} from "uploadthing/express"
import { UploadThingError } from "uploadthing/server"
import { verifyAccessToken } from "./jwt.js"
import { prisma } from "./db.js"

const f = createUploadthing()

export const uploadRouter = {
	profilePicture: f({
		image: { maxFileSize: "2MB", maxFileCount: 1 },
	})
		.middleware(async ({ req }) => {
			const authHeader = req.headers.authorization
			const token = authHeader?.startsWith("Bearer ")
				? authHeader.slice(7)
				: null
			const payload = token ? verifyAccessToken(token) : null
			if (!payload) throw new UploadThingError("Unauthorized")
			return { userId: payload.userId }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await prisma.user.update({
				where: { id: metadata.userId },
				data: { imageUrl: file.url },
			})
			return { imageUrl: file.url }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
