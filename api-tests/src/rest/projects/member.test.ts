import { describe, it, expect } from "vitest"
import { api } from "../../helpers/client.js"
import {
	authAs,
	createProject,
	addMemberViaInvite,
} from "../../helpers/fixtures.js"

type ProjectMember = {
	userId: string
	role: string
	user: {
		email: string
	}
}

function findMember(members: ProjectMember[], userId: string) {
	return members.find((member) => member.userId === userId)
}

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

		const ownerMember = findMember(response.data, owner.user.id)
		const addedMember = findMember(response.data, member.user.id)

		expect(ownerMember?.role).toBe("OWNER")
		expect(ownerMember?.user.email).toBe(owner.user.email)
		expect(addedMember?.role).toBe("MEMBER")
		expect(addedMember?.user.email).toBe(member.user.email)
	})

	it("return 200 with only the owner when there are no other members", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const response = await api.get(`/projects/${project.id}/members`, {
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toHaveLength(1)
		expect(response.data[0].role).toBe("OWNER")
		expect(response.data[0].userId).toBe(owner.user.id)
	})

	it("return 200 when a project member fetches the members list", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.get(`/projects/${project.id}/members`, {
			headers: member.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toHaveLength(2)
	})

	it("return 200 with empty list when project does not exist", async () => {
		const owner = await authAs("Owner")

		const response = await api.get("/projects/123/members", {
			headers: owner.headers,
		})

		expect(response.status).toBe(200)
		expect(response.data).toEqual([])
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
	it("return 204 when member is removed by the owner", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")

		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.delete(
			`/projects/${project.id}/members/${member.user.id}`,
			{ headers: owner.headers },
		)

		expect(response.status).toBe(204)

		const members = await api.get(`/projects/${project.id}/members`, {
			headers: owner.headers,
		})

		expect(members.status).toBe(200)
		expect(members.data).toHaveLength(1)
		expect(members.data[0].userId).toBe(owner.user.id)
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
			{ headers: member.headers },
		)

		expect(response.status).toBe(204)

		const members = await api.get(`/projects/${project.id}/members`, {
			headers: owner.headers,
		})

		expect(members.status).toBe(200)
		expect(findMember(members.data, member.user.id)).toBeUndefined()
	})

	it("return 400 when owner tries to leave without transferring ownership", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/members/${owner.user.id}`,
			{ headers: owner.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Transfer ownership before leaving the project",
		)
	})

	it("return 401 when user is not authenticated", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.delete(
			`/projects/${project.id}/members/${member.user.id}`,
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
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
			{ headers: member1.headers },
		)

		expect(response.status).toBe(403)
		expect(response.data.error).toBe("Access denied")
	})

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const response = await api.delete("/projects/123/members/456", {
			headers: owner.headers,
		})

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
	})

	it("return 404 when member not found", async () => {
		const owner = await authAs("Owner")
		const project = await createProject(owner.headers)

		const response = await api.delete(
			`/projects/${project.id}/members/123`,
			{ headers: owner.headers },
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
		expect(response.data.id).toBe(project.id)
		expect(response.data.name).toBe(project.name)
		expect(response.data.emoji).toBe(project.emoji)
		expect(response.data.ownerId).toBe(member.user.id)

		const members = await api.get(`/projects/${project.id}/members`, {
			headers: member.headers,
		})

		expect(findMember(members.data, member.user.id)?.role).toBe("OWNER")
		expect(findMember(members.data, owner.user.id)?.role).toBe("MEMBER")
	})

	it("return 400 when userId is missing", async () => {
		const owner = await authAs("Owner")
		const member = await authAs("Member")
		const project = await createProject(owner.headers)

		await addMemberViaInvite(owner.headers, project.id, {
			email: member.user.email,
			headers: member.headers,
		})

		const response = await api.post(
			`/projects/${project.id}/transfer-ownership`,
			{},
			{ headers: owner.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
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

	it("return 401 when user is not authenticated", async () => {
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
			{ headers: { Authorization: "Bearer invalid" } },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
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

	it("return 404 when project is not found", async () => {
		const owner = await authAs("Owner")

		const response = await api.post(
			"/projects/123/transfer-ownership",
			{ userId: "456" },
			{ headers: owner.headers },
		)

		expect(response.status).toBe(404)
		expect(response.data.error).toBe("Project not found")
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
