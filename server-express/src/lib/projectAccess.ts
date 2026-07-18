import { prisma } from "./db.js"

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
