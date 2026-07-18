import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import "@/lib/socket"
import { AuthPage } from "@/pages/AuthPage"
import { AppLayout } from "@/layouts/AppLayout"
import { BoardPage } from "@/pages/BoardPage"
import { ShareBoardPage } from "@/pages/ShareBoardPage"
import { InviteAcceptPage } from "@/pages/InviteAcceptPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProjectRedirect } from "@/components/ProjectRedirect"

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
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
)
