import { useState } from "react"
import { NavLink, useParams, useNavigate } from "react-router-dom"
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AddProjectDialog } from "./AddProjectDialog"
import { getUnreadCountForProject } from "@/lib/notifications"
import { useAuth } from "@/contexts/AuthContext"
import { useProjects, useCreateProject } from "@/hooks/useProjects"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"

export function AppSidebar() {
	const { projectId } = useParams<{ projectId: string }>()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [projectName, setProjectName] = useState("")
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	const { data: projects, isLoading } = useProjects()
	const createProject = useCreateProject()

	function handleCreate() {
		if (!projectName.trim()) return
		createProject.mutate(
			{ name: projectName.trim() },
			{
				onSuccess: (newProject) => {
					setProjectName("")
					setDialogOpen(false)
					navigate(`/board/${newProject.id}`)
				},
			}
		)
	}

	async function handleLogout() {
		await logout()
		navigate("/auth")
	}

	return (
		<>
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
										<span className="font-semibold">
											Tasky
										</span>
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
								{isLoading ? (
									<SidebarMenuItem>
										<SidebarMenuButton disabled>
											<HugeiconsIcon
												icon={Loading01Icon}
												size={24}
												strokeWidth={2}
												className="animate-spin"
											/>
											<span>Loading...</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								) : (
									projects?.map((project) => {
										const unreadCount =
											getUnreadCountForProject(project.id)
										return (
											<SidebarMenuItem key={project.id}>
												<SidebarMenuButton
													asChild
													isActive={
														project.id === projectId
													}
													tooltip={project.name}
												>
													<NavLink
														to={`/board/${project.id}`}
													>
														<span className="relative text-base">
															{project.emoji}
															{unreadCount > 0 && (
																<span className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full border border-background" />
															)}
														</span>
														<span>{project.name}</span>
													</NavLink>
												</SidebarMenuButton>
											</SidebarMenuItem>
										)
									})
								)}
								<SidebarMenuItem>
									<SidebarMenuButton
										className="text-muted-foreground"
										onClick={() => setDialogOpen(true)}
										disabled={createProject.isPending}
									>
										{createProject.isPending
											? "Creating..."
											: "+ Create a new project"}
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton size="lg">
										<Avatar className="size-8">
											<AvatarFallback className="text-xs">
												{user?.name
													.split(" ")
													.map((n) => n[0])
													.join("") || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col gap-0.5 leading-none">
											<span className="text-sm font-medium">
												{user?.name}
											</span>
											<span className="text-xs text-muted-foreground">
												{user?.email}
											</span>
										</div>
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									side="top"
									align="start"
									className="w-56"
								>
									<DropdownMenuLabel>
										My Account
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem disabled>
										Profile
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleLogout}>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>
			<AddProjectDialog
				dialogOpen={dialogOpen}
				setDialogOpen={setDialogOpen}
				projectName={projectName}
				setProjectName={setProjectName}
				handleCreate={handleCreate}
			/>
		</>
	)
}
