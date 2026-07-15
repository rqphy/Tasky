const PENDING_INVITE_TOKEN_KEY = "pendingInviteToken"

export function setPendingInviteToken(token: string): void {
	sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, token)
}

export function getPendingInviteToken(): string | null {
	return sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY)
}

export function clearPendingInviteToken(): void {
	sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY)
}
