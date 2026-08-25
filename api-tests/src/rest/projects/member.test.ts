import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

describe("get project members", () => {
	it("return 200 when project members are fetched", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.get(`/projects/${project.id}/members`, {
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toHaveLength(2)
		expect(response.data[1].user.email).toBe(member.user.email)
	})

	it("return 401 when user is not authenticated", async () => {
		const { headers } = await authAs()
		const project = await createProject(headers)

		const response = await api.get(`/projects/${project.id}/members`, {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("remove member from project", () => {
	it("return 204 when member is removed", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.delete(
			`/projects/${project.id}/members/${member.user.id}`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(204)
	})

	it("return 204 when member leaves project", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.delete(
			`/projects/${project.id}/members/${member.user.id}`,
			{
				headers: member.headers,
			},
		)

		expect(response.status).toBe(204)
	})

	it("return 400 when owner tries to leave without transferring ownership", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/members/${owner.user.id}`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Transfer ownership before leaving the project",
		)
	})

	it("return 403 when non-owner tries to remove another member", async () => {
		const owner = await authAs("Owner")
		const member1 = await authAs("Member1")
		const member2 = await authAs("Member2")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member1.user.email,
			headers: member1.headers,
		})
		await addMemberViaInvite(owner.headers, project.id, {
			email: member2.user.email,
			headers: member2.headers,
		})

		const response = await api.delete(
			`/projects/${project.id}/members/${member2.user.id}`,
			{
				headers: member1.headers,
			},
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when member not found", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/members/123`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Member not found")
	})
})

describe("transfer ownership", () => {
	it("return 200 when ownership is transferred", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{ userId: member.user.id },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.ownerId).toBe(member.user.id)
	})

	it("return 400 when owner tries to transfer ownership to himself", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{ userId: owner.user.id },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Cannot transfer ownership to yourself",
		)
	})

	it("return 400 when project has fewer than two members", async () => {
		const owner = await authAs("Owner")
		const other = await authAs("Other")
		const project = await createProject(owner.headers)

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{ userId: other.user.id },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Add another member before transferring ownership",
		)
	})

	it("return 403 when non-owner tries to transfer ownership", async () => {
		const owner = await authAs("Owner")
		const member1 = await authAs("Member1")
		const member2 = await authAs("Member2")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member1.user.email,
			headers: member1.headers,
		})
		await addMemberViaInvite(owner.headers, project.id, {
			email: member2.user.email,
			headers: member2.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{ userId: member2.user.id },
			{ headers: member1.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"Only the owner can transfer ownership",
		)
	})

	it("return 404 when member not found", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{ userId: "123" },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Member not found")
	})
})
