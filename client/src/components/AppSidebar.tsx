import { NavLink, useParams } from "react-router-dom"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar"
import { mockProjects } from "@/mocks/projects"
import { mockUsers } from "@/mocks/users"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const currentUser = mockUsers[0]

export function AppSidebar() {
	const { projectId } = useParams<{ projectId: string }>()

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
									T
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">Tasky</span>
									<span className="text-xs text-muted-foreground">
										Project Manager
									</span>
								</div>
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Projects</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mockProjects.map((project) => (
								<SidebarMenuItem key={project.id}>
									<SidebarMenuButton
										asChild
										isActive={project.id === projectId}
										tooltip={project.name}
									>
										<NavLink to={`/board/${project.id}`}>
											<span className="text-base">
												{project.emoji}
											</span>
											<span>{project.name}</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg">
							<Avatar className="size-8">
								<AvatarFallback className="text-xs">
									{currentUser.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col gap-0.5 leading-none">
								<span className="text-sm font-medium">
									{currentUser.name}
								</span>
								<span className="text-xs text-muted-foreground">
									Free plan
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	)
}
