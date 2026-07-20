import type { QueryClient } from "@tanstack/react-query"
import type { Column, Project, ProjectMember, Task } from "@/lib/projects"
import type {
	BoardTaskPayload,
	ColumnCreatedPayload,
	ColumnDeletedPayload,
	ColumnReorderedPayload,
	ColumnUpdatedPayload,
	MemberJoinedPayload,
	MemberRemovedPayload,
	TaskCreatedPayload,
	TaskDeletedPayload,
	TaskMovedPayload,
	TaskUpdatedPayload,
} from "@/lib/socketPayloads"

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.position - b.position)
}

function taskFromPayload(task: BoardTaskPayload): Task {
	return {
		id: task.id,
		columnId: task.columnId,
		title: task.title,
		description: task.description ?? undefined,
		assigneeId: task.assigneeId ?? undefined,
		assignee: task.assignee ?? undefined,
		label: task.label ?? undefined,
		priority: task.priority,
		position: task.position,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
		_count: task._count,
	}
}

function updateProjectCache(
	queryClient: QueryClient,
	projectId: string,
	updater: (project: Project) => Project,
): void {
	queryClient.setQueryData(
		["project", projectId],
		(old: Project | undefined) => (old ? updater(old) : old),
	)
}

function removeTaskFromColumns(columns: Column[], taskId: string): Column[] {
	return columns.map((column) => ({
		...column,
		tasks: column.tasks?.filter((task) => task.id !== taskId),
	}))
}

function insertTaskInColumn(
	columns: Column[],
	columnId: string,
	task: Task,
): Column[] {
	return columns.map((column) => {
		if (column.id !== columnId) return column
		const tasks = sortByPosition([...(column.tasks ?? []), task])
		return { ...column, tasks }
	})
}

export function patchTaskCreated(
	queryClient: QueryClient,
	payload: TaskCreatedPayload,
): void {
	const task = taskFromPayload(payload.task)
	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		return {
			...project,
			columns: insertTaskInColumn(project.columns, task.columnId, task),
		}
	})
}

export function patchTaskUpdated(
	queryClient: QueryClient,
	payload: TaskUpdatedPayload,
): void {
	const task = taskFromPayload(payload.task)

	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		const withoutTask = removeTaskFromColumns(project.columns, task.id)
		return {
			...project,
			columns: insertTaskInColumn(withoutTask, task.columnId, task),
		}
	})

	queryClient.setQueryData(
		["project", payload.projectId, "task", task.id],
		(old: Task | undefined) =>
			old
				? {
						...old,
						...task,
						comments: old.comments,
					}
				: old,
	)
}

export function patchTaskDeleted(
	queryClient: QueryClient,
	payload: TaskDeletedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		return {
			...project,
			columns: removeTaskFromColumns(project.columns, payload.taskId),
		}
	})

	queryClient.removeQueries({
		queryKey: ["project", payload.projectId, "task", payload.taskId],
	})
}

export function patchTaskMoved(
	queryClient: QueryClient,
	payload: TaskMovedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project

		let movedTask: Task | undefined
		const withoutTask = project.columns.map((column) => {
			const remaining: Task[] = []
			for (const task of column.tasks ?? []) {
				if (task.id === payload.taskId) {
					movedTask = task
				} else {
					remaining.push(task)
				}
			}
			return { ...column, tasks: remaining }
		})

		if (!movedTask) return project

		const updatedTask: Task = {
			...movedTask,
			columnId: payload.columnId,
			position: payload.position,
		}

		return {
			...project,
			columns: insertTaskInColumn(
				withoutTask,
				payload.columnId,
				updatedTask,
			),
		}
	})
}

export function patchColumnCreated(
	queryClient: QueryClient,
	payload: ColumnCreatedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => {
		const columns = sortByPosition([
			...(project.columns ?? []),
			{ ...payload.column, tasks: [] },
		])
		return { ...project, columns }
	})
}

export function patchColumnUpdated(
	queryClient: QueryClient,
	payload: ColumnUpdatedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		return {
			...project,
			columns: project.columns.map((column) =>
				column.id === payload.column.id
					? {
							...column,
							name: payload.column.name,
							color: payload.column.color,
							position: payload.column.position,
							updatedAt: payload.column.updatedAt,
						}
					: column,
			),
		}
	})
}

export function patchColumnDeleted(
	queryClient: QueryClient,
	payload: ColumnDeletedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		return {
			...project,
			columns: project.columns.filter(
				(column) => column.id !== payload.columnId,
			),
		}
	})
}

export function patchColumnReordered(
	queryClient: QueryClient,
	payload: ColumnReorderedPayload,
): void {
	const positionById = new Map(
		payload.columns.map((column) => [column.id, column.position]),
	)

	updateProjectCache(queryClient, payload.projectId, (project) => {
		if (!project.columns) return project
		const columns = sortByPosition(
			project.columns.map((column) => ({
				...column,
				position: positionById.get(column.id) ?? column.position,
			})),
		)
		return { ...project, columns }
	})
}

function memberFromPayload(
	member: MemberJoinedPayload["member"],
): ProjectMember {
	return {
		id: member.id,
		userId: member.userId,
		projectId: member.projectId,
		role: member.role,
		createdAt: member.createdAt,
		user: member.user,
	}
}

export function patchMemberJoined(
	queryClient: QueryClient,
	payload: MemberJoinedPayload,
): void {
	const member = memberFromPayload(payload.member)

	updateProjectCache(queryClient, payload.projectId, (project) => ({
		...project,
		members: [...(project.members ?? []), member],
	}))

	queryClient.setQueryData(
		["project", payload.projectId, "members"],
		(old: ProjectMember[] | undefined) =>
			old ? [...old, member] : [member],
	)

	queryClient.invalidateQueries({ queryKey: ["projects"] })
}

export function patchMemberRemoved(
	queryClient: QueryClient,
	payload: MemberRemovedPayload,
): void {
	updateProjectCache(queryClient, payload.projectId, (project) => ({
		...project,
		members: project.members?.filter(
			(member) => member.userId !== payload.userId,
		),
	}))

	queryClient.setQueryData(
		["project", payload.projectId, "members"],
		(old: ProjectMember[] | undefined) =>
			old?.filter((member) => member.userId !== payload.userId),
	)

	queryClient.invalidateQueries({ queryKey: ["projects"] })
}
