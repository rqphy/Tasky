import { describe, it, expect } from "vitest"
import { api } from "../helpers/client.js"
import {
	authAs,
	createProject,
	addMemberViaInvite,
	uniqueEmail,
} from "../helpers/fixtures.js"

describe("update profile", () => {
	it("return 200 when profile is updated", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/profile",
			{
				name: "John Doe",
				bio: "I am a software engineer",
				company: "Acme Inc.",
				jobTitle: "Software Engineer",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.user.name).toBe("John Doe")
		expect(response.data.user.bio).toBe("I am a software engineer")
		expect(response.data.user.company).toBe("Acme Inc.")
		expect(response.data.user.jobTitle).toBe("Software Engineer")
	})

	it("return 400 when input is invalid", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/profile",
			{
				bio: "I am a software engineer",
				company: "Acme Inc.",
				jobTitle: "Software Engineer",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.patch("/users/me/profile", {
			name: "John Doe",
			bio: "I am a software engineer",
			company: "Acme Inc.",
			jobTitle: "Software Engineer",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})

describe("change email address", () => {
	it("return 200 when email address is changed", async () => {
		const user = await authAs("User")
		const email = uniqueEmail("new")
		const response = await api.patch(
			"/users/me/email",
			{
				email: email,
				password: user.user.password,
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.user.email).toBe(email)
	})

	it("return 400 when input is invalid", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/email",
			{
				email: "invalid-email",
				password: user.user.password,
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 400 when email address is already in use", async () => {
		const user = await authAs("User")
		const otherUser = await authAs("User")

		const response = await api.patch(
			"/users/me/email",
			{
				email: otherUser.user.email,
				password: user.user.password,
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Email already registered")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.patch("/users/me/email", {
			email: "john.doe@example.com",
			password: "incorrect-password",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 401 when password is incorrect", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/email",
			{
				email: "john.doe@example.com",
				password: "incorrect-password",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Invalid password")
	})
})

describe("change password", () => {
	it("return 200 when password is changed", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/password",
			{
				currentPassword: user.user.password,
				newPassword: "new-password123",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(200)
		expect(response.data.message).toBe("Password updated successfully")
	})

	it("return 400 when input is invalid", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/password",
			{
				currentPassword: user.user.password,
				newPassword: "",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.patch("/users/me/password", {
			currentPassword: "incorrect-password",
			newPassword: "new-password",
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 401 when password is incorrect", async () => {
		const user = await authAs("User")

		const response = await api.patch(
			"/users/me/password",
			{
				currentPassword: "incorrect-password",
				newPassword: "new-password",
			},
			{ headers: user.headers },
		)

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Invalid password")
	})
})

describe("delete account", () => {
	it("return 204 when account is deleted", async () => {
		const user = await authAs("User")

		const response = await api.delete("/users/me", {
			data: { password: user.user.password },
			headers: user.headers,
		})

		expect(response.status).toBe(204)

		const check = await api.get("/auth/me", { headers: user.headers })
		expect(check.status).toBe(404)
		expect(check.data.error).toBe("User not found")
	})

	it("return 400 when invalid input is provided", async () => {
		const user = await authAs("User")

		const response = await api.delete("/users/me", {
			data: { password: "" },
			headers: user.headers,
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe("Validation failed")
	})

	it("return 400 when user still owns projects", async () => {
		const user = await authAs("User")
		const project = await createProject(user.headers)

		const response = await api.delete("/users/me", {
			data: { password: user.user.password },
			headers: user.headers,
		})

		expect(response.status).toBe(400)
		expect(response.data.error).toBe(
			"Transfer ownership of all projects before deleting your account",
		)
		expect(response.data.ownedProjects).toHaveLength(1)
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.delete("/users/me", {
			data: { password: "incorrect-password" },
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})

	it("return 401 when password is incorrect", async () => {
		const user = await authAs("User")

		const response = await api.delete("/users/me", {
			data: { password: "incorrect-password" },
			headers: user.headers,
		})

		expect(response.status).toBe(401)
		expect(response.data.error).toBe("Invalid password")
	})
})

describe("delete profile picture", () => {
	it("return 200 when profile picture is deleted", async () => {
		const user = await authAs("User")

		const before = await api.get("/auth/me", { headers: user.headers })
		expect(before.data.user.imageUrl).toBeNull()

		const response = await api.delete("/users/me/image", {
			headers: user.headers,
		})
		expect(response.status).toBe(200)
		expect(response.data.user.imageUrl).toBeNull()

		const after = await api.get("/auth/me", { headers: user.headers })
		expect(after.data.user.imageUrl).toBeNull()
	})

	it("return 401 when user is not authenticated", async () => {
		const response = await api.delete("/users/me/image")

		expect(response.status).toBe(401)
		expect(response.data.error).toBe(
			"Missing or invalid authorization header",
		)
	})
})
