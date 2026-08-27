import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

const SHARE_URL_PATTERN =
	/^http:\/\/localhost:5173\/share\/[0-9a-f]{64}$/

describe("get share status", () => {
	it("return 200 when share status is fetched - share link is active", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: true },
			{ headers: owner.headers },
		)

		const share = await api.get(`/projects/${project.id}/share`, {
			headers: owner.headers,
		})

		expect(share.status).toBe(200)
		expect(share.data.isActive).toBe(true)
		expect(share.data.url).toMatch(SHARE_URL_PATTERN)
	})

	it("return 200 when share status is fetched - share link is inactive", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		const share = await api.get(`/projects/${project.id}/share`, {
			headers: owner.headers,
		})

		expect(share.status).toBe(200)
		expect(share.data.isActive).toBe(false)
		expect(share.data.url).toBeUndefined()
	})

	it("return 200 when a member tries to fetch share status", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: true },
			{ headers: owner.headers },
		)

		const share = await api.get(`/projects/${project.id}/share`, {
			headers: member.headers,
		})

		expect(share.status).toBe(200)
		expect(share.data.isActive).toBe(true)
		expect(share.data.url).toMatch(SHARE_URL_PATTERN)
	})

	it("return 401 when user is not authenticated", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const share = await api.get(`/projects/${project.id}/share`, {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(share.status).toBe(401)
		expect(share.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when a non-member tries to fetch share status", async () => {
		const owner = await authAs("Owner")
		const notMember = await authAs("Not Member")

		const project = await createProject(owner.headers)

		const share = await api.get(`/projects/${project.id}/share`, {
			headers: notMember.headers,
		})

		expect(share.status).toBe(403)
		expect(share.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const share = await api.get("/projects/123/share", {
			headers: owner.headers,
		})

		expect(share.status).toBe(404)
		expect(share.data.error).toBe("Project not found")
	})
})

describe("update share status", () => {
	it("return 200 when share status is updated - share link is enabled", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		const share = await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: true },
			{ headers: owner.headers },
		)

		expect(share.status).toBe(200)
		expect(share.data.isActive).toBe(true)
		expect(share.data.url).toMatch(SHARE_URL_PATTERN)
	})

	it("return 200 when share status is updated - share link is disabled", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: true },
			{ headers: owner.headers },
		)

		const share = await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: false },
			{ headers: owner.headers },
		)

		expect(share.status).toBe(200)
		expect(share.data.isActive).toBe(false)
		expect(share.data.url).toBeUndefined()

		const fetched = await api.get(`/projects/${project.id}/share`, {
			headers: owner.headers,
		})

		expect(fetched.status).toBe(200)
		expect(fetched.data.isActive).toBe(false)
		expect(fetched.data.url).toBeUndefined()
	})

	it("return 400 when isActive is missing", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const share = await api.patch(
			`/projects/${project.id}/share`,
			{},
			{ headers: owner.headers },
		)

		expect(share.status).toBe(400)
		expect(share.data.error).toBe("Validation failed")
	})

	it("return 403 when the user is not the project owner", async () => {
		const owner = await authAs("Owner")
		const notOwner = await authAs("Not Owner")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: notOwner.user.email,
			headers: notOwner.headers,
		})

		const share = await api.patch(
			`/projects/${project.id}/share`,
			{ isActive: true },
			{ headers: notOwner.headers },
		)

		expect(share.status).toBe(403)
		expect(share.data.error).toBe("Only the owner can perform this action")
	})

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const share = await api.patch(
			"/projects/123/share",
			{ isActive: true },
			{ headers: owner.headers },
		)

		expect(share.status).toBe(404)
		expect(share.data.error).toBe("Project not found")
	})
})
