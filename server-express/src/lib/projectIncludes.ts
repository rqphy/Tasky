import { userPublicSelect } from "./userHelpers.js"

export const projectBoardInclude = {
	columns: {
		orderBy: { position: "asc" as const },
		include: {
			tasks: {
				orderBy: { position: "asc" as const },
				include: {
					assignee: {
						select: userPublicSelect,
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
				select: userPublicSelect,
			},
		},
	},
	...projectBoardInclude,
}
