import { api } from "./api"

export interface User {
	id: string
	name: string
	email: string
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
	const response = await api.get<User>("/auth/me")
	return response.data
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
