# Support Portal Testing Guide

## Phase 1: Setup Supabase Database

### Step 1: Create the `clients` Table

Open your Supabase dashboard → **SQL Editor** → Click **+** to create new query

**Paste this ONE statement at a time:**

#### Query 1 - Create table:
```sql
create table clients (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  site_url         text not null,
  site_name        text not null,
  pass_hash        text not null,
  active           boolean default true,
  must_change_pass boolean default true,
  created_at       timestamptz default now()
);
```
✅ Click **Run** and wait for confirmation

#### Query 2 - Enable RLS:
```sql
alter table clients enable row level security;
```
✅ Click **Run**

#### Query 3 - Create policy:
```sql
create policy "service_role_only" on clients
  using (auth.role() = 'service_role');
```
✅ Click **Run**

---

## Phase 2: Add Test Data

### Create a Test Client

In SQL Editor, run:

```sql
INSERT INTO clients (slug, site_name, site_url, pass_hash, active)
VALUES (
  'testclient',
  'Test Client Demo',
  'https://testclient.example.com',
  '$2b$12$M64RXJ2JFDUoPI0dRnh7IuoHJaY6dBC6fMrXPJDZrw7cEPadmfzqe',
  true
);
```

This creates a client that can login with:
- **Slug**: `testclient`
- **Password**: `password123`

✅ Verify it was created: Go to **Table Editor** → `clients` → You should see the row

---

## Phase 3: Start the Dev Server

In your terminal:

```bash
npm run dev
```

You should see:
```
➜ Local:    http://localhost:3000/
```

✅ The server is now running

---

## Phase 4: Test Login Page

### Test 1: Admin Login

1. Open http://localhost:3000 in your browser
2. You should see a centered login form
3. Enter:
   - **Site Name / Username**: `webim`
   - **Password**: `password123`
4. Click **Sign In**

**Expected result**: You should be redirected to `/admin` dashboard

✅ If you see the admin table, login works!

### Test 2: Client Login

1. Go back to http://localhost:3000
2. Enter:
   - **Site Name / Username**: `testclient`
   - **Password**: `password123`
3. Click **Sign In**

**Expected result**: You should be redirected to `/testclient` (client dashboard)

✅ If you see the client dashboard with tabs, it works!

### Test 3: Invalid Credentials

1. Go back to http://localhost:3000
2. Enter:
   - **Site Name / Username**: `webim`
   - **Password**: `wrongpassword`
3. Click **Sign In**

**Expected result**: You should see an error message below the form

✅ Error handling works!

---

## Phase 5: Test Client Dashboard

### Navigate to Client Dashboard

If logged in as `testclient`:

- ✅ You should see "Test Client Demo" in the header
- ✅ Four tabs: CRO | Site Health | Assets | Reports
- ✅ CRO tab shows a grid of "page cards"
- ✅ You can click cards to expand details
- ✅ Persona filter buttons work

### Test Logout

Click the red **Logout** button in the top right

**Expected result**: You're redirected back to login page

✅ Logout works!

---

## Phase 6: Test Admin Dashboard

### Navigate to Admin Dashboard

If logged in as `webim`:

- ✅ You should see "Admin Dashboard"
- ✅ There's an "Add Client" button
- ✅ A table showing all clients (should show "Test Client Demo")
- ✅ Edit/Delete/Copy credentials buttons per row

---

## Troubleshooting

### Issue: "This site can't be reached"
- Make sure dev server is running: `npm run dev`
- Check that it says `Local: http://localhost:3000/`

### Issue: Login doesn't work
1. Check `.env` file has Supabase credentials:
   ```bash
   cat .env | grep SUPABASE
   ```
2. Check Supabase `clients` table exists:
   - Go to Table Editor in Supabase → Should see `clients` table
3. Check test data was inserted:
   - Run in SQL Editor: `SELECT * FROM clients;`
   - Should return the test client row

### Issue: Build fails
```bash
npm run build
```
Should complete with `✨ Build complete!`

If it fails, try:
```bash
rm -rf .nuxt node_modules package-lock.json
npm install
npm run build
```

---

## Next Steps

Once testing is complete:

1. ✅ Configure GitHub Secrets for CI/CD
2. ✅ Set up Hostinger VPS
3. ✅ Deploy to production

---

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server on http://localhost:3000

# Build
npm run build              # Build for production

# Preview production build
npm run preview

# Generate static site
npm run generate
```

---

**Login Test Credentials:**

| Role | Username | Password |
|------|----------|----------|
| Admin | `webim` | `password123` |
| Client | `testclient` | `password123` |
