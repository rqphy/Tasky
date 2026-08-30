# Notifications

All paths are relative to `/api/notifications`.

All endpoints require a Bearer access token.

Validation errors (`400`) include a `details` field with Zod error info.

Only notifications from the last **30 days** are returned by `GET /`.

## Table of contents

- [GET / — list](#list-notifications)
- [PATCH /read-all — mark all read](#mark-all-read)
- [PATCH /:notificationId/read — mark one read](#mark-one-read)

---

<a id="list-notifications"></a>

## GET /

List notifications for the authenticated user, newest first.

**Auth:** Bearer access token

**Query params**

| Param     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| projectId | string | no       | Filter to a single project           |

**Request body:** none

**Success — 200**

Returns an array of notification objects.

```json
[
	{
		"id": "cuid...",
		"projectId": "cuid...",
		"type": "task_assigned",
		"title": "New task assigned",
		"message": "Alice assigned you to 'Fix bug'",
		"timestamp": "2026-...",
		"isRead": false,
		"actorId": "cuid...",
		"metadata": {
			"taskId": "cuid...",
			"taskTitle": "Fix bug",
			"oldStatus": "Todo",
			"newStatus": "In progress"
		}
	}
]
```

`type` is one of: `task_assigned`, `task_comment`, `task_status_changed`.

`metadata.oldStatus` and `metadata.newStatus` are only set for `task_status_changed` notifications. `metadata` may be omitted when not applicable.

**Errors**

- **400** — invalid query

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

<a id="mark-all-read"></a>

## PATCH /read-all

Mark all unread notifications as read for the authenticated user.

**Auth:** Bearer access token

**Query params**

| Param     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| projectId | string | no       | Only mark notifications for a project |

**Request body:** none

**Success — 200**

```json
{ "success": true }
```

**Errors**

- **400** — invalid query

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

<a id="mark-one-read"></a>

## PATCH /:notificationId/read

Mark a single notification as read. Only notifications belonging to the authenticated user can be updated.

**Auth:** Bearer access token

**Request body:** none

**Success — 200**

```json
{
	"id": "cuid...",
	"projectId": "cuid...",
	"type": "task_comment",
	"title": "New comment on your task",
	"message": "Alice commented on 'Fix bug'",
	"timestamp": "2026-...",
	"isRead": true,
	"actorId": "cuid...",
	"metadata": {
		"taskId": "cuid...",
		"taskTitle": "Fix bug"
	}
}
```

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **404** — notification not found or not owned by user

```json
{ "error": "Notification not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---
