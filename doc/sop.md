# SOP - support.widev.pro

## Purpose

This document explains:

- How the project is built
- How to run and test it locally
- How deployment works
- How to validate the app on the VPS/production

This project is already configured for local development and remote deployment.

## 1) Project Overview

- Framework: Nuxt 4 (SPA mode, `ssr: false`)
- Styling: Tailwind CSS v4 via PostCSS
- Auth/session: `nuxt-auth-utils` (cookie session)
- State: Pinia
- Data source: Supabase (`clients` table in PostgreSQL)
- Process manager (server): PM2
- Reverse proxy: Apache (HTTPS domain -> Node app on port 3000)
- CI/CD: GitHub Actions (`.github/workflows/deploy.yml`)

Core config:

- `nuxt.config.ts`
  - `srcDir: '.'`
  - `ssr: false`
  - runtime config for Supabase/admin/session
  - session cookie secure in production only (`NODE_ENV === 'production'`)
- `ecosystem.config.cjs`
  - app runs from `.output/server/index.mjs`
  - app name: `support-portal`
  - production port: `3000`

## 2) Local Setup and Run

### Prerequisites

- Node.js 24.x (matches CI/CD)
- npm
- `.env` file in repo root with required values:
  - `NUXT_SESSION_PASSWORD`
  - `ADMIN_USER`
  - `ADMIN_PASS_HASH`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Install dependencies

```bash
npm install
```

### Start local dev server

```bash
npm run dev
```

App URL:

- `http://localhost:3000`

## 3) Local Testing SOP

Run these checks each time you change auth, UI, or deploy-sensitive code.

### A. Basic app health

1. Open `http://localhost:3000`
2. Confirm login page renders without console/server errors

### B. Authentication flow

1. Test admin login (`ADMIN_USER` + valid password)
   - Expect redirect to `/admin`
2. Test client login (existing client slug/password in Supabase)
   - Expect redirect to `/:slug` client page
3. Test invalid password
   - Expect error feedback (no login)
4. Test logout
   - Expect redirect back to `/`

### C. Route protection

1. Open `/admin` while logged out
   - Expect redirect to `/`
2. Open `/:slug` while logged out
   - Expect redirect to `/`

### D. Production build sanity

```bash
npm run build
npm run preview
```

Then verify app still works in preview mode.

## 4) Deployment Workflow (Remote)

Deployment is automatic on push to `main`.

Trigger:

- Git push to `main`

Pipeline (`.github/workflows/deploy.yml`):

1. Checkout code
2. Setup Node 24
3. `npm install`
4. `npm run build` (with GitHub secrets env)
5. SSH to VPS and run:
   - `cd /var/www/support-portal`
   - `git pull origin main`
   - `npm install`
   - `npm run build`
   - `pm2 startOrRestart /var/www/support-portal/ecosystem.config.cjs --update-env`

## 5) Remote Verification SOP (VPS + Live)

After deployment, validate in this order.

### A. PM2 process status

```bash
pm2 list
pm2 logs support-portal
```

Confirm app is online and stable (no restart loops).

### B. App reachable locally on VPS

```bash
curl http://localhost:3000/api/auth/session
ss -tlnp | rg 3000
```

Expected:

- `curl` returns auth response (typically `401` when not logged in), not `502`
- Node is listening on port `3000`

### C. Apache proxy health

```bash
systemctl status httpd
tail -f /var/log/httpd/support.widev.pro-error.log
```

Confirm Apache is running and not reporting upstream proxy failures.

### D. Live URL checks

1. Open `https://support.widev.pro`
2. Test admin login and client login
3. Test logout
4. Verify protected routes still redirect correctly when logged out

## 6) Rollback / Recovery Quick Actions

If deployment fails:

1. Check GitHub Actions logs for failing step
2. SSH to VPS and run manual rebuild:

```bash
cd /var/www/support-portal
git pull origin main
npm install
npm run build
pm2 restart support-portal
```

3. Re-check PM2 logs and Apache error log

## 7) Done Criteria

A deployment is considered successful when all are true:

- GitHub Actions deploy job is green
- PM2 `support-portal` is online without crash loop
- `localhost:3000` responds on VPS
- `https://support.widev.pro` loads
- Admin and client login/logout flows pass
