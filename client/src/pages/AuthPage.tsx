import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AuthPage() {
	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [registerName, setRegisterName] = useState("")
	const [registerEmail, setRegisterEmail] = useState("")
	const [registerPassword, setRegisterPassword] = useState("")

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-6 px-4">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Tasky</h1>
					<p className="text-muted-foreground text-sm">
						Manage your projects with ease.
					</p>
				</div>

				<Tabs defaultValue="login" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="login">Login</TabsTrigger>
						<TabsTrigger value="register">Register</TabsTrigger>
					</TabsList>

					<TabsContent value="login" className="space-y-4 pt-4">
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
								onChange={(e) =>
									setLoginPassword(e.target.value)
								}
							/>
						</div>
						<Button className="w-full" size="lg">
							Sign in
						</Button>
					</TabsContent>

					<TabsContent value="register" className="space-y-4 pt-4">
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
								onChange={(e) =>
									setRegisterName(e.target.value)
								}
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
								onChange={(e) =>
									setRegisterEmail(e.target.value)
								}
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
								onChange={(e) =>
									setRegisterPassword(e.target.value)
								}
							/>
						</div>
						<Button className="w-full" size="lg">
							Create account
						</Button>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
