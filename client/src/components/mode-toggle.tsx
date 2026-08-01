import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerIcon, MoonIcon, SunIcon } from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import {
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
	const { setTheme } = useTheme()

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<HugeiconsIcon icon={SunIcon} size={20} strokeWidth={2} />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<HugeiconsIcon icon={MoonIcon} size={20} strokeWidth={2} />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<HugeiconsIcon
						icon={ComputerIcon}
						size={20}
						strokeWidth={2}
					/>
					System
				</DropdownMenuItem>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	)
}
