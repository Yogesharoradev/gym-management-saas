# GymOS — Gym Management SaaS (PRD)

## Problem Statement
Production-ready Gym Management SaaS for small/medium gyms in India. This task delivers ONLY the
foundation: architecture, authentication/authorization, DB models, multi-tenant isolation, dashboard
shell, and Super Admin shell. No business-module CRUD yet.

## Tech Stack
Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · shadcn-style UI · MongoDB + Mongoose ·
Zod · React Hook Form · Lucide icons · Recharts · next-themes · sonner.

## Infra note
Platform ingress routes `/api/*` → port 8001. A thin FastAPI reverse-proxy (`/app/backend/server.py`)
forwards `/api/*` to the Next.js app on port 3000 so standard `/api` route handlers work end-to-end.
Next.js runs via supervisor `frontend` program (`next dev` on :3000).

## Roles
- SUPER_ADMIN — platform owner; manages all gyms; `/super-admin/*`.
- GYM_ADMIN — owns one gym; `/dashboard` + gym modules.
- STAFF — future-ready role (no complex permissions yet).

## Multi-tenant isolation
- All gym-owned models carry `gymId`. `gymId` is derived from the server-side session (JWT), never client input.
- `src/lib/data/tenant.ts` `TenantScope` injects `gymId` into every query.
- Super Admin uses `src/lib/data/platform.ts` for cross-gym aggregates.

## Data models (Mongoose, src/models)
User, Gym, MembershipPlan, Member, Membership, Payment, WeightRecord, Attendance (source: MANUAL|FINGERPRINT),
Announcement, WhatsAppUsage, LoginAttempt. Subscription states: ACTIVE, PAST_DUE, SUSPENDED, CANCELLED.

## Implemented (2026-08-12)
- Custom JWT auth: login/logout/me, httpOnly Secure SameSite=Lax cookie, bcrypt(12), brute-force lockout.
- Idempotent seed (Super Admin + demo Gym + Gym Admin) via instrumentation hook.
- Middleware route protection + role separation (edge JWT verify).
- Server-side guards: requireAuth / requireSuperAdmin / requireGymContext.
- Suspended/cancelled gyms redirected to `/suspended` (data preserved).
- Responsive dashboard shell (sidebar + sticky glass header + user menu + mobile sheet nav).
- Gym dashboard with 7 KPI cards (mock, clearly marked) + sample revenue chart + expiring list.
- 8 module placeholder pages + read-only Settings (real gym info).
- Super Admin shell: Overview / Gyms / Subscriptions with live gym counts + placeholder MRR.
- Light/Dark theme toggle. Status badges, empty/loading/error states.
- TypeScript: no errors. No `any`.

## Backlog (future tasks, not in this foundation)
- P0: Members CRUD, Membership plans + assignment, Payments, Attendance workflows.
- P1: Expiry/renewals logic, Reports, Announcements + WhatsApp integration.
- P1: Super Admin suspend/reactivate actions, subscription billing + real MRR.
- P2: Fingerprint attendance, Staff permissions, editable gym profile, weight-progress charts.
