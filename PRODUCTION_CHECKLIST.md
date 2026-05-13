# Production checklist — Smart Campus Hub

Use this before go-live.

## Security

- [ ] Strong `JWT_SECRET` (32+ random characters), not committed to git
- [ ] MySQL credentials rotated; least-privilege DB user
- [ ] `CLIENT_ORIGIN` matches the real SPA URL exactly
- [ ] `TRUST_PROXY=1` only behind a trusted reverse proxy
- [ ] TLS enabled on public endpoints (Let’s Encrypt or managed certs)
- [ ] Rate limits reviewed (`backend/middleware/rateLimiter.js`) for your traffic profile

## Data & migrations

- [ ] Schema applied: fresh `smart_campus.sql` or incremental `001_upgrade_existing_db.sql`
- [ ] New performance indexes applied (event/user, attendance timetable/date, student dept/semester, event target/featured windows)
- [ ] Backup strategy for MySQL and upload directories
- [ ] Seed script **not** run in production unless intentional

## Application

- [ ] `NODE_ENV=production`
- [ ] `npm ci --omit=dev` in `backend`; `npm run build` in `frontend`
- [ ] `VITE_API_BASE` correct for split-origin setups; same-origin nginx proxy otherwise empty
- [ ] Upload directories exist and are writable (`uploads/notices`, `events`, `avatars`)
- [ ] Socket.IO connects from browser (same origin or CORS + credentials aligned)
- [ ] Direct notice files require authenticated access, and protected attachment download route is verified

## Observability

- [ ] Access / error logs aggregated (morgan `combined` in production)
- [ ] Disk space monitoring for uploads
- [ ] Optional: hook `audit_logs` / `activity_logs` to your SIEM

## Smoke tests

- [ ] Login (student / faculty / admin)
- [ ] Notices: list, read, favorite, attachment download
- [ ] Events: list, detail, register, CSV export (faculty/admin)
- [ ] Attendance mark + realtime dashboard refresh
- [ ] File registry: list / delete own file
- [ ] Assistant: `/api/assistant/capabilities` and chat (with or without LLM keys)

## Rollback

- [ ] Tagged release in version control
- [ ] Database migration rollback notes (manual for partial migrations)
