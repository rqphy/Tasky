# API tests

Language-agnostic black-box tests for the Tasky server. These hit the running HTTP API and assert responses match the [API docs](../docs/api/README.md).

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

Example:

```bash
API_BASE_URL=http://localhost:4000/api npm test
```

## Architecture

Tests mirror the API docs and server route groups — one file per area, shared helpers for HTTP and setup.

```
src/
  helpers/
    config.ts       # API_BASE_URL, SOCKET_URL
    client.ts       # axios instance + authHeaders()
    fixtures.ts     # uniqueEmail(), registerUser(), authAs(), createProject(), createColumn()
  setup/
    global-setup.ts # health check before tests run
  rest/
    auth.test.ts           ← docs/api/auth.md
    users.test.ts          ← docs/api/users.md (TODO)
    notifications.test.ts  ← docs/api/notifications.md (TODO)
    invites.test.ts        ← /api/invites (accept flow)
    share.test.ts          ← /api/share (public board)
    projects/
      projects.test.ts     ← CRUD
      columns.test.ts
      tasks.test.ts
      comments.test.ts
      members.test.ts
      invites.test.ts      ← project invites
      share.test.ts        ← project share link
  sockets/                 ← realtime tests (later)
    realtime.test.ts
```

### Rules

1. **One file per doc / route group** — if it's a separate section in `docs/api/`, it gets its own test file.
2. **Read the doc first** — each test asserts what the doc promises (status + body).
3. **Shared setup goes in `helpers/fixtures.ts`** — e.g. `registerUser()`, `createProject()`, `createColumn()`.
4. **Never import server code** — only HTTP. Keeps tests working across server rewrites.
5. **One behavior per `it(...)`** — happy path + key errors, not every edge case.
6. **Unique data per test** — use `uniqueEmail()` so tests don't collide.

### Suggested order

| Step | File | Depends on |
| ---- | ---- | ---------- |
| ✓ | `auth.test.ts` | — |
| 1 | `projects/projects.test.ts` | auth |
| 2 | `projects/columns.test.ts` | project |
| 3 | `projects/tasks.test.ts` | column |
| 4 | `projects/members.test.ts` | project + 2 users |
| 5 | `users.test.ts` | auth |
| 6 | `notifications.test.ts` | project + actions |
| 7 | `projects/comments.test.ts` | task |
| 8 | invites + share | members |
| 9 | `sockets/realtime.test.ts` | tasks |

## Writing tests

1. Check the relevant doc in `docs/api/`
2. Add or extend a file under `src/rest/`
3. Import `api` from `helpers/client.js`
4. Use `registerUser()` or `authAs()` when you need an authenticated user
5. Run `npm test`

When rewriting the server, implement the documented API and run this suite to verify compatibility.
