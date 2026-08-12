# Test Credentials — GymOS

Login page: `/login`

## Super Admin
- Email: `owner@gymos.app`
- Password: `SuperAdmin@123`
- Role: SUPER_ADMIN (no gym) → lands on `/super-admin`

## Gym Admin (demo gym: "Iron Pulse Fitness")
- Email: `admin@ironpulse.in`
- Password: `GymAdmin@123`
- Role: GYM_ADMIN → lands on `/dashboard`

## Auth API endpoints (Next.js route handlers, proxied via /api)
- POST `/api/auth/login`  { email, password } → sets httpOnly `gymos_session` cookie
- POST `/api/auth/logout`
- GET  `/api/auth/me`  (requires cookie)
- GET  `/api/health`

## Notes
- Auth: custom JWT (jose, HS256) in an httpOnly, Secure, SameSite=Lax cookie. Passwords hashed with bcryptjs (cost 12).
- Seeding is idempotent (runs on server start via instrumentation hook).
- Brute-force lockout: 5 failed attempts per ip:email → 15 min lock.
- Suspended gym: set `db.gyms` subscriptionStatus to SUSPENDED/CANCELLED (or status SUSPENDED) → gym users redirected to `/suspended`. Data is never deleted.
