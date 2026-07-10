export const projectBoardInclude = {
	columns: {
		orderBy: { position: "asc" as const },
		include: {
			tasks: {
				orderBy: { position: "asc" as const },
				include: {
					assignee: {
						select: { id: true, name: true, email: true },
					},
					_count: {
						select: { comments: true },
					},
				},
			},
		},
	},
}

export const projectWithMembersInclude = {
	members: {
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
	},
	...projectBoardInclude,
}
