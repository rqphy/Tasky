import { useState, type FormEvent } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { resetPassword } from "@/lib/auth"
import { isAxiosError } from "axios"

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

export function ResetPasswordPage() {
	const { isAuthenticated, isLoading } = useAuth()
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")

	const [newPassword, setNewPassword] = useState("")
	const [error, setError] = useState("")
	const [success, setSuccess] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />
	}

	if (!token) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="w-full max-w-md space-y-6 px-4 text-center">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Invalid reset link
						</h1>
						<p className="text-muted-foreground text-sm">
							This password reset link is missing or invalid. Request a new
							one to continue.
						</p>
					</div>
					<Button asChild className="w-full" size="lg">
						<Link to="/forgot-password">Request new link</Link>
					</Button>
					<Link
						to="/auth"
						className="inline-block text-sm text-muted-foreground hover:text-foreground"
					>
						Back to sign in
					</Link>
				</div>
			</div>
		)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (!token || newPassword.length < 8) return

		setError("")
		setIsSubmitting(true)

		try {
			await resetPassword(token, newPassword)
			setSuccess(true)
		} catch (submitError) {
			setError(
				getErrorMessage(submitError, "Failed to reset password. Please try again."),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="w-full max-w-md space-y-6 px-4 text-center">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Password updated
						</h1>
						<p className="text-muted-foreground text-sm">
							Your password has been reset. Sign in with your new password.
						</p>
					</div>
					<Button asChild className="w-full" size="lg">
						<Link to="/auth">Sign in</Link>
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-6 px-4">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
					<p className="text-muted-foreground text-sm">
						Choose a new password for your account.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="reset-password" className="text-sm font-medium">
							New password
						</label>
						<Input
							id="reset-password"
							type="password"
							placeholder="••••••••"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							minLength={8}
							disabled={isSubmitting}
							autoComplete="new-password"
						/>
					</div>
					{error && (
						<div className="space-y-2">
							<p className="text-sm text-destructive">{error}</p>
							<Link
								to="/forgot-password"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Request a new reset link
							</Link>
						</div>
					)}
					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={isSubmitting || newPassword.length < 8}
					>
						{isSubmitting ? "Resetting..." : "Reset password"}
					</Button>
					<div className="text-center">
						<Link
							to="/auth"
							className="text-sm text-muted-foreground hover:text-foreground"
						>
							Back to sign in
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}
