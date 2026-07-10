export function buildShareUrl(token: string): string {
	const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
	return `${clientUrl}/share/${token}`
}
