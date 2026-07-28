import { api } from "./api"

export interface User {
	id: string
	name: string
	email: string
	imageUrl?: string | null
	createdAt: string
	updatedAt: string
}

export interface AuthResponse {
	user: User
	accessToken: string
	refreshToken: string
}

export interface TokenResponse {
	accessToken: string
	refreshToken: string
}

export function getAccessToken(): string | null {
	return localStorage.getItem("accessToken")
}

export function getRefreshToken(): string | null {
	return localStorage.getItem("refreshToken")
}

export function setTokens(accessToken: string, refreshToken: string): void {
	localStorage.setItem("accessToken", accessToken)
	localStorage.setItem("refreshToken", refreshToken)
}

export function clearTokens(): void {
	localStorage.removeItem("accessToken")
	localStorage.removeItem("refreshToken")
}

export function isAuthenticated(): boolean {
	return !!getAccessToken()
}

export async function login(
	email: string,
	password: string,
): Promise<AuthResponse> {
	const response = await api.post<AuthResponse>("/auth/login", {
		email,
		password,
	})
	const { accessToken, refreshToken } = response.data
	setTokens(accessToken, refreshToken)
	return response.data
}

export async function register(
	name: string,
	email: string,
	password: string,
): Promise<AuthResponse> {
	const response = await api.post<AuthResponse>("/auth/register", {
		name,
		email,
		password,
	})
	const { accessToken, refreshToken } = response.data
	setTokens(accessToken, refreshToken)
	return response.data
}

export async function logout(): Promise<void> {
	const refreshToken = getRefreshToken()
	if (refreshToken) {
		try {
			await api.post("/auth/logout", { refreshToken })
		} catch {
			// Ignore errors during logout
		}
	}
	clearTokens()
}

export async function getCurrentUser(): Promise<User> {
	const response = await api.get<{ user: User }>("/auth/me")
	return response.data.user
}

export async function updateName(name: string): Promise<User> {
	const response = await api.patch<{ user: User }>("/users/me/name", { name })
	return response.data.user
}

export async function updateEmail(
	email: string,
	password: string,
): Promise<User> {
	const response = await api.patch<{ user: User }>("/users/me/email", {
		email,
		password,
	})
	return response.data.user
}

export async function updatePassword(
	currentPassword: string,
	newPassword: string,
): Promise<void> {
	await api.patch("/users/me/password", { currentPassword, newPassword })
	clearTokens()
}

export async function deleteAccount(password: string): Promise<void> {
	await api.delete("/users/me", { data: { password } })
	clearTokens()
}

export async function forgotPassword(email: string): Promise<void> {
	await api.post("/auth/forgot-password", { email })
}

export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<void> {
	await api.post("/auth/reset-password", { token, newPassword })
}

export async function removeProfileImage(): Promise<User> {
	const response = await api.delete<{ user: User }>("/users/me/image")
	return response.data.user
}

export async function refreshTokens(): Promise<TokenResponse> {
	const refreshToken = getRefreshToken()
	if (!refreshToken) {
		throw new Error("No refresh token available")
	}
	const response = await api.post<TokenResponse>("/auth/refresh", {
		refreshToken,
	})
	const { accessToken, refreshToken: newRefreshToken } = response.data
	setTokens(accessToken, newRefreshToken)
	return response.data
}
