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

| Variable       | Default                        |
| -------------- | ------------------------------ |
| `API_BASE_URL` | `http://localhost:3001/api`    |
| `SOCKET_URL`   | `http://localhost:3001`        |

Example:

```bash
API_BASE_URL=http://localhost:4000/api npm test
```

## Project structure

```
src/
  rest/          # REST endpoint tests (auth.test.ts, ...)
  setup/         # Vitest global setup (server health check)
  helpers/       # Shared config and utilities
```

## Writing tests

1. Check the relevant doc in `docs/api/`
2. Add a test file under `src/rest/`
3. Use the shared `api` axios client with `validateStatus: () => true` so error responses don't throw
4. Run `npm test`

When rewriting the server, implement the documented API and run this suite to verify compatibility.
