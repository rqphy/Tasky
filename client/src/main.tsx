import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import { AuthPage } from "@/pages/auth-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"
import { AppLayout } from "@/layouts/app-layout"
import { BoardPage } from "@/pages/board-page"
import { ShareBoardPage } from "@/pages/share-board-page"
import { InviteAcceptPage } from "@/pages/invite-accept-page"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProjectRedirect } from "@/components/project-redirect"
import { ThemeProvider } from "@/components/theme-provider"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 1,
		},
	},
})

const router = createBrowserRouter([
	{
		path: "/auth",
		element: <AuthPage />,
	},
	{
		path: "/forgot-password",
		element: <ForgotPasswordPage />,
	},
	{
		path: "/reset-password",
		element: <ResetPasswordPage />,
	},
	{
		path: "/share/:token",
		element: <ShareBoardPage />,
	},
	{
		path: "/invite/:token",
		element: <InviteAcceptPage />,
	},
	{
		path: "/",
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppLayout />,
				children: [
					{
						index: true,
						element: <ProjectRedirect />,
					},
					{
						path: "board/:projectId",
						element: <BoardPage />,
					},
				],
			},
		],
	},
])

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
)
