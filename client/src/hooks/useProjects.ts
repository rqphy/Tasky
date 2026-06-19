import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	projectsApi,
	type CreateProjectInput,
	type UpdateProjectInput,
	type CreateColumnInput,
	type UpdateColumnInput,
} from "@/lib/projects"

export function useProjects() {
	return useQuery({
		queryKey: ["projects"],
		queryFn: () => projectsApi.list().then((r) => r.data),
	})
}

export function useProject(id: string | undefined) {
	return useQuery({
		queryKey: ["project", id],
		queryFn: () => projectsApi.get(id!).then((r) => r.data),
		enabled: !!id,
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
