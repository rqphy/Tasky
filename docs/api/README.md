# Tasky API

Base URL: `http://localhost:3001/api`

## Authentication

Most endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens are short-lived (default: 15 minutes). Use `POST /auth/refresh` with a refresh token to get new tokens.

## Docs

| File                         | Endpoints                                                   |
| ---------------------------- | ----------------------------------------------------------- |
| [auth.md](./auth.md)                 | register, login, refresh, logout, forgot/reset password, me |
| [users.md](./users.md)               | profile, email, password, delete account, profile image     |
| [notifications.md](./notifications.md) | list, mark read, mark all read                            |
| [projects.md](./projects.md)         | projects, columns, tasks, members, invites, share           |
