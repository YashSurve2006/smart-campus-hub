# DEPLOYMENT QUICK REFERENCE
**Smart Campus Hub** — Production Deployment Checklist

---

## 🔴 CRITICAL ISSUES FIXED (4)

| Issue | File | Fix |
|-------|------|-----|
| Wrong env var | `frontend/src/services/api.js` | Changed `VITE_API_URL` → `VITE_API_BASE` |
| Missing /api | `frontend/src/services/api.js` | Added `/api` suffix to baseURL |
| Hardcoded URLs | `FacultyResultsPage.jsx` | Replaced fetch → api.get() |
| Hardcoded URLs | `FacultyAIAssistant.jsx` | Replaced fetch → api.get() |

---

## ✅ FILES MODIFIED (4)

1. ✅ `frontend/src/services/api.js`  
   ```javascript
   baseURL: `${import.meta.env.VITE_API_BASE || ''}/api`
   ```

2. ✅ `frontend/.env.example`  
   Updated documentation with production URL example

3. ✅ `frontend/src/pages/faculty/FacultyResultsPage.jsx`  
   Replaced hardcoded localhost fetch with api.get()

4. ✅ `frontend/src/pages/faculty/FacultyAIAssistant.jsx`  
   Replaced hardcoded localhost fetch with api.get()

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Commit & Push
```bash
cd j:\COLLEGE CAMPUS
git add -A
git commit -m "fix: API client baseURL and hardcoded localhost URLs for production"
git push origin main
```

### Step 2: Vercel Configuration
**Settings → Environment Variables**
```
Name: VITE_API_BASE
Value: https://smart-campus-hub-api.onrender.com
Environment: Production, Preview, Development
```
Then: **Deployments → Redeploy**

### Step 3: Render Configuration
**Environment → Environment Variables**
```
CLIENT_ORIGIN=https://smart-campus-hub-ten.vercel.app
NODE_ENV=production
TRUST_PROXY=1
JWT_SECRET=<secure-string>
DB_HOST=<your-db>
DB_PORT=3306
DB_USER=<your-user>
DB_PASSWORD=<secure-password>
DB_NAME=smart_campus
```

### Step 4: Manual Render Redeploy
**Dashboard → Backend Service → Manual Deploy**

---

## 🧪 QUICK VALIDATION

### Test Login Flow
```bash
curl -X POST https://smart-campus-hub-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}'
```

### Test Health Check
```bash
curl https://smart-campus-hub-api.onrender.com/api/health
# Expected: {"ok":true,"service":"smart-campus-hub-api"}
```

### Test Frontend
1. Open https://smart-campus-hub-ten.vercel.app
2. Click Login
3. Check browser Network tab:
   - API calls should go to: `https://smart-campus-hub-api.onrender.com/api/*`
   - Status: 200-401 (not CORS errors)

---

## 📋 API ROUTES INVENTORY

| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | Yes |
| GET | /api/auth/me | Yes |
| GET | /api/health | No |
| GET | /api/departments | No |
| GET | /api/dashboard/student | Yes |
| GET | /api/dashboard/faculty | Yes |
| GET | /api/dashboard/admin | Yes |
| GET | /api/notices | No |
| GET | /api/events | No |
| GET | /api/notifications | Yes |
| POST | /api/results | Yes |
| GET | /api/ai-analytics/* | Yes |

---

## 🔐 CORS & SECURITY

**Backend CORS Origin**:
```
https://smart-campus-hub-ten.vercel.app
```

**Socket.IO**:
```
Same origin as CORS
Path: /socket.io
Auth: Bearer token in socket.handshake.auth.token
```

---

## 📝 ENV VARIABLES SUMMARY

| Platform | Variable | Value |
|----------|----------|-------|
| **Vercel** | VITE_API_BASE | `https://smart-campus-hub-api.onrender.com` |
| **Render** | CLIENT_ORIGIN | `https://smart-campus-hub-ten.vercel.app` |
| **Render** | NODE_ENV | `production` |
| **Render** | TRUST_PROXY | `1` |

---

## ⏱️ EXPECTED PROPAGATION TIME

- Code changes: Instant (after git push)
- Vercel deployment: 2-3 minutes
- Render deployment: 2-5 minutes
- DNS/CDN refresh: 5-15 minutes
- **Total**: ~20 minutes max

---

## ❌ DO NOT DO THIS

- ❌ Hardcode API URLs in components
- ❌ Use different env variable names
- ❌ Forget VITE_ prefix in frontend env vars
- ❌ Deploy without setting CLIENT_ORIGIN
- ❌ Deploy without setting VITE_API_BASE
- ❌ Mix Bearer tokens with cookie auth

---

## ✅ YOU'RE GOOD IF

- ✅ Login page works from Vercel
- ✅ Network requests go to `onrender.com/api/*`
- ✅ No 401/403 errors (unless invalid credentials)
- ✅ No CORS errors in browser console
- ✅ Socket.IO connects successfully
- ✅ Real-time updates (notices, attendance) work

---

**Status**: Ready for Production ✅  
**Test Time**: 5-10 minutes  
**Rollback**: Previous commit available  
