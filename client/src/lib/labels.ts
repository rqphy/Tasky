import type { TaskLabel } from "@/types/task"

export const labelConfig: Record<
	TaskLabel,
	{ text: string; className: string }
> = {
	bug: {
		text: "Bug",
		className:
			"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	feature: {
		text: "Feature",
		className:
			"bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
	},
	improvement: {
		text: "Improvement",
		className:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	documentation: {
		text: "Docs",
		className:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	chore: {
		text: "Chore",
		className:
			"bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
	},
}

export const TASK_LABELS: { value: TaskLabel; label: string }[] = [
	{ value: "feature", label: "Feature" },
	{ value: "bug", label: "Bug" },
	{ value: "improvement", label: "Improvement" },
	{ value: "documentation", label: "Documentation" },
	{ value: "chore", label: "Chore" },
]
