export function buildInviteUrl(token: string): string {
	const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
	return `${clientUrl}/invite/${token}`
}
