import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { invitesApi, type CreateInviteInput } from "@/lib/invites"

export function useProjectInvites(projectId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["project", projectId, "invites"],
		queryFn: () => invitesApi.listInvites(projectId!),
		enabled: !!projectId && enabled,
	})
}

export function useCreateInvite(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateInviteInput) =>
			invitesApi.createInvite(projectId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "invites"],
			})
		},
	})
}

export function useRevokeInvite(projectId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (inviteId: string) =>
			invitesApi.revokeInvite(projectId, inviteId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "invites"],
			})
		},
	})
}

export function useValidateInvite(token: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["invite", token, "validate"],
		queryFn: () => invitesApi.validateInvite(token!),
		enabled: !!token && enabled,
		retry: false,
	})
}

export function useAcceptInvite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (token: string) => invitesApi.acceptInvite(token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			queryClient.invalidateQueries({
				queryKey: ["project", data.project.id],
			})
		},
	})
}
