import { Outlet } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/AppSidebar"
import { useGlobalProjectSocketEvents } from "@/hooks/useGlobalProjectSocketEvents"
import { useGlobalNotificationSocketEvents } from "@/hooks/useGlobalNotificationSocketEvents"

export function AppLayout() {
	useGlobalProjectSocketEvents()
	useGlobalNotificationSocketEvents()

	return (
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<div className="flex flex-1 flex-col min-h-0">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	)
}
