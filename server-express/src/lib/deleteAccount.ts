import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "./db.js"
import { DELETED_USER_NAME, deletedUserEmail } from "./userHelpers.js"

export class OwnedProjectsError extends Error {
	ownedProjects: { id: string; name: string }[]

	constructor(ownedProjects: { id: string; name: string }[]) {
		super("Transfer ownership of all projects before deleting your account")
		this.name = "OwnedProjectsError"
		this.ownedProjects = ownedProjects
	}
}

export async function deleteUserAccount(userId: string): Promise<void> {
	const ownedProjects = await prisma.project.findMany({
		where: { ownerId: userId },
		select: { id: true, name: true },
	})

	if (ownedProjects.length > 0) {
		throw new OwnedProjectsError(ownedProjects)
	}

	const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)

	await prisma.$transaction([
		prisma.task.updateMany({
			where: { assigneeId: userId },
			data: { assigneeId: null },
		}),
		prisma.projectMember.deleteMany({
			where: { userId },
		}),
		prisma.refreshToken.deleteMany({
			where: { userId },
		}),
		prisma.passwordResetToken.deleteMany({
			where: { userId },
		}),
		prisma.user.update({
			where: { id: userId },
			data: {
				name: DELETED_USER_NAME,
				email: deletedUserEmail(userId),
				password: unusablePassword,
			},
		}),
	])
}
