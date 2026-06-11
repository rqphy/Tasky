# Tasky Express Server

Authentication server for Tasky project management app built with Express, TypeScript, and Prisma.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

3. Generate Prisma Client and create database:
```bash
npm run db:generate
npm run db:push
```

## Development

Start the development server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database

The SQLite database is located at `../tasky.db` (shared with other server implementations).

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (To be implemented)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **SQLite** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **cors** - CORS support
- **cookie-parser** - Cookie handling
