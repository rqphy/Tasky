# Sockets

## Table of contents

- [Connection and Auth](#connection)
- [Client events](#client-events)
- [Broadcast events and payloads](#broadcast-events)
    - [Tasks](#tasks)
    - [Columns](#columns)
    - [Members](#members)
    - [Projects](#projects)
    - [Notifications](#notifications)
- [Rules](#rules)

---

<a id="connection"></a>

## Connection and Auth

Sockets connect to the root server URL (`http://localhost:3001` or `SOCKET_URL`).

### Handshake Authentification

Authentification is done during the handshake via `auth.token`.

- **Transport:** WebSocket / Polling
- **Auth payload:** `{ token: "<accessToken>" }`

#### Connection Errors

If the token is missing, expired, or invalid, connection fails with an Error:

- `error.message`: `"Unauthorized"`

<a id="client-events"></a>

## Client Events ( Client -> Server )

### `joinProject`

Joins a project room to listen to board updates.

- **Payload:** `projectId: string`
- **Acknowledgment:** `(response: { ok: boolean, error?: string }) => void`

#### Response:

- Success: `{ ok: true }`
- Error (project not found): `{ ok: false, error: "Project not found" }`
- Error (not a member / no access): `{ ok: false, error: "Access denied" }`
- Error (invalid input: empty or not a string): `{ ok: false, error: "Invalid projectId" }`

---

### `leaveProject`

Leave a project room.

- **Payload:** `projectId: string`

#### Response:

No response or ack returned to the client.

---

<a id="broadcast-events"></a>

## Broadcast Events and Payloads

<a id="tasks"></a>

### Tasks

#### `task:created`

Emitted when a new task is created in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who created the task does **not** receive this event.
- **Trigger:** `POST /api/projects/:id/tasks`

##### Payload:

```json
{
	"projectId": "cuid...",
	"task": {
		"id": "cuid...",
		"columnId": "cuid...",
		"title": "Implement new feature",
		"description": null,
		"assigneeId": null,
		"label": null,
		"priority": "MEDIUM",
		"position": 1,
		"createdAt": "2026-...",
		"updatedAt": "2026-...",
		"assignee": null,
		"_count": { "comments": 0 }
	}
}
```

---

#### `task:updated`

Emitted when a task is updated in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who updated the task does **not** receive this event.
- **Trigger:** `PATCH /api/projects/:id/tasks/:taskId`

##### Payload:

```json
{
	"projectId": "cuid...",
	"task": {
		"id": "cuid...",
		"columnId": "cuid...",
		"title": "Implement new feature",
		"description": null,
		"assigneeId": null,
		"label": null,
		"priority": "MEDIUM",
		"position": 1,
		"createdAt": "2026-...",
		"updatedAt": "2026-...",
		"assignee": null,
		"_count": { "comments": 0 }
	}
}
```

---

#### `task:deleted`

Emitted when a task is deleted in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who deleted the task does **not** receive this event.
- **Trigger:** `DELETE /api/projects/:id/tasks/:taskId`

##### Payload:

```json
{
	"projectId": "cuid...",
	"taskId": "cuid..."
}
```

---

#### `task:moved`

Emitted when a task is moved in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who moved the task does **not** receive this event.
- **Trigger:** `POST /api/projects/:id/tasks/:taskId/move`

##### Payload:

```json
{
	"projectId": "cuid...",
	"taskId": "cuid...",
	"columnId": "cuid...",
	"position": 1
}
```

---

<a id="columns"></a>

### Columns

#### `column:created`

Emitted when a column is created in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who created the new column does **not** receive this event.
- **Trigger:** `POST /api/projects/:id/columns`

##### Payload:

```json
{
	"projectId": "cuid...",
	"column": {
		"id": "cuid...",
		"projectId": "cuid...",
		"name": "TODO",
		"color": "#f2b093",
		"position": 1,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

---

#### `column:updated`

Emitted when a column is updated in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who updated the column does **not** receive this event.
- **Trigger:** `PATCH /api/projects/:id/columns/:columnId`

##### Payload:

```json
{
	"projectId": "cuid...",
	"column": {
		"id": "cuid...",
		"projectId": "cuid...",
		"name": "TODO",
		"color": "#f2b093",
		"position": 1,
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

---

#### `column:deleted`

Emitted when a column is deleted in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who deleted the column does **not** receive this event.
- **Trigger:** `DELETE /api/projects/:id/columns/:columnId`

##### Payload:

```json
{
	"projectId": "cuid...",
	"columnId": "cuid..."
}
```

---

#### `column:reordered`

Emitted when a column is reordered in a project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who reordered the column does **not** receive this event.
- **Trigger:** `POST /api/projects/:id/columns/reorder`

##### Payload:

```json
{
	"projectId": "cuid...",
	"columns": [{ "id": "cuid...", "position": 1 }]
}
```

---

<a id="members"></a>

### Members

#### `member:joined`

Emitted when a member has joined the project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who joined the project does **not** receive this event.
- **Trigger:** `POST /api/invites/:token/accept`

##### Payload:

```json
{
	"projectId": "cuid...",
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
	}
}
```

---

#### `member:removed`

Emitted when a member has been removed from the project.

- **Room:** `project:<projectId>`
- **Exclusion:** The user who removed the member from the project does **not** receive this event.
- **Trigger:** `DELETE /api/projects/:id/members/:userId`

##### Payload:

```json
{
	"projectId": "cuid...",
	"userId": "cuid..."
}
```

---

<a id="projects"></a>

### Projects

#### `project:updated`

Emitted when a project has been updated.

- **Target:** All active sockets of project members (except sender). Does not require joining the project room.
- **Exclusion:** The user who updated the project does **not** receive this event.
- **Trigger:** `PATCH /api/projects/:id`

##### Payload:

```json
{
	"projectId": "cuid...",
	"name": "Pasta app",
	"emoji": "🍝",
	"updatedAt": "2026-..."
}
```

---

#### `project:deleted`

Emitted when a project has been deleted.

- **Target:** All active sockets of project members (except sender). Does not require joining the project room.
- **Exclusion:** The user who deleted the project does **not** receive this event.
- **Trigger:** `DELETE /api/projects/:id`

##### Payload:

```json
{
	"projectId": "cuid..."
}
```

---

<a id="notifications"></a>

### Notifications

#### `notification:created`

Emitted when a new notification is generated for a user (e.g. assigned to a task, status changed).

- **Target:** Sockets of the recipient user only (`emitToUser`). Does not require joining any project room.
- **Trigger:** Internal server actions generating notifications (e.g. task assignment, task move).

##### Payload:

```json
{
	"id": "cuid...",
	"projectId": "cuid...",
	"type": "TASK_ASSIGNED",
	"title": "Task Assigned",
	"message": "You were assigned to task 'Implement new feature'",
	"timestamp": "2026-...",
	"isRead": false,
	"actorId": "cuid...",
	"metadata": {
		"taskId": "cuid...",
		"taskTitle": "Implement new feature",
		"oldStatus": "TODO",
		"newStatus": "IN_PROGRESS"
	}
}
```

---

<a id="rules"></a>

## Rules

1. **Authentication:**
    - Every connection must supply a valid JWT access token in `auth.token` during the handshake. Connections without or with invalid tokens are immediately rejected with `"Unauthorized"`.

2. **Room Scoping:**
    - Board events (`task:*`, `column:*`, `member:*`) are scoped to the room `project:<projectId>`.
    - Clients must explicitly join the room using `joinProject` after connecting.
    - Only users who are active members of the project can join the room. Non-members receive `{ ok: false, error: "Not a member of this project" }`.

3. **Sender Exclusion:**
    - Broadcast events triggered by a client's HTTP request (such as creating a task, moving a column, or leaving a project) are sent to everyone in the room **except** the user who initiated the action (`emitToProjectExceptUser`). This avoids duplicating state updates for clients that apply optimistic UI updates.

4. **Global Project Updates:**
    - Events affecting workspace level info (`project:updated`, `project:deleted`) are sent to all active sockets belonging to project members (`emitToUsersExceptUser`), regardless of whether they have joined the specific `project:<projectId>` room.

5. **Direct User Messaging:**
    - Notifications (`notification:created`) are sent directly to the targeted recipient user's active sockets (`emitToUser`) across the application.

6. **Connection Lifecycle & Cleanup:**
    - When a user socket connects, it is registered in an in-memory map by `userId`.
    - When a socket disconnects, it is automatically removed from the registry and leaves all joined rooms.
