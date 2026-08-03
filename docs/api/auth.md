# Auth

All paths are relative to `/api/auth`.

The `user` object in responses never includes `password`. It may also include optional fields: `imageUrl`, `bio`, `jobTitle`, `company` (all `null` by default on register).

Validation errors (`400`) include a `details` field with Zod error info.

---

## POST /auth/register

Creates a new user account.

**Auth:** none

**Request body**

| Field    | Type   | Required | Rules       |
| -------- | ------ | -------- | ----------- |
| name     | string | yes      | 1–100 chars |
| email    | string | yes      | valid email |
| password | string | yes      | min 8 chars |

**Success — 201**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	},
	"accessToken": "eyJ...",
	"refreshToken": "abc..."
}
```

**Errors**

- **400** — email taken

```json
{ "error": "Email already registered" }
```

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## POST /auth/login

Sign in with email and password.

**Auth:** none

**Request body**

| Field    | Type   | Required | Rules       |
| -------- | ------ | -------- | ----------- |
| email    | string | yes      | valid email |
| password | string | yes      | min 8 chars |

**Success — 200**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	},
	"accessToken": "eyJ...",
	"refreshToken": "abc..."
}
```

**Errors**

- **401** — wrong password, unknown user, or deleted account

```json
{ "error": "Invalid credentials" }
```

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## POST /auth/refresh

Exchange a refresh token for a new access token and refresh token. The old refresh token is invalidated (rotation).

**Auth:** none

**Request body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| refreshToken  | string | yes      |

**Success — 200**

```json
{
	"accessToken": "eyJ...",
	"refreshToken": "abc..."
}
```

Note: unlike register/login, the response does **not** include `user`.

**Errors**

- **400** — missing refresh token

```json
{ "error": "Refresh token is required" }
```

- **401** — unknown refresh token

```json
{ "error": "Invalid refresh token" }
```

- **401** — expired refresh token (token is deleted from the database)

```json
{ "error": "Refresh token expired" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## POST /auth/logout

Invalidate a refresh token. Does not require an access token.

**Auth:** none

**Request body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| refreshToken  | string | yes      |

**Success — 200**

```json
{ "message": "Logged out successfully" }
```

**Errors**

- **400** — missing refresh token

```json
{ "error": "Refresh token is required" }
```

- **400** — unknown refresh token

```json
{ "error": "Invalid refresh token" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## POST /auth/forgot-password

Request a password reset email. Always returns the same success message, whether or not the email exists (prevents email enumeration).

**Auth:** none

**Request body**

| Field | Type   | Required | Rules       |
| ----- | ------ | -------- | ----------- |
| email | string | yes      | valid email |

**Success — 200**

```json
{
	"message": "If an account exists for that email, a reset link has been sent."
}
```

**Errors**

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## POST /auth/reset-password

Reset password using a token from the reset email. Invalidates all refresh tokens for that user.

**Auth:** none

**Request body**

| Field       | Type   | Required | Rules       |
| ----------- | ------ | -------- | ----------- |
| token       | string | yes      | min 1 char  |
| newPassword | string | yes      | min 8 chars |

**Success — 200**

```json
{ "message": "Password reset successfully" }
```

**Errors**

- **400** — invalid or expired token

```json
{ "error": "Invalid or expired reset link" }
```

- **400** — invalid input

```json
{ "error": "Validation failed", "details": {} }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```

---

## GET /auth/me

Returns the currently authenticated user.

**Auth:** Bearer access token

**Request body:** none

**Success — 200**

```json
{
	"user": {
		"id": "cuid...",
		"name": "Alice",
		"email": "alice@test.com",
		"createdAt": "2026-...",
		"updatedAt": "2026-..."
	}
}
```

**Errors**

- **401** — missing or invalid access token

```json
{ "error": "Missing or invalid authorization header" }
```

- **404** — user not found (token valid but user deleted)

```json
{ "error": "User not found" }
```

- **500** — server error

```json
{ "error": "Internal server error" }
```
