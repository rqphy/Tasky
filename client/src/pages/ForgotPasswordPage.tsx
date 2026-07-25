import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { forgotPassword } from "@/lib/auth"
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

export function ForgotPasswordPage() {
	const { isAuthenticated, isLoading } = useAuth()
	const [email, setEmail] = useState("")
	const [error, setError] = useState("")
	const [submitted, setSubmitted] = useState(false)
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

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		setError("")
		setIsSubmitting(true)

		try {
			await forgotPassword(email.trim())
			setSubmitted(true)
		} catch (submitError) {
			setError(getErrorMessage(submitError, "Something went wrong. Please try again."))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-6 px-4">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">
						Forgot password
					</h1>
					<p className="text-muted-foreground text-sm">
						Enter your email and we&apos;ll send you a reset link if an
						account exists.
					</p>
				</div>

				{submitted ? (
					<div className="space-y-4 rounded-lg border bg-card p-6 text-center">
						<p className="text-sm text-muted-foreground">
							If an account exists for that email, a reset link has been sent.
							Check your inbox and spam folder.
						</p>
						<Button asChild variant="outline" className="w-full" size="lg">
							<Link to="/auth">Back to sign in</Link>
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="forgot-email" className="text-sm font-medium">
								Email
							</label>
							<Input
								id="forgot-email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isSubmitting}
								autoComplete="email"
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button
							type="submit"
							className="w-full"
							size="lg"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Sending..." : "Send reset link"}
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
				)}
			</div>
		</div>
	)
}
