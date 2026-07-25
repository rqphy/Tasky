export interface SendInviteEmailParams {
	to: string
	projectName: string
	projectEmoji: string
	inviterName: string
	role: "MEMBER" | "VIEWER"
	acceptUrl: string
}

export interface SendPasswordResetEmailParams {
	to: string
	userName: string
	resetUrl: string
}

export interface EmailSendResult {
	sent: boolean
	error?: string
}

export interface EmailProvider {
	sendInvite(
		params: SendInviteEmailParams,
		subject: string,
		html: string,
	): Promise<EmailSendResult>
	sendPasswordReset(
		params: SendPasswordResetEmailParams,
		subject: string,
		html: string,
	): Promise<EmailSendResult>
}
