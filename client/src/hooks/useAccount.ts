import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import {
	deleteAccount,
	removeProfileImage,
	updateEmail,
	updateProfile,
	updatePassword,
} from "@/lib/auth"

export interface OwnedProject {
	id: string
	name: string
}

export function getAccountErrorMessage(
	error: unknown,
	fallback: string,
): string {
	if (
		isAxiosError(error) &&
		error.response?.data &&
		typeof error.response.data === "object" &&
		"error" in error.response.data &&
		typeof error.response.data.error === "string"
	) {
		return error.response.data.error
	}
	return fallback
}

export function getOwnedProjectsFromError(error: unknown): OwnedProject[] {
	if (
		isAxiosError(error) &&
		error.response?.data &&
		typeof error.response.data === "object" &&
		"ownedProjects" in error.response.data &&
		Array.isArray(error.response.data.ownedProjects)
	) {
		return error.response.data.ownedProjects as OwnedProject[]
	}
	return []
}

export function useUpdateProfile() {
	return useMutation({
		mutationFn: (input: {
			name: string
			bio?: string
			jobTitle?: string
			company?: string
		}) => updateProfile(input),
	})
}

export function useUpdateEmail() {
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			updateEmail(email, password),
	})
}

export function useUpdatePassword() {
	return useMutation({
		mutationFn: ({
			currentPassword,
			newPassword,
		}: {
			currentPassword: string
			newPassword: string
		}) => updatePassword(currentPassword, newPassword),
	})
}

export function useDeleteAccount() {
	return useMutation({
		mutationFn: (password: string) => deleteAccount(password),
	})
}

export function useRemoveProfileImage() {
	return useMutation({
		mutationFn: () => removeProfileImage(),
	})
}
