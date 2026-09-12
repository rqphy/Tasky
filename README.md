# Tasky

A full-stack kanban task board — projects, columns, tasks, members, invites, notifications, and real-time updates.

> **Note:** Active learning project. The Express API is the current backend; a Java (Spring Boot) rewrite is planned. The API contract and black-box tests may evolve until that migration is done.

## Screenshots

| Kanban board | Notifications |
| ------------ | ------------- |
| ![Kanban board](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QiPkAsZS5SmVfP6OFnIWTeYdq2M7zt4iZHxLr) | ![Notifications](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QSXGIgD79W0CsnlGaMLmPio2exXKZOBt3YvdI) |

| Members | Task detail |
| ------- | ----------- |
| ![Project members](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4Ql2JNi0sovPk9jAThnebYCfcMExiG0z4F3Zml) | ![Task detail with comments](https://juq1maqrjs.ufs.sh/f/r1m4dnkvsK4QPbIh2qgLsrfbtFkaLc4RTHnZuKoz0VSM2X96) |

## Why this project

I'm primarily a frontend developer working toward full-stack. Tasky is my deliberate backend practice ground: a real app with auth, relational data, permissions, email, file uploads, REST, and WebSockets — not a tutorial todo list.

I started with **Node.js / Express** because I'd already built a few APIs with that stack and could move fast while learning deeper backend concepts (JWT auth, Prisma, room-based sockets, notification dispatch, etc.).

The next step is to **rewrite the API in another language** — starting with **Java (Spring Boot)** — while keeping the same frontend and contract. To make that safe, I documented every endpoint and socket event, then wrote a **language-agnostic black-box test suite** (`api-tests/`) that hits HTTP and WebSockets against a running server. When the backend changes language or framework, the tests stay the same.

## Stack

| Layer | Tech |
| ----- | ---- |
| Frontend | React, TypeScript, Vite, TanStack Query, Socket.io client |
| Backend | Node.js, Express, TypeScript, Prisma, Socket.io |
| Database | SQLite (dev / test) |
| Tests | Vitest, Axios, socket.io-client |
| Integrations | Resend (email), UploadThing (avatars) |

## What's in the repo

| Folder | Role |
| ------ | ---- |
| [`client/`](client/) | React + TypeScript + Vite frontend (kanban board, auth, real-time UI) |
| [`server-express/`](server-express/) | Current API — Express, TypeScript, Prisma, Socket.io |
| [`api-tests/`](api-tests/) | Contract tests — REST + sockets, run against any compatible server |
| [`docs/api/`](docs/api/) | API specification (source of truth for tests and rewrites) |

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
cp .env.example .env   # optional — defaults work for local dev
npm run dev
```

**Backend (Express)**

```bash
cd server-express
cp .env.example .env    # required — set JWT secrets and optional integrations
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
- [ ] Compare implementations and deepen backend fundamentals along the way

## Security (before deploying)

This repo is set up for **local development**. If you fork or deploy it:

- Copy `server-express/.env.example` → `.env` and set strong `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` (never use the dev defaults in production).
- Add real `RESEND_API_KEY` and `UPLOADTHING_TOKEN` only in your local `.env` — these files are gitignored.
- Never commit `.env`, `*.db`, or API keys.

## Copyright

© Raphael Ferreira. All rights reserved.

This repository is public for **portfolio and reference** only. You may read and explore the code to understand how the project works. Do not copy, modify, or redistribute it without permission.
