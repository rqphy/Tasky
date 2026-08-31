import { describe, it, expect } from "vitest"
import { api } from "../helpers/client.js"
import {
	authAs,
	createProject,
	createColumn,
	createTask,
	type RequestHeaders,
} from "../helpers/fixtures.js"

const SHARE_URL_PATTERN =
	/^http:\/\/localhost:5173\/share\/([0-9a-f]{64})$/

/** Token is embedded in the client URL returned by PATCH /projects/:id/share */
function extractShareToken(url: string): string {
	const match = url.match(SHARE_URL_PATTERN)
	if (!match) {
		throw new Error(`Unexpected share URL: ${url}`)
	}
	return match[1]
}

async function enableShareLink(projectId: string, headers: RequestHeaders) {
	const response = await api.patch<{ isActive: boolean; url?: string }>(
		`/projects/${projectId}/share`,
		{ isActive: true },
		{ headers },
	)

	expect(response.status).toBe(200)
	expect(response.data.isActive).toBe(true)
	expect(response.data.url).toMatch(SHARE_URL_PATTERN)

	return extractShareToken(response.data.url!)
}

type SharedTask = {
	id: string
	title: string
	columnId: string
}

type SharedColumn = {
	id: string
	name: string
	tasks: SharedTask[]
}

type SharedProject = {
	id: string
	name: string
	emoji: string
	ownerId: string
	columns: SharedColumn[]
	members?: unknown
}

type ApiError = {
	error: string
}

describe("get shared board", () => {
	it("return 200 when share link is active", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers, {
			name: "Shared Board",
			emoji: "🔗",
		})
		const column = await createColumn(owner.headers, project.id, {
			name: "To Do",
		})
		const task = await createTask(owner.headers, project.id, {
			title: "Public task",
			columnId: column.id,
		})

		const token = await enableShareLink(project.id, owner.headers)

		const response = await api.get<SharedProject>(`/share/${token}`)

		expect(response.status).toBe(200)
		expect(response.data.id).toBe(project.id)
		expect(response.data.name).toBe("Shared Board")
		expect(response.data.emoji).toBe("🔗")
		expect(response.data.ownerId).toBe(owner.user.id)
		expect(response.data.members).toBeUndefined()
		expect(response.data.columns).toHaveLength(1)
		expect(response.data.columns[0]!.name).toBe("To Do")
		expect(response.data.columns[0]!.tasks).toHaveLength(1)
		expect(response.data.columns[0]!.tasks[0]!.id).toBe(task.id)
		expect(response.data.columns[0]!.tasks[0]!.title).toBe("Public task")
	})

	it("return 404 when token is invalid", async () => {
		const response = await api.get<ApiError>("/share/invalid-token")

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Share link not found")
	})

	it("return 404 when share link is disabled", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const token = await enableShareLink(project.id, owner.headers)

		await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: false },
			{ headers: owner.headers },
		)

		const response = await api.get<ApiError>(`/share/${token}`)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Share link not found")
	})
})
