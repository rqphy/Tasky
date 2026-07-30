/** First letters of up to two name parts, uppercased (e.g. "Jane Doe" → "JD"). */
export function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase()
}
