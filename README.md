# Boards

Boards is a Trello‑style app for creating boards, lists, and cards. Each board has lists, cards, admin and member roles; you can add users to your boards, promote them to admin or demote them to member. Cards can have assigned members. Admins can drag and reorder lists and cards, while members can only drag and reorder cards.

![demo](./git-assets/demo.gif)
[Backend](./backend/README.md)
[Frontend](./frontend/README.md)

## Structure

This repo includes a Developer Container configuration with a monorepo.

- `backend/`: NestJS API, Prisma, WebSocket gateway, AI module
- `frontend/`: Next.js UI, React Query, Orval-generated API clients
- `docker-compose.yml`: local dev services (Postgres + dev container)

## Requirements

- Node.js + pnpm
- PostgreSQL

## Environment

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

## Local Development

- Backend dev: `pnpm dev:backend`
- Frontend dev: `pnpm dev:frontend`

## Ports

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

## API Docs (Backend)

- REST Swagger UI: `http://localhost:3000/rest-docs`
- Swagger JSON: `http://localhost:3000/swagger/json`
- AsyncAPI (WebSocket): `http://localhost:3000/ws-docs`
