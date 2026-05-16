import { KanbanBoard } from "@/components/KanbanBoard"

function App() {
	return (
		<div className="h-screen flex flex-col bg-background">
			<header className="border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">Tasky</h1>
			</header>
			<main className="flex-1 px-8 py-6 overflow-x-auto min-h-0">
				<KanbanBoard />
			</main>
		</div>
	)
}

export default App
