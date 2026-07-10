import axios from "axios"
import { api } from "./api"
import type { Project } from "./projects"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export interface ShareLinkState {
	isActive: boolean
	url?: string
}

export interface UpdateShareLinkInput {
	isActive: boolean
}

export const shareApi = {
	getShareLink: (projectId: string) =>
		api.get<ShareLinkState>(`/projects/${projectId}/share`),

	updateShareLink: (projectId: string, data: UpdateShareLinkInput) =>
		api.patch<ShareLinkState>(`/projects/${projectId}/share`, data),

	getSharedProject: (token: string) =>
		axios
			.get<Project>(`${API_BASE_URL}/share/${token}`)
			.then((response) => response.data),
}
