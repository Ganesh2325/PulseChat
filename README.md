# PulseChat

Production-grade real-time messaging platform built with NestJS, Next.js, PostgreSQL, Redis, and Socket.IO.

## Prerequisites

- **Node.js** 18+
- **Docker Desktop** (for PostgreSQL and Redis)

## Quick Start

### 1. Start Database Services

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 2. Setup Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Backend runs on `http://localhost:4000`.

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 4. Open PulseChat

Visit `http://localhost:3000` in your browser. You can:

- **Sign up** with email/password
- **Continue as Guest** for quick access
- Open **multiple browser tabs** to test real-time messaging

## Architecture

```
pulsechat/
├── backend/          # NestJS API + WebSocket server
│   ├── src/
│   │   ├── auth/         # JWT + refresh tokens + guest login
│   │   ├── users/        # User profiles & search
│   │   ├── rooms/        # Public channels
│   │   ├── conversations/# Direct messages
│   │   ├── messages/     # Message persistence
│   │   ├── chat/         # Socket.IO gateway
│   │   ├── media/        # File uploads
│   │   ├── ai/           # AI text processing (mock)
│   │   ├── moderation/   # Profanity filter
│   │   ├── notifications/# Mentions & alerts
│   │   ├── redis/        # Presence, rate limit, cache
│   │   ├── prisma/       # Database client
│   │   └── health/       # Health checks
│   └── prisma/
│       └── schema.prisma # Database schema
├── frontend/         # Next.js App Router
│   └── src/
│       ├── app/          # Pages (login, signup, chat)
│       ├── components/   # Sidebar, ChatView, Composer
│       ├── stores/       # Zustand state management
│       ├── hooks/        # Socket event hooks
│       └── lib/          # API client, Socket.IO client
├── docker-compose.yml
└── .env
```

## Features

- ⚡ Real-time messaging via WebSockets
- 🔐 JWT auth with refresh token rotation
- 🎭 Guest login
- 📢 Public rooms (Global, Gaming, Coding, Students, Random)
- 💬 Direct messages (1:1)
- 👥 Presence tracking (online/offline)
- 🤖 AI message enhance (improve, rewrite, summarize, translate)
- 🛡️ Profanity filter & rate limiting
- 🔔 @mention notifications
- 📱 Responsive design

## Environment Variables

See `.env.example` for all configuration options.

## Database Commands

```bash
# Run migrations
cd backend && npx prisma migrate dev

# View database
cd backend && npx prisma studio

# Seed default rooms
cd backend && npx prisma db seed
```
