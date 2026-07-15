import { createResendProvider } from "./providers/resend.js"
import {
	renderInviteEmailHtml,
	renderInviteEmailSubject,
} from "./templates/inviteEmail.js"
import type { EmailProvider, EmailSendResult, SendInviteEmailParams } from "./types.js"

let emailProvider: EmailProvider | null = null

function getEmailProvider(): EmailProvider {
	if (!emailProvider) {
		emailProvider = createResendProvider()
	}

	return emailProvider
}

export async function sendInviteEmail(
	params: SendInviteEmailParams,
): Promise<EmailSendResult> {
	try {
		const subject = renderInviteEmailSubject(params)
		const html = renderInviteEmailHtml(params)
		return await getEmailProvider().sendInvite(params, subject, html)
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown email error"
		console.error("Unexpected invite email error:", message)
		return { sent: false, error: message }
	}
}

export type { SendInviteEmailParams, EmailSendResult } from "./types.js"
