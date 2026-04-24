import { TaskCard } from "@/components/TaskCard"
import { mockTasks } from "@/mocks/tasks"

function App() {
	return (
		<div className="min-h-screen bg-background p-8">
			<h1 className="text-2xl font-bold mb-6">Tasky</h1>
			<div className="flex flex-wrap gap-4">
				{mockTasks.map((task) => (
					<TaskCard key={task.id} {...task} />
				))}
			</div>
		</div>
	)
}

export default App
