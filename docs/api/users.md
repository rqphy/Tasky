# User

All paths are relative to `/api/users`.

All endpoints require a Bearer access token.

The `user` object in responses never includes `password`.

Validation errors (`400`) include a `details` field with Zod error info.

## Table of contents

- [PATCH /me/profile — update profile](#update-profile)
- [PATCH /me/email — update email](#update-email)
- [PATCH /me/password — update password](#update-password)
- [DELETE /me — delete account](#delete-account)
- [DELETE /me/image — remove profile image](#delete-profile-image)

---

<a id="update-profile"></a>

## PATCH /me/profile

Update user profile: name, bio, jobTitle, company.

Optional fields (`bio`, `jobTitle`, `company`) are stored as `null` when omitted or sent as an empty string.

**Auth:** Bearer access token

**Request body**

| Field    | Type   | Required | Rules         |
| -------- | ------ | -------- | ------------- |
| name     | string | yes      | 1–100 chars   |
| bio      | string | no       | max 500 chars |
| jobTitle | string | no       | max 100 chars |
| company  | string | no       | max 100 chars |

**Success — 200**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="update-email"></a>

## PATCH /me/email

Update user email. Requires the current password.

If the new email is the same as the current one, returns **200** with the current user (no database update).

**Auth:** Bearer access token

**Request body**

| Field    | Type   | Required | Rules       |
| -------- | ------ | -------- | ----------- |
| email    | string | yes      | valid email |
| password | string | yes      | min 8 chars |

**Success — 200**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — email already registered

```json
{ "error": "Email already registered" }
```

- **401** — invalid password

```json
{ "error": "Invalid password" }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **404** — user not found

```json
{ "error": "User not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="update-password"></a>

## PATCH /me/password

Update user password. Invalidates all refresh tokens and password-reset tokens for the user.

**Auth:** Bearer access token

**Request body**

| Field           | Type   | Required | Rules       |
| --------------- | ------ | -------- | ----------- |
| currentPassword | string | yes      | min 8 chars |
| newPassword     | string | yes      | min 8 chars |

**Success — 200**

```json
{
	"message": "Password updated successfully"
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **401** — invalid password

```json
{ "error": "Invalid password" }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **404** — user not found

```json
{ "error": "User not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="delete-account"></a>

## DELETE /me

Delete the authenticated user's account.

**Auth:** Bearer access token

**Request body**

| Field    | Type   | Required | Rules       |
| -------- | ------ | -------- | ----------- |
| password | string | yes      | min 8 chars |

**Success — 204**

No response body.

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — user still owns projects

```json
{
	"error": "Transfer ownership of all projects before deleting your account",
	"ownedProjects": [
		{
			"id": "cuid...",
			"name": "Project"
		}
	]
}
```

- **401** — invalid password

```json
{ "error": "Invalid password" }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **404** — user not found

```json
{ "error": "User not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="delete-profile-image"></a>

## DELETE /me/image

Remove the user's profile picture. Sets `imageUrl` to `null`.

**Auth:** Bearer access token

**Request body:** none

**Success — 200**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---
