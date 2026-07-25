import { Resend } from "resend"
import type { EmailSendResult } from "../types.js"

async function sendEmail(
	to: string,
	subject: string,
	html: string,
	logLabel: string,
): Promise<EmailSendResult> {
	const apiKey = process.env.RESEND_API_KEY
	const from = process.env.RESEND_FROM_EMAIL

	if (!apiKey) {
		console.warn(`RESEND_API_KEY is not configured; skipping ${logLabel}`)
		return { sent: false, error: "RESEND_API_KEY is not configured" }
	}

	if (!from) {
		console.warn(`RESEND_FROM_EMAIL is not configured; skipping ${logLabel}`)
		return { sent: false, error: "RESEND_FROM_EMAIL is not configured" }
	}

	const resend = new Resend(apiKey)
	const { error } = await resend.emails.send({
		from,
		to,
		subject,
		html,
	})

	if (error) {
		console.error(`Failed to send ${logLabel}:`, error.message)
		return { sent: false, error: error.message }
	}

	return { sent: true }
}

export function createResendProvider() {
	return {
		sendInvite(
			params: { to: string },
			subject: string,
			html: string,
		): Promise<EmailSendResult> {
			return sendEmail(params.to, subject, html, "invite email")
		},
		sendPasswordReset(
			params: { to: string },
			subject: string,
			html: string,
		): Promise<EmailSendResult> {
			return sendEmail(params.to, subject, html, "password reset email")
		},
	}
}
