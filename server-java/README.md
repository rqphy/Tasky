# Tasky Java Server

Spring Boot rewrite of the Tasky API. It follows the same HTTP contract as the Express server.

## Requirements

- JDK 21 or newer
- Maven 3.6.3 or newer

Check both:

```bash
java -version
mvn -version
```

## Setup

From this folder:

```bash
cd server-java
mvn spring-boot:run
```

The first run downloads dependencies. Hibernate creates `tasky-java.db` in the current directory and updates tables from the JPA entities. Start the command from `server-java` so the database file stays here.

Stop the Express server before starting this one. Both use port `3001`.

The server listens on `http://localhost:3001/api`.

## Check that it is running

```bash
curl http://localhost:3001/api/health
```

## Configuration

Shared settings live in `src/main/resources/application.properties`:

| Setting | Purpose |
| ------- | ------- |
| `server.port` | HTTP port, `3001` |
| `server.servlet.context-path` | Prefixes every route with `/api` |
| `spring.datasource.url` | SQLite file, `tasky-java.db` |
| `spring.jpa.hibernate.ddl-auto` | Creates and updates tables on startup |
| `tasky.jwt.access-token-secret` | HMAC secret for access tokens. Must be at least 32 characters |
| `tasky.jwt.access-token-expiry` | Access token lifetime, `15m` |
| `tasky.jwt.refresh-token-expiry` | Refresh token lifetime, `7d` |

`tasky-java.db` is gitignored. It is separate from the Express database.

## Implemented routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

The contract for the remaining routes is in [`docs/api`](../docs/api/README.md).

## Tech stack

- **Spring Boot 4.1** — application framework
- **Spring Web MVC** — HTTP and JSON
- **Spring Security** — route protection and password hashing
- **Spring Data JPA and Hibernate** — database mapping
- **SQLite** — local database
- **JJWT** — access tokens
