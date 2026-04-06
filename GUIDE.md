# support.widev.pro — Project Guide

## What Was Built & Fixed

### Original issues resolved
- **Blank page** — Nuxt 4 defaults `srcDir` to `app/`, so `pages/`, `components/`, `middleware/` were invisible. Fixed with `srcDir: '.'`
- **SSR crash** — vite-node IPC crash on every page load. Disabled SSR (`ssr: false`) — correct for a login-protected portal with no SEO requirement
- **Login stuck on "Signing in..."** — `useFetch` in route middleware never resolves. Replaced with `$fetch`; used `window.location.href` for post-login redirect to bypass Vue Router hang
- **Session cookie always Secure** — H3 sets `Secure: true` by default; browser rejected cookie on HTTP localhost. Fixed via `runtimeConfig.session.cookie.secure: false` in dev
- **Auth bypass** — `getUserSession()` returns `{}` (truthy) when no session exists, so `!session` was always `false`. Fixed to check `session?.user`
- **`props is not defined`** — `defineProps()` result not assigned to a variable, then referenced as `props.pages`. Fixed to `const props = defineProps(...)`
- **Tailwind not processing** — Tailwind v4 installed but no integration. Added `@tailwindcss/postcss` via Nuxt's `postcss` config
- **Deployment failures** — missing Node 24 on VPS, no pm2, no repo clone, Apache serving static files instead of proxying to Node. All resolved

---

## How the System Works

### Stack
| Layer | Tech |
|---|---|
| Framework | Nuxt 4 (SPA mode, `ssr: false`) |
| UI / Styling | Tailwind CSS v4 via PostCSS |
| Auth | `nuxt-auth-utils` — encrypted server-side sessions |
| Database | Supabase (PostgreSQL) — client accounts only |
| State | Pinia |
| Server | Nitro (Node.js) |
| Hosting | Hostinger VPS (AlmaLinux 9) |
| Reverse proxy | Apache httpd → localhost:3000 |
| Process manager | pm2 |
| CI/CD | GitHub Actions → SSH deploy |

### Auth flow
```
User submits login form
  → POST /api/auth/login
    → Admin? bcrypt.compare(password, ADMIN_PASS_HASH from .env)
    → Client? Supabase query → bcrypt.compare(password, pass_hash)
  → setUserSession() sets encrypted cookie
  → window.location.href = /admin  OR  /:slug
    → middleware checks $fetch('/api/auth/session')
    → allow or redirect to /
```

### Two user roles
| Role | Login slug | Lands on | Protected by |
|---|---|---|---|
| Admin | `webim` | `/admin` | `middleware/admin.ts` (checks role === admin) |
| Client | e.g. `dayodental` | `/:slug` | `middleware/auth.ts` (checks session exists) |

---

## Main Files

```
support.widev.pro/
│
├── nuxt.config.ts              # srcDir, ssr:false, postcss, session cookie, runtimeConfig
├── app.vue                     # Root: <NuxtRouteAnnouncer> + <NuxtPage>
├── ecosystem.config.cjs        # pm2 config for production
├── .env                        # Local secrets (never committed)
│
├── pages/
│   ├── index.vue               # Login page
│   ├── admin/index.vue         # Admin dashboard (client management)
│   └── [client]/index.vue      # Client dashboard — tabs: CRO, Site Health, Assets, Reports
│
├── components/ClientDashboard/
│   ├── TabCRO.vue              # Main component — 15-page grid, persona filter, detail panel
│   └── TabPlaceholder.vue      # Coming soon for other tabs
│
├── middleware/
│   ├── auth.ts                 # Redirect to / if no session
│   └── admin.ts                # Redirect to / if role !== admin
│
├── server/
│   ├── api/auth/
│   │   ├── login.post.ts       # Bcrypt + Supabase auth, sets session cookie
│   │   ├── session.get.ts      # Returns session.user or 401
│   │   └── logout.post.ts      # Clears session
│   ├── api/admin/
│   │   └── clients.*           # CRUD stubs (not yet implemented)
│   └── utils/supabase.ts       # Supabase client (service role key)
│
├── stores/auth.ts              # Pinia store (login/logout actions)
│
└── .github/workflows/
    └── deploy.yml              # CI/CD: install → build → SSH deploy to VPS
```

---

