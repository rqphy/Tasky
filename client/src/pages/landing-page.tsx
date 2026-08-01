import { Link } from "react-router-dom"
import { StarIcon } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	KanbanIcon,
	RefreshIcon,
	ShieldIcon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"

const GITHUB_URL = "https://github.com/rqphy/Tasky"
const AUTHOR_URL = "https://github.com/rqphy"

const features = [
	{
		icon: RefreshIcon,
		title: "Real-time collaboration",
		description: "Multiple users, live board updates via WebSockets",
	},
	{
		icon: KanbanIcon,
		title: "Full project management",
		description: "Projects, columns, tasks, assignments, comments",
	},
	{
		icon: UserGroupIcon,
		title: "Team features",
		description: "Invite members, roles, notifications, @mentions",
	},
	{
		icon: ShieldIcon,
		title: "Secure by default",
		description: "Token-based auth, refresh rotation, httpOnly cookies",
	},
] as const

export default function LandingPage() {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	const appHref = isAuthenticated ? "/board" : "/auth"
	const signUpHref = "/auth?tab=register"

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
				<div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
					<Link to="/" className="flex items-center gap-2.5">
						<img
							src="/android-chrome-192x192.png"
							alt="Tasky"
							className="size-8 rounded-lg"
						/>
						<span className="font-semibold">Tasky</span>
					</Link>

					<nav className="hidden items-center gap-6 md:flex">
						<a
							href="#features"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Features
						</a>
						<a
							href={GITHUB_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							GitHub
						</a>
					</nav>

					<Button asChild size="sm">
						<Link to={isAuthenticated ? "/board" : signUpHref}>
							{isAuthenticated ? "Go to app" : "Sign up"}
						</Link>
					</Button>
				</div>
			</header>

			<main>
				<section className="bg-muted/30 px-4 py-20 md:py-28">
					<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
						<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
							Project management built for teams.
							<br />
							Rebuilt for every language.
						</h1>
						<p className="mt-6 max-w-2xl text-lg text-muted-foreground">
							A full-featured kanban board — and an ongoing
							experiment in rebuilding the same backend in Go,
							Python, Rust, and beyond.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
							<Button asChild size="lg">
								<Link to={appHref}>Try the app</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<a
									href={GITHUB_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									View on GitHub
								</a>
							</Button>
						</div>
					</div>
				</section>

				<section id="features" className="px-4 py-20 md:py-24">
					<div className="mx-auto max-w-4xl">
						<h2 className="mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl">
							Everything you need to ship work
						</h2>
						<div className="grid gap-4 md:grid-cols-2">
							{features.map((feature) => (
								<Card key={feature.title}>
									<CardHeader>
										<div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-muted">
											<HugeiconsIcon
												icon={feature.icon}
												size={20}
												strokeWidth={2}
											/>
										</div>
										<CardTitle>{feature.title}</CardTitle>
										<CardDescription>
											{feature.description}
										</CardDescription>
									</CardHeader>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section className="border-y bg-muted/30 px-4 py-16 md:py-20">
					<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
						<h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
							Want to see it in action?
						</h2>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
							<Button asChild size="lg">
								<Link to={appHref}>Try the app</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<a
									href={GITHUB_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									<StarIcon />
									Star on GitHub
								</a>
							</Button>
						</div>
					</div>
				</section>
			</main>

			<footer className="px-4 py-12">
				<div className="mx-auto max-w-5xl">
					<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
						<Link to="/" className="flex items-center gap-2.5">
							<img
								src="/android-chrome-192x192.png"
								alt="Tasky"
								className="size-8 rounded-lg"
							/>
							<div className="flex flex-col gap-0.5 leading-none">
								<span className="font-semibold">Tasky</span>
								<span className="text-xs text-muted-foreground">
									Project management for teams
								</span>
							</div>
						</Link>

						<nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
							<a
								href="#features"
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								Features
							</a>
							<Link
								to={appHref}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								Try the app
							</Link>
							{!isAuthenticated && (
								<Link
									to={signUpHref}
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									Sign up
								</Link>
							)}
							<a
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								GitHub
							</a>
						</nav>
						<p className="text-sm text-muted-foreground">
							Built by{" "}
							<a
								href={AUTHOR_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground underline-offset-4 hover:underline"
							>
								rqphy
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
