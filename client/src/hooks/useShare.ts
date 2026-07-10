import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shareApi } from "@/lib/share"

export function useShareLink(projectId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["project", projectId, "share"],
		queryFn: () => shareApi.getShareLink(projectId!).then((r) => r.data),
		enabled: !!projectId && enabled,
	})
}

export function useUpdateShareLink(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: { isActive: boolean }) =>
			shareApi.updateShareLink(projectId, data).then((r) => r.data),
		onSuccess: (data) => {
			queryClient.setQueryData(["project", projectId, "share"], data)
		},
	})
}

export function useSharedProject(token: string | undefined) {
	return useQuery({
		queryKey: ["share", token],
		queryFn: () => shareApi.getSharedProject(token!),
		enabled: !!token,
		retry: false,
	})
}
