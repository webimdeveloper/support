# support.widev.pro — Client Support Portal
### AI Agent Technical Task

| | |
|---|---|
| **Project** | widev.pro Support Portal |
| **Domain** | support.widev.pro |
| **Stack** | Nuxt 3, Vue 3, Supabase, shadcn-vue, Tailwind CSS |
| **Auth** | nuxt-auth-utils + Supabase (server-side sessions) |
| **Hosting** | Hostinger VPS + Nginx + PM2 |
| **CI/CD** | GitHub Actions → SSH deploy to Hostinger VPS |
| **Document version** | v1.1 — April 2026 |

---

## 1. Project Overview

A private support portal hosted at `support.widev.pro`. The portal serves two user types: an admin (the agency owner) who manages clients, and clients who log in to view their own read-only dashboard. No public registration exists — all client accounts are created manually by the admin.

This document is a full technical specification for an AI coding agent (Claude Code in VS Code / Cursor). Follow each section in order. Complete one phase fully before proceeding to the next.

---

## 2. Repository & GitHub Setup

### 2.1 Create the repository

Run the following in your terminal to initialise the project and push to GitHub:

```bash
gh repo create widev-support-portal --private --clone
cd widev-support-portal
npx nuxi@latest init . --force
git add . && git commit -m 'chore: initial Nuxt scaffold'
git push -u origin main
```

### 2.2 Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys via GitHub Actions |
| `dev` | Active development branch — merge PRs here first |
| `feature/*` | Individual features, e.g. `feature/auth-flow` |

### 2.3 GitHub Secrets to configure

Go to **GitHub repo → Settings → Secrets and variables → Actions**. Add the following secrets:

| Secret name | Value / source |
|---|---|
| `VPS_HOST` | Your Hostinger VPS IP address |
| `VPS_USER` | Your VPS SSH user (usually `root`) |
| `VPS_SSH_KEY` | Your private SSH key — see Section 9.3 for generation |
| `VPS_PORT` | `22` (default SSH port) |
| `NUXT_SESSION_PASSWORD` | 64-char random hex string (see generation command below) |
| `ADMIN_USER` | Your admin username, e.g. `webim` |
| `ADMIN_PASS_HASH` | bcrypt hash of your admin password (cost 12) |
| `SUPABASE_URL` | From Supabase project → Settings → API |
| `SUPABASE_ANON_KEY` | From Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase project → Settings → API (keep private) |

> **Generate session password:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> **Generate bcrypt hash for admin password:**
> ```bash
> node -e "require('bcrypt').hash('yourpassword', 12).then(console.log)"
> ```

---

## 3. Tech Stack & Dependencies

### 3.1 Install all required packages

Run this after the Nuxt scaffold is created:

```bash
npm install @nuxtjs/tailwindcss @nuxt/ui pinia @pinia/nuxt
npm install nuxt-auth-utils @supabase/supabase-js
npm install bcrypt
npm install -D @types/bcrypt
```

Then initialise shadcn-vue:

```bash
npx shadcn-vue@latest init
```

Add required shadcn-vue components:

```bash
npx shadcn-vue@latest add button input card tabs badge avatar
```

### 3.2 nuxt.config.ts

Configure `nuxt.config.ts` with the following:

```ts
modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', 'nuxt-auth-utils'],

runtimeConfig: {
  adminUser: process.env.ADMIN_USER,
  adminPassHash: process.env.ADMIN_PASS_HASH,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  public: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  }
}
```

---

## 4. Supabase Setup

### 4.1 Create a new Supabase project

