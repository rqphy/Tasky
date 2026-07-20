import axios from "axios"
import { disconnectSocket, refreshSocketAuth } from "@/lib/socket"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
})

let isRefreshing = false
let failedQueue: Array<{
	resolve: (token: string) => void
	reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token!)
		}
	})
	failedQueue = []
}

function forceSessionExpiry() {
	disconnectSocket()
	localStorage.removeItem("accessToken")
	localStorage.removeItem("refreshToken")
	window.location.href = "/auth"
}

api.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem("accessToken")
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`
						return api(originalRequest)
					})
					.catch((err) => Promise.reject(err))
			}

			originalRequest._retry = true
			isRefreshing = true

			const refreshToken = localStorage.getItem("refreshToken")

			if (!refreshToken) {
				isRefreshing = false
				forceSessionExpiry()
				return Promise.reject(error)
			}

			try {
				const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
					refreshToken,
				})

				const { accessToken, refreshToken: newRefreshToken } = response.data

				localStorage.setItem("accessToken", accessToken)
				localStorage.setItem("refreshToken", newRefreshToken)

				api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
				originalRequest.headers.Authorization = `Bearer ${accessToken}`

				refreshSocketAuth(accessToken)
				processQueue(null, accessToken)

				return api(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError, null)
				forceSessionExpiry()
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	},
)
