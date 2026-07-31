import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
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
					<SunIcon />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<MoonIcon />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<MonitorIcon />
					System
				</DropdownMenuItem>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	)
}
