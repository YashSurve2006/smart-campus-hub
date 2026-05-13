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

3. Install and seed demo data:

   ```bash
   npm install
   npm run seed
   ```

4. Run the server:

   ```bash
   npm run dev
   ```

## Demo accounts (after seed)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@smartcampus.edu     | Campus@123  |
| Faculty | dr.lee@smartcampus.edu    | Campus@123  |
| Student | alex@student.smartcampus.edu | Campus@123 |

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
