# Smart Campus Hub — deployment

This document describes production-oriented deployment paths. Adjust hostnames, secrets, and TLS to match your environment.

## Prerequisites

- Node.js 18+ for the API and build tooling
- MySQL 8.x
- Optional: Docker / Docker Compose, PM2, nginx

## Database

1. Create a database user and schema (or use `backend/sql/smart_campus.sql` on a fresh instance).
2. If you are upgrading an older database, apply `backend/sql/migrations/001_upgrade_existing_db.sql` manually and skip statements that already ran.
3. Seed demo data (optional): `cd backend && npm run seed`

## Environment variables

Copy `backend/.env.example` to `backend/.env` and set:

- `JWT_SECRET` — long random string (32+ characters) in production
- `CLIENT_ORIGIN` — exact browser origin of the SPA (for CORS and Socket.IO)
- `TRUST_PROXY=1` when running behind nginx or a load balancer
- `DB_*` — MySQL connection
- Optional AI: `OPENAI_API_KEY`, `OLLAMA_BASE_URL`, etc.

For the Vite build, set `VITE_API_BASE` to the public API URL **only** if the UI is served from a different origin than the API (e.g. `https://api.example.com`). When nginx serves `/api` on the same host as the SPA, leave it empty.

## Docker Compose

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

- SPA: `http://localhost:8080` (default)
- API: `http://localhost:5000` (exposed by default; the SPA container proxies `/api` and `/socket.io` to the `api` service)

Set `JWT_SECRET`, `MYSQL_ROOT_PASSWORD`, and `DB_PASSWORD` in `.env` (root). Use `.env.example` as the starting point.

Compose now includes health checks for MySQL and API. `api` starts only after `db` is healthy, and `web` starts after `api` is healthy.

For existing `mysql_data` volumes, SQL init files do not rerun automatically. Apply incremental SQL manually:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p smart_campus < backend/sql/migrations/001_upgrade_existing_db.sql
```

## PM2 (API only)

```bash
cd backend
npm ci --omit=dev
pm2 start ../deploy/ecosystem.config.cjs --env production
```

Serve the frontend `dist` via nginx (or any static host) and proxy `/api` and `/socket.io` to the Node process. See `deploy/nginx.standalone-api.conf` for a starting point.

## Static files and uploads

The API stores uploads under `backend/uploads/` (`notices`, `events`, `avatars`). Mount a persistent volume or shared storage in production so files survive restarts.

## Health check

`GET /api/health` returns `{ ok: true, service: 'smart-campus-hub-api' }`.
