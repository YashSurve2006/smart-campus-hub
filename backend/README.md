# Smart Campus Hub — API

Express.js REST API with MySQL, JWT (HTTP-only cookie + Bearer), and Socket.IO for live campus events.

## Setup

1. Create the database and tables:

   ```bash
   mysql -u root -p < sql/smart_campus.sql
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `DB_*` and `JWT_SECRET`.

3. Install dependencies and configure local-only seed credentials in `.env` (`DEMO_PASSWORD` must be at least 12 characters). The seed script is destructive and refuses to run unless both `NODE_ENV=development` and `RESET_DEMO_DATA=true` are set. Use it only against a disposable development database:

   ```bash
   npm install
   # Set NODE_ENV=development and RESET_DEMO_DATA=true in backend/.env first.
   npm run seed
   ```

4. Run the server:

   ```bash
   npm run dev
   ```

## Demo accounts (development only)

The seed script creates sample accounts using the password configured in `DEMO_PASSWORD`. The password is intentionally not documented or printed by the script. Never enable demo accounts or destructive seeding in production. Use a dedicated, least-privileged database account rather than MySQL `root`.

## Main endpoints

- `POST /api/auth/register` — student/faculty self-registration  
- `POST /api/auth/login` — sets `token` cookie  
- `GET /api/auth/me` — current profile  
- `GET /api/dashboard/student|faculty|admin` — role dashboards  
- `GET /api/notices` — notice board with search  
- `GET /api/timetable` — filters by department, semester, day  
- `GET /api/attendance/me` — student history  
- `POST /api/attendance/mark` — faculty marks attendance  
- `GET /api/analytics` — admin charts  
- `GET /api/campus/places` — navigation POIs  

Socket.IO connects to the same port; authenticate with `auth: { token }` to join role rooms.
