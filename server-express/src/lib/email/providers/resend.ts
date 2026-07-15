import { Resend } from "resend"
import type {
	EmailProvider,
	EmailSendResult,
	SendInviteEmailParams,
} from "../types.js"

export function createResendProvider(): EmailProvider {
	return {
		async sendInvite(
			params: SendInviteEmailParams,
			subject: string,
			html: string,
		): Promise<EmailSendResult> {
			const apiKey = process.env.RESEND_API_KEY
			const from = process.env.RESEND_FROM_EMAIL

			if (!apiKey) {
				console.warn("RESEND_API_KEY is not configured; skipping invite email")
				return { sent: false, error: "RESEND_API_KEY is not configured" }
			}

			if (!from) {
				console.warn(
					"RESEND_FROM_EMAIL is not configured; skipping invite email",
				)
				return {
					sent: false,
					error: "RESEND_FROM_EMAIL is not configured",
				}
			}

			const resend = new Resend(apiKey)
			const { error } = await resend.emails.send({
				from,
				to: params.to,
				subject,
				html,
			})

			if (error) {
				console.error("Failed to send invite email:", error.message)
				return { sent: false, error: error.message }
			}

			return { sent: true }
		},
	}
}
