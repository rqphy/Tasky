# API tests

Language-agnostic black-box tests for the Tasky server. These hit the running HTTP API and WebSocket layer, and assert behavior matches the [API docs](../docs/api/README.md).

Use the same suite when you rewrite the server in another language — point it at any implementation that matches the contract.

## Prerequisites

- Node.js
- Server dependencies installed (`cd server-express && npm install`)
- Test dependencies installed (`cd api-tests && npm install`)

## One-time setup

**1. Create the test server env file**

```bash
cd server-express
cp .env.test.example .env.test
```

This uses a separate SQLite database (`api-test.db` at the project root) so tests don't touch your dev data.

**2. Create the test database**

```bash
npm run db:test:reset
```

## Run tests

**Terminal 1 — start the server on the test database**

```bash
cd server-express
npm run dev:test
```

**Terminal 2 — run the tests**

```bash
cd api-tests
npm test
```

Watch mode (re-runs on file save):

```bash
npm run test:watch
```

Run only socket tests:

```bash
npm test -- src/sockets
```

Vitest checks that the server is reachable at `/api/health` before running tests. If it's not up, you'll get a clear error.

## Reset the test database

Tests create users and data on every run. To wipe and recreate the test DB:

```bash
cd server-express
npm run db:test:reset
```

Restart `dev:test` if it's already running.

## Environment variables

Optional overrides (defaults shown):

| Variable       | Default                     |
| -------------- | --------------------------- |
| `API_BASE_URL` | `http://localhost:3001/api` |
| `SOCKET_URL`   | `http://localhost:3001`     |

Example (point at a server rewrite on another port):

```bash
API_BASE_URL=http://localhost:8080/api SOCKET_URL=http://localhost:8080 npm test
```

## Architecture

Tests mirror the API docs and server route groups — **one test file per doc file**, shared helpers for HTTP, sockets, and setup.

```
src/
  helpers/
    config.ts       # API_BASE_URL, SOCKET_URL
    client.ts       # axios instance + authHeaders()
    fixtures.ts     # uniqueEmail(), registerUser(), authAs(), createProject(), createColumn(), ...
    socket.ts       # createSocketClient(), connectSocket(), joinProject(), waitForEvent(), assertEventNotReceived()
  setup/
    global-setup.ts # health check before tests run
  rest/
    auth.test.ts              ← docs/api/auth.md
    users.test.ts             ← docs/api/users.md
    notifications.test.ts     ← docs/api/notifications.md
    invites.test.ts           ← docs/api/invites.md
    share.test.ts             ← docs/api/share.md
    projects/
      projects.test.ts        ← docs/api/projects.md (projects CRUD)
      column.test.ts          ← docs/api/projects.md (columns)
      tasks.test.ts           ← docs/api/projects.md (tasks)
      comment.test.ts         ← docs/api/projects.md (comments)
      member.test.ts          ← docs/api/projects.md (members)
      invites.test.ts         ← docs/api/projects.md (project invites)
      share.test.ts           ← docs/api/projects.md (share link management)
  sockets/                    ← docs/api/sockets.md
    auth.test.ts              ← connection + handshake auth
    rooms.test.ts             ← joinProject / leaveProject
    tasks.broadcasts.test.ts  ← task:created, task:updated, task:moved, task:deleted
    columns.broadcasts.test.ts← column:created, column:updated, column:reordered, column:deleted
    members.broadcasts.test.ts← member:joined, member:removed
    projects.broadcasts.test.ts← project:updated, project:deleted
    notifications.broadcasts.test.ts ← notification:created
```

### Where to put new tests

