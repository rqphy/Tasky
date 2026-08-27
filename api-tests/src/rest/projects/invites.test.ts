import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	createColumn,
	createTask,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

describe("create invite", () => {
	it("return 201 when invite is created", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email: member.user.email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		expect(invite.status).toBe(201)
		expect(invite.data.email).toBe(member.user.email)
		expect(invite.data.role).toBe("MEMBER")
	})

	it("return 403 when user is not the project owner", async () => {
		const owner = await authAs("Owner")
		const notOwner = await authAs("Not Owner")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: notOwner.user.email,
			headers: notOwner.headers,
		})

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email: "alice@test.com",
				role: "MEMBER",
			},
			{ headers: notOwner.headers },
		)

		expect(invite.status).toBe(403)
		expect(invite.data.error).toBe("Only the owner can perform this action")
	})

	it("return 409 when user is already a member of the project", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email: member.user.email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		expect(invite.status).toBe(409)
		expect(invite.data.error).toBe(
			"This user is already a member of the project",
		)
	})
})

describe("get invites", () => {
	it("return 200 when invites are fetched", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await api.post(
			`/projects/${project.id}/invites`,
			{
				email: member.user.email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		const invites = await api.get(`/projects/${project.id}/invites`, {
			headers: owner.headers,
		})

		expect(invites.status).toBe(200)
		expect(invites.data).toHaveLength(1)
		expect(invites.data[0].email).toBe(member.user.email)
		expect(invites.data[0].role).toBe("MEMBER")
	})

	it("return 403 when user is not the project owner", async () => {
		const owner = await authAs("Owner")
		const notOwner = await authAs("Not Owner")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: notOwner.user.email,
			headers: notOwner.headers,
		})

		const invites = await api.get(`/projects/${project.id}/invites`, {
			headers: notOwner.headers,
		})

		expect(invites.status).toBe(403)
		expect(invites.data.error).toBe(
			"Only the owner can perform this action",
		)
	})
})

describe("delete invite", () => {
	it("return 204 when invite is revoked", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email: member.user.email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		const response = await api.delete(
			`/projects/${project.id}/invites/${invite.data.id}`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(204)
	})

	it("return 403 when user is not the project owner", async () => {
		const owner = await authAs("Owner")
		const notOwner = await authAs("Not Owner")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: notOwner.user.email,
			headers: notOwner.headers,
		})

		const invite = await api.post(`/projects/${project.id}/invites`, {
			email: "alice@test.com",
			role: "MEMBER",
		})

		const response = await api.delete(
			`/projects/${project.id}/invites/${invite.data.id}`,
			{
				headers: notOwner.headers,
			},
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"Only the owner can perform this action",
		)
	})

	it("return 404 when invite is not found", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/invites/123`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Invite not found")
	})
})
