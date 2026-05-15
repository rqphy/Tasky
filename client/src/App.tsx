import { KanbanBoard } from "@/components/KanbanBoard"

function App() {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b px-8 py-4">
				<h1 className="text-xl font-bold tracking-tight">Tasky</h1>
			</header>
			<main className="px-8 py-6 overflow-x-auto">
				<KanbanBoard />
			</main>
		</div>
	)
}

export default App
