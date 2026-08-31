import { describe, it, expect } from "vitest"
import { api } from "../helpers/client.js"
import { authAs, createProject, uniqueEmail } from "../helpers/fixtures.js"

type ProjectSummary = {
	id: string
	name: string
	emoji: string
}

type InviteValidationSuccess = {
	valid: true
	project: ProjectSummary
	email: string
	role: string
	expiresAt: string
}

type InviteValidationFailure = {
	valid: false
	reason: string
}

type InviteValidation = InviteValidationSuccess | InviteValidationFailure

type ProjectMember = {
	userId: string
	projectId: string
	role: string
	user: {
		email: string
	}
}

type AcceptInviteResponse = {
	member: ProjectMember
	project: ProjectSummary
}

type ApiError = {
	error: string
}

describe("validate invite", () => {
	it("return 200 when invite is validated", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const email = uniqueEmail("invite")

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		const response = await api.get<InviteValidation>(`/invites/validate`, {
			params: {
				token: invite.data.token,
			},
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data.valid).toBe(true)
		if (!response.data.valid) return

		expect(response.data.project.id).toBe(project.id)
		expect(response.data.project.name).toBe(project.name)
		expect(response.data.project.emoji).toBe(project.emoji)
		expect(response.data.email).toBe(email)
		expect(response.data.role).toBe("MEMBER")
		expect(response.data.expiresAt).toBeDefined()
	})

	it("return 200 when token is invalid", async () => {
		const owner = await authAs("Owner")

		const response = await api.get<InviteValidation>(`/invites/validate`, {
			params: {
				token: "invalid",
			},
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data.valid).toBe(false)
		if (response.data.valid) return

		expect(response.data.reason).toBe("Invalid or expired invite")
	})

	it("return 200 when token is non pending invite", async () => {
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

		await api.post(
			`/invites/accept`,
			{
				token: invite.data.token,
			},
			{ headers: member.headers },
		)

		const response = await api.get<InviteValidation>(`/invites/validate`, {
			params: {
				token: invite.data.token,
			},
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data.valid).toBe(false)
		if (response.data.valid) return

		expect(response.data.reason).toBe("Invalid or expired invite")
	})

	it("return 400 when token is missing", async () => {
		const owner = await authAs("Owner")

		const response = await api.get<InviteValidationFailure>(
			`/invites/validate`,
			{
				headers: owner.headers,
			},
		)

		expect(response.status).toBe(400)
		expect(response.data.valid).toBe(false)
		expect(response.data.reason).toBe("Token is required")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.get<ApiError>(`/invites/validate`, {
			headers: {
				Authorization: "Bearer invalid",
			},
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("accept invite", () => {
	it("return 200 when invite is accepted", async () => {
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

		const response = await api.post<AcceptInviteResponse>(
			`/invites/accept`,
			{
				token: invite.data.token,
			},
			{ headers: member.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.member.userId).toBe(member.user.id)
		expect(response.data.member.projectId).toBe(project.id)
		expect(response.data.member.role).toBe("MEMBER")
		expect(response.data.member.user.email).toBe(member.user.email)
		expect(response.data.project.id).toBe(project.id)
		expect(response.data.project.name).toBe(project.name)
		expect(response.data.project.emoji).toBe(project.emoji)

		const members = await api.get<ProjectMember[]>(
			`/projects/${project.id}/members`,
			{
				headers: owner.headers,
			},
		)

		expect(members.status).toBe(200)
		expect(
			members.data.some((m) => m.userId === member.user.id),
		).toBe(true)
	})

	it("return 400 when token is missing", async () => {
		const user = await authAs("User")

		const response = await api.post<ApiError>(
			`/invites/accept`,
			{},
			{
				headers: user.headers,
			},
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.post<ApiError>(
			`/invites/accept`,
			{ token: "some-token" },
			{
				headers: {
					Authorization: "Bearer invalid",
				},
			},
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 403 when email doesn't match authenticated user", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const user = await authAs("User")
		const project = await createProject(owner.headers)

		const invite = await api.post(
			`/projects/${project.id}/invites`,
			{
				email: user.user.email,
				role: "MEMBER",
			},
			{ headers: owner.headers },
		)

		const response = await api.post<ApiError>(
			`/invites/accept`,
			{
				token: invite.data.token,
			},
			{ headers: member.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe(
			"This invite was sent to a different email address",
		)
	})

	it("return 404 when token is invalid", async () => {
		const member = await authAs("Member")

		const response = await api.post<ApiError>(
			`/invites/accept`,
			{
				token: "invalid-token",
			},
			{ headers: member.headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Invalid or expired invite")
	})

	it("return 404 when invite is non pending", async () => {
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

		await api.post(
			`/invites/accept`,
			{
				token: invite.data.token,
			},
			{ headers: member.headers },
		)

		const response = await api.post<ApiError>(
			`/invites/accept`,
			{
				token: invite.data.token,
			},
			{ headers: member.headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Invalid or expired invite")
	})
})
