# Tasky

A full-stack kanban task board — projects, columns, tasks, members, invites, notifications, and real-time updates.

## Why this project

I'm primarily a frontend developer working toward full-stack. Tasky is my deliberate backend practice ground: a real app with auth, relational data, permissions, email, file uploads, REST, and WebSockets — not a tutorial todo list.

I started with **Node.js / Express** because I'd already built a few APIs with that stack and could move fast while learning deeper backend concepts (JWT auth, Prisma, room-based sockets, notification dispatch, etc.).

The next step is to **rewrite the API in another language** — starting with **Java (Spring Boot)** — while keeping the same frontend and contract. To make that safe, I documented every endpoint and socket event, then wrote a **language-agnostic black-box test suite** (`api-tests/`) that hits HTTP and WebSockets against a running server. When the backend changes language or framework, the tests stay the same.

## What's in the repo

| Folder                               | Role                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| [`client/`](client/)                 | React + TypeScript + Vite frontend (kanban board, auth, real-time UI) |
| [`server-express/`](server-express/) | Current API — Express, TypeScript, Prisma, Socket.io                  |
| [`api-tests/`](api-tests/)           | Contract tests — REST + sockets, run against any compatible server    |
| [`docs/api/`](docs/api/)             | API specification (source of truth for tests and rewrites)            |

## Features

- User auth (register, login, JWT refresh, password reset)
- Projects with emoji, ownership, and member roles
- Kanban columns and tasks (assignees, labels, priority, comments)
- Project invites and public read-only share links
- In-app notifications (task assigned, status changed, comments)
- Real-time board updates via WebSockets (tasks, columns, members, projects)
- Profile management and avatar uploads

## Docs

- [API docs](docs/api/README.md) — REST endpoints
- [Socket docs](docs/api/sockets.md) — connection, client events, broadcasts, rules
- [Server setup](server-express/README.md)
- [Running API tests](api-tests/README.md)

## Quick start

**Frontend**

```bash
cd client
npm install
npm run dev
```

**Backend (Express)**

```bash
cd server-express
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev
```

**API tests**

```bash
cd server-express
cp .env.test.example .env.test
npm run db:test:reset
npm run dev:test   # terminal 1

cd api-tests
npm install
npm test           # terminal 2
```

## Roadmap

- [x] Express API + documented contract
- [x] Black-box REST and socket test suite
- [ ] Rewrite API in Java (Spring Boot), verified by the same `api-tests`
- [ ] Rewrite API in other languages ( I'll see )
