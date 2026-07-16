import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	projectsApi,
	patchTaskCount,
	type CreateProjectInput,
	type UpdateProjectInput,
	type CreateColumnInput,
	type UpdateColumnInput,
	type CreateTaskInput,
	type UpdateTaskInput,
	type MoveTaskInput,
	type Project,
	type Task,
	type Comment,
} from "@/lib/projects"

export function useProjects(enabled = true) {
	return useQuery({
		queryKey: ["projects"],
		queryFn: () => projectsApi.list().then((r) => r.data),
		enabled,
	})
}

export function useProject(id: string | undefined) {
	return useQuery({
		queryKey: ["project", id],
		queryFn: () => projectsApi.get(id!).then((r) => r.data),
		enabled: !!id,
		refetchOnMount: "always",
	})
}

export function useProjectMembers(projectId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["project", projectId, "members"],
		queryFn: () => projectsApi.getMembers(projectId!).then((r) => r.data),
		enabled: !!projectId && enabled,
	})
}

export function useCreateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateProjectInput) =>
			projectsApi.create(data).then((r) => r.data),
		onSuccess: (newProject) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.setQueryData(["project", newProject.id], newProject)
			queryClient.setQueryData(
				["project", newProject.id, "members"],
				newProject.members ?? [],
			)
		},
	})
}

export function useUpdateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
			projectsApi.update(id, data).then((r) => r.data),
		onSuccess: (updatedProject) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.setQueryData(["project", updatedProject.id], updatedProject)
		},
	})
}

export function useDeleteProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => projectsApi.delete(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.removeQueries({ queryKey: ["project", id] })
		},
	})
}

export function useRemoveMember() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			projectId,
			userId,
		}: {
			projectId: string
			userId: string
		}) => projectsApi.removeMember(projectId, userId),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "members"],
			})
		},
	})
}

export function useTransferOwnership(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (userId: string) =>
			projectsApi.transferOwnership(projectId, userId).then((r) => r.data),
		onSuccess: (updated) => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "members"],
			})
			queryClient.setQueryData(
				["project", projectId],
				(old: Project | undefined) =>
					old ? { ...old, ownerId: updated.ownerId } : old,
			)
		},
	})
}

export function useCreateColumn(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateColumnInput) =>
			projectsApi.createColumn(projectId, data).then((r) => r.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useUpdateColumn(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			columnId,
			data,
		}: {
			columnId: string
			data: UpdateColumnInput
		}) => projectsApi.updateColumn(projectId, columnId, data).then((r) => r.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useDeleteColumn(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (columnId: string) =>
			projectsApi.deleteColumn(projectId, columnId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useReorderColumns(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (columnIds: string[]) =>
			projectsApi.reorderColumns(projectId, columnIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useCreateTask(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateTaskInput) =>
			projectsApi.createTask(projectId, data).then((r) => r.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useUpdateTask(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			taskId,
			data,
		}: {
			taskId: string
			data: UpdateTaskInput
		}) =>
			projectsApi.updateTask(projectId, taskId, data).then((r) => r.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useDeleteTask(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (taskId: string) =>
			projectsApi.deleteTask(projectId, taskId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		},
	})
}

export function useMoveTask(projectId: string) {
	return useMutation({
		mutationFn: ({
			taskId,
			data,
		}: {
			taskId: string
			data: MoveTaskInput
		}) => projectsApi.moveTask(projectId, taskId, data).then((r) => r.data),
	})
}

export function useTask(
	projectId: string | undefined,
	taskId: string,
	enabled: boolean,
) {
	return useQuery({
		queryKey: ["project", projectId, "task", taskId],
		queryFn: () => projectsApi.getTask(projectId!, taskId).then((r) => r.data),
		enabled: !!projectId && !!taskId && enabled,
	})
}

export function useCreateComment(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			taskId,
			content,
		}: {
			taskId: string
			content: string
		}) =>
			projectsApi
				.createComment(projectId, taskId, { content })
				.then((r) => r.data),
		onSuccess: (comment, { taskId }) => {
			queryClient.setQueryData(
				["project", projectId, "task", taskId],
				(old: Task | undefined) =>
					old
						? {
								...old,
								comments: [...(old.comments ?? []), comment],
							}
						: old,
			)
			queryClient.setQueryData(
				["project", projectId],
				(old: Project | undefined) =>
					old ? patchTaskCount(old, taskId, 1) : old,
			)
		},
	})
}

export function useDeleteComment(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			taskId,
			commentId,
		}: {
			taskId: string
			commentId: string
		}) => projectsApi.deleteComment(projectId, taskId, commentId),
		onSuccess: (_, { taskId, commentId }) => {
			queryClient.setQueryData(
				["project", projectId, "task", taskId],
				(old: Task | undefined) =>
					old
						? {
								...old,
								comments: (old.comments ?? []).filter(
									(c: Comment) => c.id !== commentId,
								),
							}
						: old,
			)
			queryClient.setQueryData(
				["project", projectId],
				(old: Project | undefined) =>
					old ? patchTaskCount(old, taskId, -1) : old,
			)
		},
	})
}
