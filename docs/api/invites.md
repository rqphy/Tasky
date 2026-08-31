# Invites

All paths are relative to `/api/invites`.

These endpoints handle the **invite acceptance flow** for authenticated users. Creating, listing, and revoking invites is done under [projects.md](./projects.md) (`/api/projects/:id/invites`).

All endpoints require a Bearer access token.

Validation errors (`400`) on `POST /accept` include a `details` field with Zod error info.

## Table of contents

- [GET /validate — validate invite token](#validate-invite)
- [POST /accept — accept invite](#accept-invite)

---

<a id="validate-invite"></a>

## GET /validate

Check whether an invite token is valid before the user accepts it. Used by the invite landing page.

**Auth:** Bearer access token

**Query params**

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| token | string | yes      | Invite token   |

**Request body:** none

**Success — 200** (valid invite)

```json
{
	"valid": true,
	"project": {
		"id": "cuid...",
		"name": "Horizon",
		"emoji": "📋"
	},
	"email": "alice@test.com",
	"role": "MEMBER",
	"expiresAt": "2026-..."
}
```

**Success — 200** (invalid, expired, or non-pending invite)

```json
{
	"valid": false,
	"reason": "Invalid or expired invite"
}
```

Note: validation failures for bad tokens return **200** with `valid: false`, not 404.

**Errors**

- **400** — token query param missing or not a string

```json
{
	"valid": false,
	"reason": "Token is required"
}
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

<a id="accept-invite"></a>

## POST /accept

Accept a pending invite and join the project. The authenticated user's email must match the invite email.

**Auth:** Bearer access token

**Request body**

| Field | Type   | Required | Rules        |
| ----- | ------ | -------- | ------------ |
| token | string | yes      | min 1 char   |

**Success — 200**

```json
{
	"member": {
		"id": "cuid...",
		"userId": "cuid...",
		"projectId": "cuid...",
		"role": "MEMBER",
		"createdAt": "2026-...",
		"user": {
			"id": "cuid...",
			"name": "Alice",
			"email": "alice@test.com",
			"imageUrl": null,
			"bio": null,
			"jobTitle": null,
			"company": null
		}
	},
	"project": {
		"id": "cuid...",
		"name": "Horizon",
		"emoji": "📋"
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

- **401** — user not found

```json
{ "error": "User not found" }
```

- **403** — invite email does not match authenticated user

```json
{ "error": "This invite was sent to a different email address" }
```

- **404** — invalid, expired, or non-pending invite

```json
{ "error": "Invalid or expired invite" }
```

- **409** — user is already a project member or owner

```json
{ "error": "You are already a member of this project" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---
