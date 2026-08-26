# Projects

All paths are relative to `/api/projects`.

All endpoints require a Bearer access token unless noted otherwise.

Validation errors (`400`) include a `details` field with Zod error info.

## Table of contents

### Projects

- [GET /projects — list](#list-projects)
- [POST /projects — create](#create-project)
- [GET /projects/:id — get](#get-project)
- [PATCH /projects/:id — update](#update-project)
- [DELETE /projects/:id — delete](#delete-project)

### Columns

- [POST /projects/:id/columns — create](#create-column)
- [PATCH /projects/:id/columns/:columnId — update](#update-column)
- [DELETE /projects/:id/columns/:columnId — delete](#delete-column)
- [POST /projects/:id/columns/reorder — reorder](#reorder-columns)

### Tasks

- [POST /projects/:id/tasks — create](#create-task)
- [GET /projects/:id/tasks/:taskId — get](#get-task)
- [PATCH /projects/:id/tasks/:taskId — update](#update-task)
- [DELETE /projects/:id/tasks/:taskId — delete](#delete-task)
- [POST /projects/:id/tasks/:taskId/move — move](#move-task)

### Tasks

- [GET /projects/:id/members — get](#get-members)
- [DELETE /projects/:id/members/:userId — delete](#remove-member)
- [POST /projects/:id/transfer-ownership — transfer](#transfer-ownership)

### Comments

- [POST /projects/:id/tasks/:taskId/comments — post](#post-comment)
- [DELETE /projects/:id/tasks/:taskId/comments/:commentId — delete](#delete-comment)

---

<a id="list-projects"></a>

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

<a id="create-project"></a>

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

<a id="get-project"></a>

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
			"position": 1,
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

<a id="update-project"></a>

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

<a id="delete-project"></a>

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

<a id="create-column"></a>

## POST /projects/:id/columns

Create a column in a project. Only project members (`OWNER` or `MEMBER`) can create a column. Default color is `#6366f1` if omitted. Position is assigned automatically.

**Auth:** Bearer access token

**Request body**

| Field | Type   | Required | Rules       |
| ----- | ------ | -------- | ----------- |
| name  | string | yes      | 1–100 chars |
| color | string | no       |             |

**Success — 201**

```json
{
	"id": "cuid...",
	"projectId": "cuid...",
	"name": "To Do",
	"color": "#6366f1",
	"position": 1,
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

<a id="update-column"></a>

## PATCH /projects/:id/columns/:columnId

Update a column in a project. Only project members can update a column.

**Auth:** Bearer access token

**Request body**

| Field | Type   | Required | Rules       |
| ----- | ------ | -------- | ----------- |
| name  | string | no       | 1–100 chars |
| color | string | no       |             |

**Success — 200**

```json
{
	"id": "cuid...",
	"projectId": "cuid...",
	"name": "In Progress",
	"color": "#6366f1",
	"position": 1,
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

- **403** — user is not a project member

```json
{ "error": "Access denied" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **404** — column not found (or column belongs to another project)

```json
{ "error": "Column not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="delete-column"></a>

## DELETE /projects/:id/columns/:columnId

Delete a column in a project. Only project members can delete a column.

**Auth:** Bearer access token

**Request body:** none

**Success — 204**

No response body.

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

- **404** — column not found (or column belongs to another project)

```json
{ "error": "Column not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="reorder-columns"></a>

## POST /projects/:id/columns/reorder

Reorder columns. Only project members can reorder columns. Positions are reassigned starting at `1` in the order of `columnIds`.

**Auth:** Bearer access token

**Request body**

| Field     | Type       | Required | Rules      |
| --------- | ---------- | -------- | ---------- |
| columnIds | `string[]` | yes      | min 1 item |

**Success — 200**

```json
{
	"message": "Columns reordered"
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — column IDs do not belong to this project

```json
{ "error": "Some column IDs do not belong to this project" }
```

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

<a id="create-task"></a>

## POST /projects/:id/tasks

Create a task. Only project members can create tasks.

**Auth:** Bearer access token

**Request body**

| Field       | Type   | Required | Rules                                                              |
| ----------- | ------ | -------- | ------------------------------------------------------------------ |
| columnId    | string | yes      | must belong to the project                                         |
| title       | string | yes      | 1–200 chars                                                        |
| description | string | no       |                                                                    |
| assigneeId  | string | no       |                                                                    |
| label       | string | no       | `BUG`, `FEATURE`, `IMPROVEMENT`, `DOCUMENTATION`, or `CHORE`       |
| priority    | string | no       | `URGENT`, `HIGH`, `MEDIUM`, `LOW`, or `NONE`; defaults to `MEDIUM` |

**Success — 201**

```json
{
	"id": "cuid...",
	"columnId": "cuid...",
	"title": "Fix login bug",
	"description": null,
	"assigneeId": "cuid...",
	"label": "BUG",
	"priority": "HIGH",
	"position": 1,
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
	"assignee": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null
	},
	"_count": {
		"comments": 0
	}
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — column does not belong to this project

```json
{ "error": "Invalid column ID" }
```

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

<a id="get-task"></a>

## GET /projects/:id/tasks/:taskId

Get a task details. Only project members can get task details.

**Auth:** Bearer access token

**Request body:** none.

**Success — 200**

```json
{
	"id": "cuid...",
	"columnId": "cuid...",
	"title": "Fix login bug",
	"description": "Steps to reproduce...",
	"assigneeId": "cuid...",
	"label": "BUG",
	"priority": "HIGH",
	"position": 1,
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
	"column": {
		"id": "cuid...",
		"projectId": "cuid...",
		"name": "To Do",
		"color": "#6366f1",
		"position": 1,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	},
	"assignee": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null
	},
	"comments": [
		{
			"id": "cuid...",
			"content": "I'll take a look",
			"taskId": "cuid...",
			"authorId": "cuid...",
			"createdAt": "2026-...",
			"author": {
				"id": "cuid...",
				"name": "Bob",
				"email": "bob@test.com",
				"imageUrl": null,
				"bio": null,
				"jobTitle": null,
				"company": null
			}
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

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="update-task"></a>

## PATCH /projects/:id/tasks/:taskId

Update a task. Only project members can update tasks.

**Auth:** Bearer access token

**Request body**

| Field       | Type           | Required | Rules                                                                |
| ----------- | -------------- | -------- | -------------------------------------------------------------------- |
| columnId    | string         | no       | must belong to the project                                           |
| title       | string         | no       | 1–200 chars                                                          |
| description | string         | no       |                                                                      |
| assigneeId  | string \| null | no       | set to `null` to unassign; must be a project member when provided    |
| label       | string \| null | no       | `BUG`, `FEATURE`, `IMPROVEMENT`, `DOCUMENTATION`, `CHORE`, or `null` |
| priority    | string         | no       | `URGENT`, `HIGH`, `MEDIUM`, `LOW`, or `NONE`                         |

**Success — 200**

```json
{
	"id": "cuid...",
	"columnId": "cuid...",
	"title": "Fix login bug",
	"description": null,
	"assigneeId": "cuid...",
	"label": "BUG",
	"priority": "HIGH",
	"position": 1,
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
	"assignee": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null
	},
	"_count": {
		"comments": 2
	}
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — column does not belong to this project

```json
{ "error": "Invalid column ID" }
```

- **400** — assignee is not a project member

```json
{ "error": "Assignee is not a project member" }
```

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

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="delete-task"></a>

## DELETE /projects/:id/tasks/:taskId

Delete a task. Only project members can delete tasks.

**Auth:** Bearer access token

**Request body:** none.

**Success — 204**

No response body.

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

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="move-task"></a>

## POST /projects/:id/tasks/:taskId/move

Move a task. Only project members can move tasks.

**Auth:** Bearer access token

**Request body**

| Field    | Type   | Required | Rules                               |
| -------- | ------ | -------- | ----------------------------------- |
| columnId | string | yes      | must belong to the project          |
| position | number | yes      | sort order within the target column |

**Success — 200**

```json
{
	"id": "cuid...",
	"columnId": "cuid...",
	"title": "Fix login bug",
	"description": null,
	"assigneeId": null,
	"label": "BUG",
	"priority": "HIGH",
	"position": 2.5,
	"createdAt": "2026-...",
	"updatedAt": "2026-..."
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — column does not belong to this project

```json
{ "error": "Invalid column ID" }
```

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

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="get-members"></a>

## GET /projects/:id/members

Get the members list of a project.

**Auth:** Bearer access token

**Request body:** none.

**Success — 200**

```json
[
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

<a id="remove-member"></a>

## DELETE /projects/:id/members/:userId

Remove a member from a project. This endpoint handles two cases:

- **Leave project** — `:userId` is the authenticated user's ID. Any member except the owner can leave.
- **Remove member** — `:userId` is another member's ID. Only the project owner can remove other members.

When a member is removed, their task assignments in the project are cleared (`assigneeId` set to `null`).

**Auth:** Bearer access token

**Request body:** none.

**Success — 204**

No response body.

**Errors**

- **400** — owner tries to leave without transferring ownership first

```json
{ "error": "Transfer ownership before leaving the project" }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **403** — non-owner tries to remove another member

```json
{ "error": "Access denied" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **404** — member not found

```json
{ "error": "Member not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="transfer-ownership"></a>

## POST /projects/:id/transfer-ownership

Transfer project ownership to another member. Only the current owner can transfer. The new owner must already be a project member, and the project must have at least two members.

Updates `project.ownerId`, sets the new owner's role to `OWNER`, and demotes the previous owner to `MEMBER`.

**Auth:** Bearer access token

**Request body**

| Field  | Type   | Required | Rules                              |
| ------ | ------ | -------- | ---------------------------------- |
| userId | string | yes      | must be an existing project member |

**Success — 200**

```json
{
	"id": "cuid...",
	"name": "Horizon",
	"emoji": "📋",
	"ownerId": "cuid..."
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **400** — owner tries to transfer to themselves

```json
{ "error": "Cannot transfer ownership to yourself" }
```

- **400** — project has fewer than two members

```json
{ "error": "Add another member before transferring ownership" }
```

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **403** — requester is not the project owner

```json
{ "error": "Only the owner can transfer ownership" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **404** — new owner is not a project member

```json
{ "error": "Member not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="post-comment"></a>

## POST /projects/:id/tasks/:taskId/comments

Post a comment under a task. Only project members (`OWNER` or `MEMBER`) can post comments.

**Auth:** Bearer access token

**Request body**

| Field   | Type   | Required | Rules         |
| ------- | ------ | -------- | ------------- |
| content | string | yes      | 1–5000 chars  |

**Success — 201**

```json
{
	"id": "cuid...",
	"content": "I'll take a look",
	"taskId": "cuid...",
	"authorId": "cuid...",
	"createdAt": "2026-...",
	"author": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"imageUrl": null,
		"bio": null,
		"jobTitle": null,
		"company": null
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

- **403** — user is not a project member

```json
{ "error": "Access denied" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

<a id="delete-comment"></a>

## DELETE /projects/:id/tasks/:taskId/comments/:commentId

Delete a comment. Only the author can delete their own comment. The requester must be a project member (`OWNER` or `MEMBER`).

**Auth:** Bearer access token

**Request body:** none.

**Success — 204**

No response body.

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **403** — user is not a project member

```json
{ "error": "Access denied" }
```

- **403** — requester is not the comment author

```json
{ "error": "Only the author can delete this comment" }
```

- **404** — project not found

```json
{ "error": "Project not found" }
```

- **404** — task not found

```json
{ "error": "Task not found" }
```

- **404** — comment not found (or comment belongs to another task)

```json
{ "error": "Comment not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---
