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

Tests mirror the API docs and server route groups — **one test file per doc file**, shared helpers for HTTP and setup.

```
src/
  helpers/
    config.ts       # API_BASE_URL, SOCKET_URL
    client.ts       # axios instance + authHeaders()
    fixtures.ts     # uniqueEmail(), registerUser(), authAs(), createProject(), createColumn()
  setup/
    global-setup.ts # health check before tests run
  rest/
    auth.test.ts              ← docs/api/auth.md
    users.test.ts             ← docs/api/users.md
    notifications.test.ts     ← docs/api/notifications.md
    invites.test.ts           ← docs/api/invites.md (TODO)
    share.test.ts             ← docs/api/share.md (TODO)
    projects/
      projects.test.ts        ← docs/api/projects.md (projects CRUD)
      column.test.ts          ← docs/api/projects.md (columns)
      tasks.test.ts           ← docs/api/projects.md (tasks)
      comment.test.ts         ← docs/api/projects.md (comments)
      member.test.ts          ← docs/api/projects.md (members)
      invites.test.ts         ← docs/api/projects.md (project invites)
      share.test.ts           ← docs/api/projects.md (share link management)
  sockets/                    ← realtime tests (next)
    realtime.test.ts          ← (TODO)
```

### Where to put new tests

| Doc file | Test file | Notes |
| -------- | --------- | ----- |
| `docs/api/invites.md` | `src/rest/invites.test.ts` | Top-level — different mount path (`/invites`), not under `projects/` |
| `docs/api/share.md` | `src/rest/share.test.ts` | Top-level — public route, no auth |
| `docs/api/projects.md` (invites section) | `src/rest/projects/invites.test.ts` | Already exists — create/list/revoke |
| `docs/api/projects.md` (share section) | `src/rest/projects/share.test.ts` | Already exists — enable/disable link |

**Rule:** if it has its own doc file (or its own top-level route mount in `server-express/src/routes/api.ts`), it gets its own test file at the same level.

### Rules

1. **One file per doc / route group** — if it's a separate file in `docs/api/`, it gets its own test file.
2. **Read the doc first** — each test asserts what the doc promises (status + body).
3. **Shared setup goes in `helpers/fixtures.ts`** — e.g. `registerUser()`, `createProject()`, `addMemberViaInvite()`.
4. **Never import server code** — only HTTP. Keeps tests working across server rewrites.
5. **One behavior per `it(...)`** — happy path + key errors, not every edge case.
6. **Unique data per test** — use `uniqueEmail()` so tests don't collide.

### REST test status

| File | Status |
| ---- | ------ |
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
| `invites.test.ts` | TODO — validate + accept |
| `share.test.ts` | TODO — public board |
| `sockets/realtime.test.ts` | TODO — next after REST |

## Writing tests

1. Check the relevant doc in `docs/api/`
2. Add or extend the matching file under `src/rest/`
3. Import `api` from `helpers/client.js`
4. Use `registerUser()` or `authAs()` when you need an authenticated user
5. Run `npm test`

When rewriting the server, implement the documented API and run this suite to verify compatibility.
