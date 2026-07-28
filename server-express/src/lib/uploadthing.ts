import { createUploadthing, type FileRouter } from "uploadthing/express"
import { UploadThingError } from "uploadthing/server"
import { authenticateRequest } from "../middleware/auth.js"
import { prisma } from "./db.js"

const f = createUploadthing()

export const uploadRouter = {
	profilePicture: f({
		image: { maxFileSize: "1MB", maxFileCount: 1 },
	})
		.middleware(async ({ req }) => {
			const user = authenticateRequest(req)
			if (!user) throw new UploadThingError("Unauthorized")
			return { userId: user.userId }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await prisma.user.update({
				where: { id: metadata.userId },
				data: { imageUrl: file.ufsUrl },
			})
			return { imageUrl: file.ufsUrl }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
