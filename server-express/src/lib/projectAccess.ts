import { prisma } from "./db.js"

export async function getProjectMemberUserIds(
	projectId: string,
): Promise<string[]> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			ownerId: true,
			members: { select: { userId: true } },
		},
	})
	if (!project) return []

	const userIds = new Set(project.members.map((m) => m.userId))
	userIds.add(project.ownerId)
	return [...userIds]
}

export async function verifyProjectMember(
	projectId: string,
	userId: string,
): Promise<
	| { error: string; status: number }
	| {
			project: NonNullable<
				Awaited<ReturnType<typeof prisma.project.findUnique>>
			>
	  }
> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		include: { members: { where: { userId } } },
	})
	if (!project) return { error: "Project not found", status: 404 }

	const isOwner = project.ownerId === userId
	const isMember = project.members.some(
		(m) => m.role === "OWNER" || m.role === "MEMBER",
	)

	if (!isOwner && !isMember) {
		return { error: "Access denied", status: 403 }
	}
	return { project }
}

export async function verifyProjectOwner(
	projectId: string,
	userId: string,
): Promise<
	| { error: string; status: number }
	| {
			project: NonNullable<
				Awaited<ReturnType<typeof prisma.project.findUnique>>
			>
	  }
> {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	})
	if (!project) return { error: "Project not found", status: 404 }
	if (project.ownerId !== userId) {
		return {
			error: "Only the owner can perform this action",
			status: 403,
		}
	}
	return { project }
}