## Workflow Mindmap

```
LOCAL DEVELOPMENT
│
├── npm run dev
│     └── http://localhost:3000
│           ├── Login: webim / 87412951  → /admin
│           └── Login: dayodental / dayodental  → /dayodental
│
├── Edit code
│     ├── Pages     → pages/
│     ├── Components → components/
│     ├── API routes → server/api/
│     └── Styles    → assets/css/main.css  (@import "tailwindcss")
│
└── Test login + dashboard works locally
      │
      ▼
GIT COMMIT & PUSH
│
├── git add <files>
├── git commit -m "..."
└── git push origin main
      │
      ▼
GITHUB ACTIONS (.github/workflows/deploy.yml)
│
├── 1. Checkout code
├── 2. Setup Node 24
├── 3. npm install
├── 4. npm run build  (uses secrets for env vars)
└── 5. SSH into 187.124.161.253
      │
      ▼
VPS (Hostinger, AlmaLinux 9)
│
├── cd /var/www/support-portal
├── git pull origin main
├── npm install
├── npm run build  (uses /var/www/support-portal/.env)
└── pm2 startOrRestart ecosystem.config.cjs
      │
      ▼
APACHE (httpd)
│
└── support.widev.pro:443 → ProxyPass → localhost:3000
      │
      ▼
LIVE: https://support.widev.pro
```

---

## Add a New Client

**1. Generate password hash** (run locally):
```bash
node -e "import('bcrypt').then(({default:b})=>b.hash('PASSWORD',12).then(console.log))"
```

**2. Insert into Supabase** (SQL editor at supabase.com):
```sql
INSERT INTO clients (slug, site_name, site_url, pass_hash, active)
VALUES ('clientslug', 'Client Name', 'https://client.com', '$2b$12$...hash...', true);
```

**3. Client logs in** at `https://support.widev.pro` with slug + password → lands on `/:slug`

---

## Useful Commands

### Local development
```bash
npm run dev              # Start dev server → localhost:3000
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Generate a bcrypt hash
```bash
# For admin password (update ADMIN_PASS_HASH in .env)
node -e "import('bcrypt').then(({default:b})=>b.hash('YOUR_PASSWORD',12).then(console.log))"
```

### Git & deploy
```bash
git add -p                        # Interactively stage changes
git push origin main              # Push → triggers GitHub Actions deploy
```

### VPS — connect & manage
```bash
ssh widev                                        # Connect to VPS

# pm2
pm2 list                                         # Show running processes
pm2 logs support-portal                          # Live logs
pm2 restart support-portal                       # Restart app
pm2 startup && pm2 save                          # Auto-start on VPS reboot

# Rebuild manually on VPS
cd /var/www/support-portal
git pull origin main
npm install && npm run build
pm2 restart support-portal
```

### VPS — Apache
```bash
systemctl restart httpd            # Restart Apache
tail -f /var/log/httpd/support.widev.pro-error.log   # Apache error log
```

### VPS — check app is running
```bash
curl http://localhost:3000/api/auth/session      # Should return 401 (not 502)
ss -tlnp | grep 3000                             # Confirm Node listening on 3000
```

### Supabase — useful queries
```sql
-- List all clients
SELECT id, slug, site_name, active, created_at FROM clients;

-- Deactivate a client
UPDATE clients SET active = false WHERE slug = 'clientslug';

-- Reset client password
UPDATE clients SET pass_hash = '$2b$12$...' WHERE slug = 'clientslug';
```

---

## Secrets Reference

| Where | Name | What |
|---|---|---|
| `.env` (local) | `NUXT_SESSION_PASSWORD` | 64-char hex, encrypts session cookies |
| `.env` (local) | `ADMIN_USER` | Admin login slug (`webim`) |
| `.env` (local) | `ADMIN_PASS_HASH` | bcrypt hash of admin password |
| `.env` (local) | `SUPABASE_URL` | Supabase project URL |
| `.env` (local) | `SUPABASE_ANON_KEY` | Public Supabase key |
| `.env` (local) | `SUPABASE_SERVICE_ROLE_KEY` | Private Supabase key (server only) |
| GitHub Secrets | All of the above + `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT` | Used by CI/CD |
| VPS `.env` | Same as local `.env` + `NODE_ENV=production` | `/var/www/support-portal/.env` |
