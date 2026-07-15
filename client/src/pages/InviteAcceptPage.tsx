import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useProjects } from "@/hooks/useProjects"
import { useAcceptInvite, useValidateInvite } from "@/hooks/useInvites"
import {
	clearPendingInviteToken,
	setPendingInviteToken,
} from "@/lib/inviteToken"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"
import { isAxiosError } from "axios"

function normalizeEmail(email?: string): string {
	return email?.trim().toLowerCase() ?? ""
}

function emailsMatch(a?: string, b?: string): boolean {
	const normalizedA = normalizeEmail(a)
	const normalizedB = normalizeEmail(b)

	if (!normalizedA || !normalizedB) {
		return false
	}

	return normalizedA === normalizedB
}

function InviteErrorCard({
	title,
	children,
	actions,
}: {
	title: string
	children: ReactNode
	actions?: ReactNode
}) {
	return (
		<div className="flex min-h-svh items-center justify-center bg-background px-4">
			<div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
				<div className="space-y-2 text-center">
					<h1 className="text-xl font-semibold">{title}</h1>
					<div className="text-muted-foreground text-sm">{children}</div>
				</div>
				{actions ?? (
					<Button asChild variant="outline" className="w-full" size="lg">
						<Link to="/">Go to home</Link>
					</Button>
				)}
			</div>
		</div>
	)
}

export function InviteAcceptPage() {
	const { token } = useParams<{ token: string }>()
	const navigate = useNavigate()
	const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
	const { data: projects } = useProjects(isAuthenticated)
	const {
		data: validation,
		isLoading: validationLoading,
		error: validationError,
	} = useValidateInvite(token, isAuthenticated)
	const acceptInvite = useAcceptInvite()
	const hasAttemptedAccept = useRef(false)
	const [isSigningOut, setIsSigningOut] = useState(false)

	useEffect(() => {
		if (token) {
			setPendingInviteToken(token)
		}
	}, [token])

	useEffect(() => {
		if (
			!isAuthenticated ||
			!token ||
			!validation?.valid ||
			!validation.project ||
			acceptInvite.isPending ||
			acceptInvite.isSuccess ||
			hasAttemptedAccept.current
		) {
			return
		}

		const projectId = validation.project.id
		const alreadyMember = projects?.some(
			(project) => project.id === projectId,
		)

		if (alreadyMember) {
			clearPendingInviteToken()
			navigate(`/board/${projectId}`, { replace: true })
			return
		}

		if (validation.email && !emailsMatch(user?.email, validation.email)) {
			return
		}

		hasAttemptedAccept.current = true

		acceptInvite.mutate(token, {
			onSuccess: (data) => {
				clearPendingInviteToken()
				navigate(`/board/${data.project.id}`, { replace: true })
			},
			onError: (error) => {
				if (
					isAxiosError(error) &&
					error.response?.status === 409 &&
					validation.project
				) {
					clearPendingInviteToken()
					navigate(`/board/${validation.project.id}`, {
						replace: true,
					})
					return
				}

				hasAttemptedAccept.current = false
			},
		})
	}, [
		acceptInvite,
		isAuthenticated,
		navigate,
		projects,
		token,
		user,
		validation,
	])

	async function handleSignOutAndSwitch() {
		if (!token) return

		setIsSigningOut(true)

		try {
			await logout()
			navigate(`/auth?inviteToken=${token}`)
		} finally {
			setIsSigningOut(false)
		}
	}

	if (authLoading) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="animate-spin text-muted-foreground"
				/>
			</div>
		)
	}

	if (!token) {
		return (
			<InviteErrorCard title="Invalid invitation">
				<p>This invitation link is invalid.</p>
			</InviteErrorCard>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-svh items-center justify-center bg-background px-4">
				<div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
					<div className="space-y-2 text-center">
						<h1 className="text-2xl font-bold tracking-tight">
							Project invitation
						</h1>
						<p className="text-muted-foreground text-sm">
							You've been invited to join a project. Sign in or
							create an account to accept.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<Button asChild size="lg">
							<Link to={`/auth?inviteToken=${token}`}>
								Sign in to accept
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link to={`/auth?inviteToken=${token}`}>
								Create an account
							</Link>
						</Button>
					</div>
				</div>
			</div>
		)
	}

	if (validationLoading || acceptInvite.isPending) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="animate-spin text-muted-foreground"
				/>
			</div>
		)
	}

	if (validationError || !validation) {
		return (
			<InviteErrorCard title="Invitation unavailable">
				<p>This invitation is no longer valid.</p>
			</InviteErrorCard>
		)
	}

	if (!validation.valid || !validation.project) {
		return (
			<InviteErrorCard title="Invitation unavailable">
				<p>{validation.reason || "This invitation is no longer valid."}</p>
			</InviteErrorCard>
		)
	}

	const alreadyMember = projects?.some(
		(project) => project.id === validation.project?.id,
	)

	if (alreadyMember) {
		return <Navigate to={`/board/${validation.project.id}`} replace />
	}

	if (validation.email && !emailsMatch(user?.email, validation.email)) {
		return (
			<InviteErrorCard
				title="Wrong account"
				actions={
					<div className="flex flex-col gap-3">
						<Button
							size="lg"
							className="w-full"
							onClick={handleSignOutAndSwitch}
							disabled={isSigningOut}
						>
							{isSigningOut
								? "Signing out..."
								: "Sign out and switch account"}
						</Button>
						<Button asChild variant="outline" size="lg" className="w-full">
							<Link to="/">Go to home</Link>
						</Button>
					</div>
				}
			>
				<p>
					This invitation was sent to{" "}
					<span className="font-medium text-foreground">
						{validation.email}
					</span>
					.
				</p>
				{user?.email ? (
					<p className="pt-2">
						You're signed in as{" "}
						<span className="font-medium text-foreground">
							{user.email}
						</span>
						. Sign in with the invited email address to accept it.
					</p>
				) : (
					<p className="pt-2">
						Sign in with the invited email address to accept it.
					</p>
				)}
			</InviteErrorCard>
		)
	}

	if (acceptInvite.isError) {
		const message =
			isAxiosError(acceptInvite.error) &&
			acceptInvite.error.response?.data &&
			typeof acceptInvite.error.response.data === "object" &&
			"error" in acceptInvite.error.response.data &&
			typeof acceptInvite.error.response.data.error === "string"
				? acceptInvite.error.response.data.error
				: "Failed to accept invitation."

		const isEmailMismatch =
			isAxiosError(acceptInvite.error) &&
			acceptInvite.error.response?.status === 403

		return (
			<InviteErrorCard
				title="Could not accept invitation"
				actions={
					<div className="flex flex-col gap-3">
						{isEmailMismatch && (
							<Button
								size="lg"
								className="w-full"
								onClick={handleSignOutAndSwitch}
								disabled={isSigningOut}
							>
								{isSigningOut
									? "Signing out..."
									: "Sign out and switch account"}
							</Button>
						)}
						<Button asChild variant="outline" size="lg" className="w-full">
							<Link to="/">Go to home</Link>
						</Button>
					</div>
				}
			>
				<p className="text-destructive">{message}</p>
			</InviteErrorCard>
		)
	}

	return (
		<div className="flex min-h-svh items-center justify-center px-6">
			<div className="space-y-3 text-center">
				<HugeiconsIcon
					icon={Loading01Icon}
					size={24}
					strokeWidth={2}
					className="mx-auto animate-spin text-muted-foreground"
				/>
				<p className="text-muted-foreground text-sm">
					Accepting your invitation to {validation.project.emoji}{" "}
					{validation.project.name}...
				</p>
			</div>
		</div>
	)
}