| Doc file | Test file | Notes |
| -------- | --------- | ----- |
| `docs/api/invites.md` | `src/rest/invites.test.ts` | Top-level — different mount path (`/invites`), not under `projects/` |
| `docs/api/share.md` | `src/rest/share.test.ts` | Top-level — public route, no auth |
| `docs/api/projects.md` (invites section) | `src/rest/projects/invites.test.ts` | Already exists — create/list/revoke |
| `docs/api/projects.md` (share section) | `src/rest/projects/share.test.ts` | Already exists — enable/disable link |
| `docs/api/sockets.md` | `src/sockets/*.test.ts` | Group by concern: auth, rooms, or broadcast domain |

**Rule:** if it has its own doc file (or its own top-level route mount in `server-express/src/routes/api.ts`), it gets its own test file at the same level.

### Rules

1. **One file per doc / route group** — if it's a separate file in `docs/api/`, it gets its own test file.
2. **Read the doc first** — each test asserts what the doc promises (status + body, or event + payload).
3. **Shared setup goes in `helpers/fixtures.ts`** — e.g. `registerUser()`, `createProject()`, `addMemberViaInvite()`.
4. **Shared socket setup goes in `helpers/socket.ts`** — e.g. `createSocketClient()`, `waitForEvent()`.
5. **Never import server code** — only HTTP and socket.io-client. Keeps tests working across server rewrites.
6. **One behavior per `it(...)`** — happy path + key errors, not every edge case.
7. **Unique data per test** — use `uniqueEmail()` so tests don't collide.
8. **Disconnect sockets in `afterEach`** — prevents leaked connections and hanging tests.

### Test status

| File | Status |
| ---- | ------ |
| **REST** | |
| `auth.test.ts` | ✓ |
| `users.test.ts` | ✓ |
| `notifications.test.ts` | ✓ |
| `projects/projects.test.ts` | ✓ |
| `projects/column.test.ts` | ✓ |
| `projects/tasks.test.ts` | ✓ |
| `projects/comment.test.ts` | ✓ |
| `projects/member.test.ts` | ✓ |
| `projects/invites.test.ts` | ✓ |
| `projects/share.test.ts` | ✓ |
| `invites.test.ts` | ✓ |
| `share.test.ts` | ✓ |
| **Sockets** | |
| `sockets/auth.test.ts` | ✓ |
| `sockets/rooms.test.ts` | ✓ |
| `sockets/tasks.broadcasts.test.ts` | ✓ |
| `sockets/columns.broadcasts.test.ts` | ✓ |
| `sockets/members.broadcasts.test.ts` | ✓ |
| `sockets/projects.broadcasts.test.ts` | ✓ |
| `sockets/notifications.broadcasts.test.ts` | ✓ |

## Writing REST tests

1. Check the relevant doc in `docs/api/`
2. Add or extend the matching file under `src/rest/`
3. Import `api` from `helpers/client.js`
4. Use `registerUser()` or `authAs()` when you need an authenticated user
5. Run `npm test`

## Writing socket tests

Socket tests follow the same black-box approach: connect with `socket.io-client`, trigger actions via REST, assert events and payloads match [docs/api/sockets.md](../docs/api/sockets.md).

### Typical broadcast test pattern

1. Create two users (owner + member) and a project.
2. Connect both sockets with `createSocketClient(user.accessToken)` — pass the raw JWT, not `Bearer ...`.
3. Call `connectSocket()` and, for room-scoped events, `joinProject()`.
4. Start listening **before** the REST trigger:
   - `waitForEvent(memberSocket, "task:created")` — recipient should receive
   - `assertEventNotReceived(ownerSocket, "task:created")` — sender should not
5. Trigger the REST endpoint (e.g. `createTask()`).
6. Assert the payload shape and key fields.
7. Disconnect sockets in `afterEach`.

### Delivery models to remember

| Event group | Delivery | Must join room? |
| ----------- | -------- | --------------- |
| `task:*`, `column:*`, `member:*` | `project:<projectId>` room | Yes — call `joinProject` |
| `project:updated`, `project:deleted` | All member sockets directly | No |
| `notification:created` | Target user socket directly | No |

When rewriting the server, implement the documented API and run this suite to verify compatibility.
