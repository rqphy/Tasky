export const COLOR_MAP: Record<string, string> = {
	"#64748b": "bg-slate-400",
	"#ef4444": "bg-red-500",
	"#f97316": "bg-orange-500",
	"#fbbf24": "bg-amber-400",
	"#10b981": "bg-emerald-500",
	"#14b8a6": "bg-teal-500",
	"#06b6d4": "bg-cyan-500",
	"#8b5cf6": "bg-violet-500",
	"#d946ef": "bg-fuchsia-500",
	"#ec4899": "bg-pink-500",
	"#6366f1": "bg-indigo-500",
}

export const TAILWIND_TO_HEX: Record<string, string> = Object.fromEntries(
	Object.entries(COLOR_MAP).map(([hex, tw]) => [tw, hex])
)

export function hexToTailwind(hex: string): string {
	return COLOR_MAP[hex.toLowerCase()] ?? "bg-slate-400"
}

export function tailwindToHex(tw: string): string {
	return TAILWIND_TO_HEX[tw] ?? "#6366f1"
}
