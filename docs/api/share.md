# Share (public)

All paths are relative to `/api/share`.

Read-only access to a project board via a share link token. No authentication required.

Managing share links (enable/disable, get URL) is done under [projects.md](./projects.md) (`/api/projects/:id/share`).

## Table of contents

- [GET /:token — get shared board](#get-shared-board)

---

<a id="get-shared-board"></a>

## GET /:token

Get a project board (columns and tasks) using an active share token. Does not include project members.

**Auth:** none

**Request body:** none

**Success — 200**

Same board shape as [GET /projects/:id](./projects.md#get-project), but **without** the `members` array:

```json
{
	"id": "cuid...",
	"name": "Horizon",
	"emoji": "📋",
	"ownerId": "cuid...",
	"createdAt": "2026-...",
	"updatedAt": "2026-...",
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

- **404** — share link not found or inactive

```json
{ "error": "Share link not found" }
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
