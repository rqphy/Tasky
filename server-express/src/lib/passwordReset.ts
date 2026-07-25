import crypto from "crypto"

const PASSWORD_RESET_TOKEN_EXPIRY = "1h"

function parseExpiryToSeconds(expiry: string): number {
	const match = expiry.match(/^(\d+)([dhms])$/)
	if (!match) return 60 * 60
	const [, value, unit] = match
	const num = parseInt(value, 10)
	switch (unit) {
		case "d":
			return num * 24 * 60 * 60
		case "h":
			return num * 60 * 60
		case "m":
			return num * 60
		case "s":
			return num
		default:
			return 60 * 60
	}
}

export function generatePasswordResetToken(): string {
	return crypto.randomBytes(64).toString("hex")
}

export function getPasswordResetExpiryDate(): Date {
	const seconds = parseExpiryToSeconds(PASSWORD_RESET_TOKEN_EXPIRY)
	return new Date(Date.now() + seconds * 1000)
}

export function buildResetPasswordUrl(token: string): string {
	const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
	return `${clientUrl}/reset-password?token=${token}`
}
