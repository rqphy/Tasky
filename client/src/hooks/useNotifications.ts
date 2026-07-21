import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	notificationsApi,
	mapNotification,
	type Notification,
} from "@/lib/notifications"

export function useNotifications(projectId: string) {
	const query = useQuery({
		queryKey: ["notifications"],
		queryFn: () =>
			notificationsApi.list().then((r) => r.data.map(mapNotification)),
	})

	const projectNotifications = useMemo(() => {
		if (!query.data) return []
		return query.data
			.filter((n) => n.projectId === projectId)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
	}, [query.data, projectId])

	const unreadNotifications = useMemo(
		() => projectNotifications.filter((n) => !n.isRead),
		[projectNotifications],
	)

	const readNotifications = useMemo(
		() => projectNotifications.filter((n) => n.isRead),
		[projectNotifications],
	)

	const unreadCount = unreadNotifications.length

	const refresh = () => {
		void query.refetch()
	}

	return {
		notifications: projectNotifications,
		unreadNotifications,
		readNotifications,
		unreadCount,
		isLoading: query.isLoading,
		refresh,
	}
}

export function useAllNotifications() {
	const query = useQuery({
		queryKey: ["notifications"],
		queryFn: () =>
			notificationsApi.list().then((r) => r.data.map(mapNotification)),
	})

	return {
		notifications: query.data ?? [],
		isLoading: query.isLoading,
	}
}

export function useMarkAsRead() {
	const queryClient = useQueryClient()

	const markReadMutation = useMutation({
		mutationFn: (notificationId: string) =>
			notificationsApi.markRead(notificationId).then((r) => mapNotification(r.data)),
		onMutate: async (notificationId) => {
			await queryClient.cancelQueries({ queryKey: ["notifications"] })
			const previous = queryClient.getQueryData<Notification[]>(["notifications"])
			queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
				prev?.map((n) =>
					n.id === notificationId ? { ...n, isRead: true } : n,
				),
			)
			return { previous }
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["notifications"], context.previous)
			}
		},
		onSuccess: (updated) => {
			queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
				prev?.map((n) => (n.id === updated.id ? updated : n)),
			)
		},
	})

	const markAllReadMutation = useMutation({
		mutationFn: (projectId: string) => notificationsApi.markAllRead(projectId),
		onMutate: async (projectId) => {
			await queryClient.cancelQueries({ queryKey: ["notifications"] })
			const previous = queryClient.getQueryData<Notification[]>(["notifications"])
			queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
				prev?.map((n) =>
					n.projectId === projectId ? { ...n, isRead: true } : n,
				),
			)
			return { previous }
		},
		onError: (_err, _projectId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["notifications"], context.previous)
			}
		},
	})

	const markAsRead = (notificationId: string, onSuccess?: () => void) => {
		markReadMutation.mutate(notificationId, { onSuccess: () => onSuccess?.() })
	}

	const toggleRead = (notificationId: string, onSuccess?: () => void) => {
		const notification = queryClient
			.getQueryData<Notification[]>(["notifications"])
			?.find((n) => n.id === notificationId)

		if (notification && !notification.isRead) {
			markAsRead(notificationId, onSuccess)
		}
	}

	const markAllAsRead = (projectId: string, onSuccess?: () => void) => {
		markAllReadMutation.mutate(projectId, { onSuccess: () => onSuccess?.() })
	}

	return {
		markAsRead,
		toggleRead,
		markAllAsRead,
	}
}
