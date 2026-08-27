import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	addMemberViaInvite,
	uniqueEmail,
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
		expect(invite.data.status).toBe("PENDING")
		expect(invite.data.projectId).toBe(project.id)
		expect(invite.data.invitedById).toBe(owner.user.id)
		expect(invite.data.token).toMatch(/^[0-9a-f]{64}$/)
		expect(typeof invite.data.emailSent).toBe("boolean")
	})

	it("return 201 with default role MEMBER when role is omitted", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)
		const email = uniqueEmail("invite")

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{ email },
			{ headers: owner.headers },
		)

		expect(invite.status).toBe(201)
		expect(invite.data.role).toBe("MEMBER")
	})

	it("return 201 and refresh an existing invite for the same email", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)
		const email = uniqueEmail("invite")

		const first = await api.post(
			`/projects/${project.id}/invites`,
			{ email, role: "VIEWER" },
			{ headers: owner.headers },
		)
		const second = await api.post(
			`/projects/${project.id}/invites`,
			{ email, role: "MEMBER" },
			{ headers: owner.headers },
		)

		expect(first.status).toBe(201)
		expect(second.status).toBe(201)
		expect(second.data.id).toBe(first.data.id)
		expect(second.data.role).toBe("MEMBER")
		expect(second.data.status).toBe("PENDING")
		expect(second.data.token).not.toBe(first.data.token)
	})

	it("return 400 when email is invalid", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{ email: "not-an-email", role: "MEMBER" },
			{ headers: owner.headers },
		)

		expect(invite.status).toBe(400)
		expect(invite.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{ email: uniqueEmail("invite"), role: "MEMBER" },
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(invite.status).toBe(401)
		expect(invite.data.error).toBe(
			"Missing or invalid authorization header",
		)
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
				email: uniqueEmail("invite"),
				role: "MEMBER",
			},
			{ headers: notOwner.headers },
		)

		expect(invite.status).toBe(403)
		expect(invite.data.error).toBe("Only the owner can perform this action")
	})

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const invite = await api.post(
			"/projects/123/invites",
			{ email: uniqueEmail("invite"), role: "MEMBER" },
			{ headers: owner.headers },
		)

		expect(invite.status).toBe(404)
		expect(invite.data.error).toBe("Project not found")
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
		expect(invites.data[0].status).toBe("PENDING")
		expect(invites.data[0].invitedBy.id).toBe(owner.user.id)
		expect(invites.data[0].token).toBeUndefined()
	})

	it("return 200 with empty list when there are no pending invites", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const invites = await api.get(`/projects/${project.id}/invites`, {
			headers: owner.headers,
		})

		expect(invites.status).toBe(200)
		expect(invites.data).toEqual([])
	})

	it("return 401 when user is not authenticated", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const invites = await api.get(`/projects/${project.id}/invites`, {
			headers: { Authorization: "Bearer invalid" },
		})

		expect(invites.status).toBe(401)
		expect(invites.data.error).toBe(
			"Missing or invalid authorization header",
		)
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

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const invites = await api.get("/projects/123/invites", {
			headers: owner.headers,
		})

		expect(invites.status).toBe(404)
		expect(invites.data.error).toBe("Project not found")
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
			{ headers: owner.headers },
		)

		expect(response.status).toBe(204)

		const invites = await api.get(`/projects/${project.id}/invites`, {
			headers: owner.headers,
		})

		expect(invites.status).toBe(200)
		expect(invites.data).toEqual([])
	})

	it("return 401 when user is not authenticated", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{ email: uniqueEmail("invite"), role: "MEMBER" },
			{ headers: owner.headers },
		)

		const response = await api.delete(
			`/projects/${project.id}/invites/${invite.data.id}`,
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
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
			{ email: uniqueEmail("invite"), role: "MEMBER" },
			{ headers: owner.headers },
		)

		const response = await api.delete(
			`/projects/${project.id}/invites/${invite.data.id}`,
			{ headers: notOwner.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"Only the owner can perform this action",
		)
	})

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const response = await api.delete("/projects/123/invites/456", {
			headers: owner.headers,
		})

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when invite is not found", async () => {
		const owner = await authAs("Owner")

		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/invites/123`,
			{ headers: owner.headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Invite not found")
	})
})