Create a new project at [supabase.com](https://supabase.com). Name it `widev-support`. Once ready, go to **SQL Editor** and run the schema below.

### 4.2 Database schema — run in Supabase SQL Editor

```sql
create table clients (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,        -- login identifier, e.g. 'dayodental'
  site_url         text not null,               -- e.g. 'https://dayodental.com'
  site_name        text not null,               -- display name, e.g. 'Dayo Dental'
  pass_hash        text not null,               -- bcrypt hash
  active           boolean default true,
  must_change_pass boolean default true,
  created_at       timestamptz default now()
);

-- RLS: only service role can read/write (admin API uses service key)
alter table clients enable row level security;
create policy "service_role_only" on clients
  using (auth.role() = 'service_role');
```

> ℹ All Supabase queries in server API routes must use the **service role key** — never the anon key — so RLS is bypassed securely on the server side only.

---

## 5. Project File Structure

The AI agent must create the following structure exactly. Do not deviate:

```
support-portal/
├── .github/workflows/deploy.yml
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── logout.post.ts
│   │   └── admin/
│   │       ├── clients.get.ts          ← list all clients
│   │       ├── clients.post.ts         ← create client
│   │       ├── clients/[id].put.ts     ← update client
│   │       └── clients/[id].delete.ts
│   └── utils/
│       └── supabase.ts                 ← server-side supabase client
├── middleware/
│   ├── auth.ts                         ← redirect if no session
│   └── admin.ts                        ← redirect if not admin role
├── pages/
│   ├── index.vue                       ← login page
│   ├── admin/
│   │   └── index.vue                   ← clients list + CRUD
│   └── [client]/
│       └── index.vue                   ← client dashboard
├── components/
│   ├── ClientDashboard/
│   │   ├── Header.vue
│   │   ├── TabCRO.vue                  ← CRO tab (see Section 7)
│   │   └── TabPlaceholder.vue          ← SiteHealth, Assets (future)
│   └── Admin/
│       ├── ClientTable.vue
│       └── ClientFormModal.vue
├── stores/
│   └── auth.ts
├── layouts/
│   ├── default.vue
│   └── dashboard.vue
├── .env.example
└── nuxt.config.ts
```

---

## 6. Auth Flow

### 6.1 Login page — `pages/index.vue`

The login page at `support.widev.pro` is the only public route. All other routes are protected. It must:

- Show a centered card with the widev.pro logo / wordmark
- Have two fields: Slug (site name) and Password
- POST to `/api/auth/login` on submit
- Show a loading state on the button during the request
- On success — redirect to `/admin` (admin) or `/[slug]` (client)
- On failure — show an inline error message below the form (not an alert)

### 6.2 Login API — `server/api/auth/login.post.ts`

The login endpoint must handle both admin and client login from a single form:

- Read `slug` and `password` from request body
- If `slug === ADMIN_USER` env var: compare password to `ADMIN_PASS_HASH` via `bcrypt.compare`
- If slug is not admin: query Supabase `clients` table where slug matches, then `bcrypt.compare`
- On match: call `setUserSession(event, { user: { slug, role } })`
- On failure: throw `createError({ statusCode: 401 })`
- Rate limit this endpoint — max 10 requests per minute per IP

### 6.3 Middleware

**`middleware/auth.ts`**
- Runs on all routes except `/`
- If no session exists, redirect to `/`

**`middleware/admin.ts`**
- Runs only on `/admin/**`
- If `session.user.role !== 'admin'`, redirect to `/`

---

## 7. Client Dashboard

### 7.1 Route — `pages/[client]/index.vue`

After login, the client sees their dashboard at `/dayodental` (their slug). The page must:

- Verify the session slug matches the route param — if not, redirect to `/`
- Fetch client data from Supabase using the slug
- Show the client site name in the header
- Render a tab navigation: **CRO | Site Health | Assets | Reports**
- Only the CRO tab is functional in Phase 1 — others show a "coming soon" placeholder
- Include a logout button top-right that calls `/api/auth/logout`

> ℹ The dashboard is **read-only** in Phase 1. Clients cannot edit any data.

### 7.2 CRO Tab — `components/ClientDashboard/TabCRO.vue`

The CRO tab is the primary deliverable of Phase 1. It must faithfully replicate the design and interactions from the reference file `client_page_example.html`, adapted as a Vue 3 component with the portal's design system.

| Feature | Implementation detail |
|---|---|
| Page cards grid | CSS grid, `auto-fill`, `minmax(195px, 1fr)`, same as reference |
| Card click to expand | Vue reactive `selectedId` ref — selected card gets `info-border` highlight |
| Detail panel | Appears below the grid, same fields: CRO strategy, SEO focus, Keywords, Schema, CTAs |
| Persona filter buttons | All pages / Price-conscious researcher / Trust-seeker / Urgent need |
| Color legend | Top of tab — dot + label pairs matching reference color scheme |
| Tag colors | Match reference exactly: Lead gen `#1D9E75`, Trust `#534AB7`, SEO `#EF9F27`, Urgent `#D85A30`, Support `#185FA5` |
| Dark mode | Full support via CSS variables, matching reference `prefers-color-scheme` logic |
| Smooth scroll | Detail panel `scrollIntoView` on open, same as reference |
| Close detail | Click selected card again or click 'Close detail' button |
| Data source | Phase 1: static JSON prop passed from parent page. Phase 2: from Supabase |
| Mobile responsive | `detail-grid` collapses to 1 column below 580px, same as reference |

> ℹ The page data (`PAGES` array) must be a **prop** so it can later be replaced with a Supabase fetch without changing the component.

### 7.3 Design tokens

Define these CSS variables in the global stylesheet, matching the reference file exactly:

| Variable | Light value | Dark value |
|---|---|---|
| `--bg` | `#ffffff` | `#1c1c1a` |
| `--bg2` | `#f7f7f5` | `#252523` |
| `--bg3` | `#eeede9` | `#2e2e2b` |
| `--text` | `#1a1a18` | `#e8e6de` |
| `--text2` | `#5c5b57` | `#a8a69e` |
| `--text3` | `#9c9a92` | `#6e6c66` |
| `--info-bg` | `#e6f1fb` | `#0c2e52` |
| `--info-border` | `#185FA5` | `#85B7EB` |
| `--info-text` | `#185FA5` | `#85B7EB` |

---

## 8. Admin Panel

### 8.1 `pages/admin/index.vue`

The admin dashboard at `/admin` is only accessible with admin session role. It must include:

- A table listing all clients: Name, Slug, Site URL, Status (active/inactive), Created date, Actions
- An 'Add Client' button that opens a modal form
- Edit and Delete action buttons per row
- A 'Copy credentials' button per row that copies a formatted message to clipboard

### 8.2 Add/Edit Client modal

The modal form must include:

- **Site Name** — text input
- **Slug** — text input, lowercase letters/numbers/hyphens only (validated with regex `/^[a-z0-9-]+$/`)
- **Site URL** — text input with URL validation
- **Password** — text input (shown in plain text for admin convenience), minimum 8 characters
- **Active toggle** — boolean, defaults to true
- On submit: hash the password with bcrypt cost 12 on the server, save to Supabase

### 8.3 Copy credentials button

When the admin clicks 'Copy credentials' for a client, the following text is copied to clipboard:

```
Login: support.widev.pro
Username: [slug]
Password: [shown only if admin just created/reset it, otherwise hidden]
```

> ℹ The password is never stored in plain text. The Copy credentials button only works immediately after account creation when the plain password is still in component state. After page refresh it shows only the slug.

---

## 9. GitHub Actions — CI/CD

### 9.1 Deploy workflow — `.github/workflows/deploy.yml`

```yaml
name: Deploy to Hostinger VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NUXT_SESSION_PASSWORD: ${{ secrets.NUXT_SESSION_PASSWORD }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ADMIN_USER: ${{ secrets.ADMIN_USER }}
          ADMIN_PASS_HASH: ${{ secrets.ADMIN_PASS_HASH }}

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /var/www/support-portal
            git pull origin main
            npm ci --omit=dev
            npm run build
            pm2 restart support-portal || pm2 start .output/server/index.mjs --name support-portal
```

> ℹ All env vars must be passed at build time so Nuxt `runtimeConfig` is populated correctly. The same vars must also be present in the `.env` file on the VPS for runtime.

### 9.2 VPS first-time setup — run once via SSH

SSH into your Hostinger VPS and run:

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create app directory and clone repo
mkdir -p /var/www/support-portal
git clone git@github.com:yourusername/widev-support-portal.git /var/www/support-portal

# Create .env on the server with all required vars
nano /var/www/support-portal/.env

# Build and start
cd /var/www/support-portal && npm ci && npm run build
pm2 start .output/server/index.mjs --name support-portal
pm2 startup
pm2 save
```

### 9.3 SSH key setup for GitHub Actions

Run this **locally** (not on the server):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key
```

Copy the public key to the VPS:

```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub root@YOUR_VPS_IP
```

Add the private key to GitHub Secrets as `VPS_SSH_KEY`:

```bash
cat ~/.ssh/deploy_key   # copy this output into the GitHub Secret
```

### 9.4 Nginx configuration

Create `/etc/nginx/sites-available/support-portal`:

```nginx
server {
    listen 80;
    server_name support.widev.pro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the config and reload Nginx:

```bash
ln -s /etc/nginx/sites-available/support-portal /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 9.5 HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d support.widev.pro
```

Certbot auto-renews. No further config needed.

### 9.6 DNS setup in Hostinger

In your Hostinger DNS panel, add an **A record**:

| Type | Name | Value |
|---|---|---|
| A | `support` | Your VPS IP address |

Allow up to 24h for propagation. Verify with:

```bash
dig support.widev.pro
```

### 9.7 Test the deploy pipeline

After pushing the workflow file, verify each step:

- Go to **GitHub → Actions tab** — the workflow must show green
- SSH into VPS and run `pm2 list` — `support-portal` must show `online`
- Visit `http://support.widev.pro` — must redirect to `https://`
- Confirm the login page loads correctly at `https://support.widev.pro`

---

## 10. Environment Files

### 10.1 `.env.example` — commit this file

```bash
NUXT_SESSION_PASSWORD=
ADMIN_USER=
ADMIN_PASS_HASH=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 10.2 `.env` — never commit, add to `.gitignore`

Create `.env` locally and on the VPS with real values. Ensure `.gitignore` includes:

```
.env
.env.local
.env.*.local
```

---

## 11. Phase Roadmap

Build in this exact order. Do not skip phases.

| Phase | Scope | Done when |
|---|---|---|
| **1 — Foundation** | Repo, CI/CD, deploy pipeline | Green GitHub Action, app loads on VPS URL |
| **2 — Auth** | Login page, session, middleware, logout | Admin and client can log in, routes protected |
| **3 — Admin** | Client CRUD, Supabase, copy credentials | Admin can create/edit/delete clients |
| **4 — Dashboard** | Client page, tab shell, CRO tab | Client sees read-only CRO tab after login |
| **5 — DNS & HTTPS** | Custom domain, Nginx, Let's Encrypt, final checks | `support.widev.pro` live, HTTPS enforced |

---

## 12. Security Checklist

Before going live, verify all of these:

| Check | How to verify |
|---|---|
| Passwords hashed with bcrypt cost 12 | Check Supabase DB — `pass_hash` starts with `$2b$12$` |
| No plain passwords in logs or responses | Check server logs after login attempt |
| Session cookie is httpOnly and secure | Inspect browser DevTools → Application → Cookies |
| Admin routes return 403 for client sessions | Log in as client, manually visit `/admin` — must redirect |
| Client cannot view another client's page | Log in as `clientA`, visit `/clientB` — must redirect |
| Rate limiting active on `/api/auth/login` | 10+ rapid requests should return 429 |
| `SUPABASE_SERVICE_ROLE_KEY` never in public runtimeConfig | Check `nuxt.config.ts` — must be in private config only |
| HTTPS enforced on production domain | Visit `http://support.widev.pro` — must redirect to `https` |
| `.env` not committed to repository | Run: `git log --all -- .env` — must return nothing |
| PM2 restarts on VPS reboot | Run `sudo reboot`, SSH back in, check `pm2 list` |

---

## 13. Cursor / Claude Code Agent Instructions

When using this document with Claude Code in VS Code or Cursor, follow these rules:

- Feed this document as the system context at the start of each session
- Work through phases sequentially — reference the phase number when prompting
- After each file is created, ask the agent to verify it matches this spec
- Never ask the agent to do two phases at once
- If the agent generates code that differs from this spec, correct it and explain which section applies

**Recommended prompt to start each session:**

> I am building the widev.pro support portal as described in the technical task document. We are currently on **Phase [X]**. Here is what was completed last session: [summary]. The next task is: [specific task from spec].

---

*— End of Technical Task v1.1 —*
