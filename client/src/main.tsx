import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import "./index.css"
import { AuthPage } from "@/pages/AuthPage"
import { AppLayout } from "@/layouts/AppLayout"
import { BoardPage } from "@/pages/BoardPage"
import { mockProjects } from "@/mocks/projects"

const router = createBrowserRouter([
	{
		path: "/auth",
		element: <AuthPage />,
	},
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: (
					<Navigate to={`/board/${mockProjects[0].id}`} replace />
				),
			},
			{
				path: "board/:projectId",
				element: <BoardPage />,
			},
		],
	},
])

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
