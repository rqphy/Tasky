# Projects

All paths are relative to `/api/projects`.

All endpoints require a Bearer access token unless noted otherwise.

Validation errors (`400`) include a `details` field with Zod error info.

---

## GET /projects

List projects the authenticated user owns or is a member of. Ordered by `updatedAt` descending.

**Auth:** Bearer access token

**Request body:** none

**Success — 200**

```json
[
	{
		"id": "cuid...",
		"name": "Horizon",
		"emoji": "📋",
		"ownerId": "cuid...",
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
]
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

## POST /projects

Create a new project. The creator is added as a member with role `OWNER`. Default emoji is `📋` if omitted.

**Auth:** Bearer access token

**Request body**

| Field | Type   | Required | Rules       |
| ----- | ------ | -------- | ----------- |
| name  | string | yes      | 1–100 chars |
| emoji | string | no       |             |

**Success — 201**

```json
{
	"id": "cuid...",
	"name": "Horizon",
	"emoji": "📋",
	"ownerId": "cuid...",
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
	"members": [
		{
			"id": "cuid...",
			"userId": "cuid...",
			"projectId": "cuid...",
			"role": "OWNER",
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
		}
	],
	"columns": []
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

## GET /projects/:id

Get a project with its members, columns, and tasks.

**Auth:** Bearer access token

**Request body:** none

**Success — 200**

```json
{
	"id": "cuid...",
	"name": "Horizon",
	"emoji": "📋",
	"ownerId": "cuid...",
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
	"members": [
		{
			"id": "cuid...",
			"userId": "cuid...",
			"projectId": "cuid...",
			"role": "OWNER",
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
		}
	],
	"columns": [
		{
			"id": "cuid...",
			"projectId": "cuid...",
			"name": "To Do",
			"color": "#6366f1",
			"position": 0,
			"createdAt": "2026-...",
			"updatedAt": "2026-...",
			"tasks": [
				{
					"id": "cuid...",
					"columnId": "cuid...",
					"title": "Fix login bug",
					"description": null,
					"assigneeId": null,
					"label": "BUG",
					"priority": "HIGH",
					"position": 0,
					"createdAt": "2026-...",
					"updatedAt": "2026-...",
					"assignee": null,
					"_count": {
						"comments": 0
					}
				}
			]
		}
	]
}
```

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **403** — user is not a project member

```json
{ "error": "Access denied" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## PATCH /projects/:id

Update a project. Only the owner can update.

**Auth:** Bearer access token

**Request body**

| Field | Type   | Required | Rules       |
| ----- | ------ | -------- | ----------- |
| name  | string | no       | 1–100 chars |
| emoji | string | no       |             |

**Success — 200**

Returns the updated project (no members or columns).

```json
{
	"id": "cuid...",
	"name": "Horizon v2",
	"emoji": "👽",
	"ownerId": "cuid...",
	"createdAt": "2026-...",
	"updatedAt": "2026-..."
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

- **403** — user is not the project owner

```json
{ "error": "Only the owner can update this project" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## DELETE /projects/:id

Delete a project. Only the owner can delete.

**Auth:** Bearer access token

**Request body:** none

**Success — 204**

No response body.

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **403** — user is not the project owner

```json
{ "error": "Only the owner can delete this project" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---
