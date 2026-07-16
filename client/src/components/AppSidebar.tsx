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
	SidebarMenuAction,
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
import { ConfirmMemberActionDialog } from "@/components/ConfirmMemberActionDialog"
import { getUnreadCountForProject } from "@/lib/notifications"
import { useAuth } from "@/contexts/AuthContext"
import {
	useProjects,
	useCreateProject,
	useDeleteProject,
	useRemoveMember,
} from "@/hooks/useProjects"
import type { Project } from "@/lib/projects"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { isAxiosError } from "axios"

type PendingProjectAction =
	| { type: "leave"; project: Project }
	| { type: "delete"; project: Project }
	| null

function getErrorMessage(error: unknown, fallback: string): string {
	if (
		isAxiosError(error) &&
		error.response?.data &&
		typeof error.response.data === "object" &&
		"error" in error.response.data &&
		typeof error.response.data.error === "string"
	) {
		return error.response.data.error
	}
	return fallback
}

export function AppSidebar() {
	const { projectId } = useParams<{ projectId: string }>()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [projectName, setProjectName] = useState("")
	const [pendingAction, setPendingAction] = useState<PendingProjectAction>(null)
	const [actionError, setActionError] = useState("")
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	const { data: projects, isLoading } = useProjects()
	const createProject = useCreateProject()
	const deleteProject = useDeleteProject()
	const removeMember = useRemoveMember()

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
			},
		)
	}

	async function handleLogout() {
		await logout()
		navigate("/auth")
	}

	function closeActionDialog() {
		setPendingAction(null)
		setActionError("")
	}

	async function handleConfirmAction() {
		if (!pendingAction || !user) return

		setActionError("")

		try {
			if (pendingAction.type === "leave") {
				await removeMember.mutateAsync({
					projectId: pendingAction.project.id,
					userId: user.id,
				})
			} else {
				await deleteProject.mutateAsync(pendingAction.project.id)
			}

			const leftProjectId = pendingAction.project.id
			closeActionDialog()

			if (projectId === leftProjectId) {
				navigate("/")
			}
		} catch (error) {
			setActionError(
				getErrorMessage(
					error,
					pendingAction.type === "leave"
						? "Failed to leave project."
						: "Failed to delete project.",
				),
			)
		}
	}

	const isActionPending = deleteProject.isPending || removeMember.isPending

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
										const isActive = project.id === projectId
										const isOwner =
											!!user && project.ownerId === user.id

										return (
											<SidebarMenuItem key={project.id}>
												<SidebarMenuButton
													asChild
													isActive={isActive}
													tooltip={project.name}
												>
													<NavLink
														to={`/board/${project.id}`}
													>
														<span className="relative text-base">
															{project.emoji}
															{unreadCount >
																0 && (
																<span className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full border border-background" />
															)}
														</span>
														<span>
															{project.name}
														</span>
													</NavLink>
												</SidebarMenuButton>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<SidebarMenuAction
															showOnHover
															className={
																isActive
																	? "md:opacity-100"
																	: undefined
															}
															aria-label={`${project.name} options`}
														>
															<HugeiconsIcon
																icon={
																	MoreHorizontalIcon
																}
																size={16}
																strokeWidth={2}
															/>
														</SidebarMenuAction>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														side="right"
														align="start"
													>
														{isOwner ? (
															<DropdownMenuItem
																variant="destructive"
																onClick={() => {
																	setActionError(
																		"",
																	)
																	setPendingAction(
																		{
																			type: "delete",
																			project,
																		},
																	)
																}}
															>
																Delete project
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem
																variant="destructive"
																onClick={() => {
																	setActionError(
																		"",
																	)
																	setPendingAction(
																		{
																			type: "leave",
																			project,
																		},
																	)
																}}
															>
																Leave project
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
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
											{user?.name && (
												<AvatarFallback className="text-xs">
													{user?.name
														.split(" ")
														.map((n) => n[0])
														.join("") || "U"}
												</AvatarFallback>
											)}
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

			<ConfirmMemberActionDialog
				open={pendingAction?.type === "leave"}
				onOpenChange={(next) => {
					if (!next) closeActionDialog()
				}}
				title="Leave project"
				description={
					<>
						Leave {pendingAction?.project.name}? You will lose
						access to this board.
					</>
				}
				confirmLabel="Leave project"
				isPending={isActionPending}
				error={actionError}
				onConfirm={handleConfirmAction}
			/>

			<ConfirmMemberActionDialog
				open={pendingAction?.type === "delete"}
				onOpenChange={(next) => {
					if (!next) closeActionDialog()
				}}
				title="Delete project"
				description={
					<>
						Delete {pendingAction?.project.name}? This permanently
						removes all columns, tasks, and members.
					</>
				}
				confirmLabel="Delete project"
				isPending={isActionPending}
				error={actionError}
				onConfirm={handleConfirmAction}
			/>
		</>
	)
}
