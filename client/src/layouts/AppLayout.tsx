import { Outlet, useNavigate } from "react-router-dom"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function AppLayout() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await logout()
		navigate("/auth")
	}

	return (
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 h-4!"
						/>
						<span className="text-sm text-muted-foreground">
							Board
						</span>
						<div className="ml-auto flex items-center gap-3">
							{user && (
								<span className="text-sm text-muted-foreground">
									{user.name}
								</span>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLogout}
							>
								Logout
							</Button>
						</div>
					</header>
					<div className="flex flex-1 flex-col min-h-0">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	)
}
