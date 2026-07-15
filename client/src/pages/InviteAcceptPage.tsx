import { useEffect, useRef } from "react"
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

export function InviteAcceptPage() {
	const { token } = useParams<{ token: string }>()
	const navigate = useNavigate()
	const { user, isAuthenticated, isLoading: authLoading } = useAuth()
	const { data: projects } = useProjects(isAuthenticated)
	const {
		data: validation,
		isLoading: validationLoading,
		error: validationError,
	} = useValidateInvite(token, isAuthenticated)
	const acceptInvite = useAcceptInvite()
	const hasAttemptedAccept = useRef(false)

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

		if (
			user &&
			validation.email &&
			user.email?.toLowerCase() !== validation.email.toLowerCase()
		) {
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
			<div className="flex min-h-svh items-center justify-center px-6">
				<p className="text-muted-foreground text-center">
					This invitation link is invalid.
				</p>
			</div>
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
			<div className="flex min-h-svh items-center justify-center px-6">
				<p className="text-muted-foreground text-center">
					This invitation is no longer valid.
				</p>
			</div>
		)
	}

	if (!validation.valid || !validation.project) {
		return (
			<div className="flex min-h-svh items-center justify-center px-6">
				<p className="text-muted-foreground text-center">
					{validation.reason || "This invitation is no longer valid."}
				</p>
			</div>
		)
	}

	const alreadyMember = projects?.some(
		(project) => project.id === validation.project?.id,
	)

	if (alreadyMember) {
		return <Navigate to={`/board/${validation.project.id}`} replace />
	}

	if (
		user &&
		validation.email &&
		user.email?.toLowerCase() !== validation.email.toLowerCase()
	) {
		return (
			<div className="flex min-h-svh items-center justify-center px-6">
				<div className="w-full max-w-md space-y-3 text-center">
					<h1 className="text-xl font-semibold">Wrong account</h1>
					<p className="text-muted-foreground text-sm">
						This invitation was sent to{" "}
						<span className="font-medium text-foreground">
							{validation.email}
						</span>
						. Sign in with that email address to accept it.
					</p>
				</div>
			</div>
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

		return (
			<div className="flex min-h-svh items-center justify-center px-6">
				<p className="text-destructive text-center">{message}</p>
			</div>
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
