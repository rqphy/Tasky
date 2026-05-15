import type { TaskPriority } from "@/types/task"

export const priorityConfig: Record<
	TaskPriority,
	{ label: string; color: string; dotColor: string }
> = {
	urgent: {
		label: "Urgent",
		color: "text-red-500 dark:text-red-400",
		dotColor: "bg-red-500",
	},
	high: {
		label: "High",
		color: "text-orange-500 dark:text-orange-400",
		dotColor: "bg-orange-500",
	},
	medium: {
		label: "Medium",
		color: "text-yellow-500 dark:text-yellow-400",
		dotColor: "bg-yellow-500",
	},
	low: {
		label: "Low",
		color: "text-blue-400 dark:text-blue-300",
		dotColor: "bg-blue-400",
	},
	none: {
		label: "No priority",
		color: "text-muted-foreground",
		dotColor: "bg-muted-foreground/40",
	},
}
