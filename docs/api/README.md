# Tasky API

Base URL: `http://localhost:3001/api`

## Authentication

Most endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens are short-lived (default: 15 minutes). Use `POST /auth/refresh` with a refresh token to get new tokens.

## Docs

| File | Endpoints |
| ---- | --------- |
| [auth.md](./auth.md) | register, login, refresh, logout, forgot/reset password, me |
| [users.md](./users.md) | profile, email, password, delete account, profile image |
| [notifications.md](./notifications.md) | list, mark read, mark all read |
| [invites.md](./invites.md) | validate invite, accept invite |
| [share.md](./share.md) | public shared board (read-only) |
| [projects.md](./projects.md) | projects, columns, tasks, members, comments, project invites, share link management |

## Route groups

Some features span two doc files:

| Feature | Manage / create | Accept / public access |
| ------- | --------------- | ---------------------- |
| Invites | `projects.md` → `/projects/:id/invites` | `invites.md` → `/invites/validate`, `/invites/accept` |
| Share   | `projects.md` → `/projects/:id/share`     | `share.md` → `/share/:token` |
