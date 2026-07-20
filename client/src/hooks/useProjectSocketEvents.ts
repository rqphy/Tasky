import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket } from "@/lib/socket"
import { BROADCAST_EVENTS, MEMBER_BROADCAST_EVENTS } from "@/lib/socketEvents"

const MEMBER_EVENTS = new Set<string>(MEMBER_BROADCAST_EVENTS)

export function useProjectSocketEvents(projectId: string | undefined) {
	const queryClient = useQueryClient()

	useEffect(() => {
		if (!projectId) return
		const socket = getSocket()
		if (!socket) return

		const invalidateProject = () => {
			queryClient.invalidateQueries({ queryKey: ["project", projectId] })
		}

		const invalidateMembers = () => {
			invalidateProject()
			queryClient.invalidateQueries({
				queryKey: ["project", projectId, "members"],
			})
			queryClient.invalidateQueries({ queryKey: ["projects"] })
		}

		const handlers = BROADCAST_EVENTS.map((event) => {
			const handler = () => {
				if (MEMBER_EVENTS.has(event)) {
					invalidateMembers()
				} else {
					invalidateProject()
				}
			}
			socket.on(event, handler)
			return { event, handler }
		})

		return () => {
			for (const { event, handler } of handlers) {
				socket.off(event, handler)
			}
		}
	}, [projectId, queryClient])
}
