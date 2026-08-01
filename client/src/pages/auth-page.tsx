import { useState, useEffect, type FormEvent } from "react"
import { Navigate, useSearchParams, Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import {
	getPendingInviteToken,
	setPendingInviteToken,
} from "@/lib/invite-token"

export function AuthPage() {
	const { login, register, isAuthenticated, isLoading } = useAuth()
	const [searchParams] = useSearchParams()
	const inviteToken =
		searchParams.get("inviteToken") ?? getPendingInviteToken()
	const defaultTab =
		searchParams.get("tab") === "register" ? "register" : "login"

	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [registerName, setRegisterName] = useState("")
	const [registerEmail, setRegisterEmail] = useState("")
	const [registerPassword, setRegisterPassword] = useState("")

	const [loginError, setLoginError] = useState("")
	const [registerError, setRegisterError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		const tokenFromUrl = searchParams.get("inviteToken")
		if (tokenFromUrl) {
			setPendingInviteToken(tokenFromUrl)
		}
	}, [searchParams])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (isAuthenticated) {
		return (
			<Navigate
				to={inviteToken ? `/invite/${inviteToken}` : "/board"}
				replace
			/>
		)
	}

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault()
		setLoginError("")
		setIsSubmitting(true)

		try {
			await login(loginEmail, loginPassword)
		} catch (error) {
			if (error instanceof Error) {
				const axiosError = error as { response?: { data?: { error?: string } } }
				setLoginError(
					axiosError.response?.data?.error || "Login failed. Please try again.",
				)
			} else {
				setLoginError("Login failed. Please try again.")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault()
		setRegisterError("")
		setIsSubmitting(true)

		try {
			await register(registerName, registerEmail, registerPassword)
		} catch (error) {
			if (error instanceof Error) {
				const axiosError = error as { response?: { data?: { error?: string } } }
				setRegisterError(
					axiosError.response?.data?.error ||
						"Registration failed. Please try again.",
				)
			} else {
				setRegisterError("Registration failed. Please try again.")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-6 px-4">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Tasky</h1>
					<p className="text-muted-foreground text-sm">
						{inviteToken
							? "Sign in or create an account to accept your project invitation."
							: "Manage your projects with ease."}
					</p>
				</div>

				<Tabs defaultValue={defaultTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="login">Login</TabsTrigger>
						<TabsTrigger value="register">Register</TabsTrigger>
					</TabsList>

					<TabsContent value="login" className="space-y-4 pt-4">
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="login-email"
									className="text-sm font-medium"
								>
									Email
								</label>
								<Input
									id="login-email"
									type="email"
									placeholder="you@example.com"
									value={loginEmail}
									onChange={(e) => setLoginEmail(e.target.value)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="login-password"
									className="text-sm font-medium"
								>
									Password
								</label>
								<Input
									id="login-password"
									type="password"
									placeholder="••••••••"
									value={loginPassword}
									onChange={(e) => setLoginPassword(e.target.value)}
									required
									disabled={isSubmitting}
								/>
								<div className="text-right">
									<Link
										to="/forgot-password"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Forgot password?
									</Link>
								</div>
							</div>
							{loginError && (
								<p className="text-sm text-destructive">{loginError}</p>
							)}
							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Signing in..." : "Sign in"}
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="register" className="space-y-4 pt-4">
						<form onSubmit={handleRegister} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="register-name"
									className="text-sm font-medium"
								>
									Name
								</label>
								<Input
									id="register-name"
									type="text"
									placeholder="Your name"
									value={registerName}
									onChange={(e) => setRegisterName(e.target.value)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="register-email"
									className="text-sm font-medium"
								>
									Email
								</label>
								<Input
									id="register-email"
									type="email"
									placeholder="you@example.com"
									value={registerEmail}
									onChange={(e) => setRegisterEmail(e.target.value)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="register-password"
									className="text-sm font-medium"
								>
									Password
								</label>
								<Input
									id="register-password"
									type="password"
									placeholder="••••••••"
									value={registerPassword}
									onChange={(e) => setRegisterPassword(e.target.value)}
									required
									disabled={isSubmitting}
								/>
							</div>
							{registerError && (
								<p className="text-sm text-destructive">{registerError}</p>
							)}
							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating account..." : "Create account"}
							</Button>
						</form>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
