# Publishing Basya English Olympia — step by step

Three free services work together:

| Service | Job |
|---|---|
| **GitHub** | Keeps the code safe |
| **Supabase** | Database + student logins |
| **Vercel** | Runs the website and gives it a public link |

Allow about 30 minutes in total. Do the steps in order.

---

## Step 1 — GitHub (stores the code)

1. Sign up or sign in at **github.com**.
2. Click **+** (top right) → **New repository**.
   - Name: `basya-english-olympia`
   - Choose **Private**.
   - Do **not** tick "Add a README" (the repository must be empty).
   - Click **Create repository**.
3. Connect GitHub to Claude: open **https://claude.ai/connect-github** and allow access to this repository.
4. Tell Claude the repository name (for example `your-username/basya-english-olympia`). Claude uploads the code.

## Step 2 — Supabase (database)

1. Sign up at **supabase.com** → **New project**.
   - Name: `basya-english-olympia`
   - Database password: create a strong one and keep it in a safe place. Claude never needs it.
   - Region: **Southeast Asia (Singapore)**.
2. Wait about 2 minutes for the project to be ready.
3. Left menu → **SQL Editor** → **New query**. Paste the **whole** contents of `supabase/production-setup.sql` and click **Run**. You should see "Success. No rows returned".
4. Optional, for the 40 starter questions: open another new query, paste the contents of `supabase/seed.sql`, and click **Run**. Skip this if you'd rather import your own questions later.
5. Left menu → **Project Settings → API**. Copy these two values for Step 3:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long text starting with `eyJ…`, or `sb_publishable_…`)

   ⚠️ Never share the **service_role** / **secret** key with anyone.

## Step 3 — Vercel (the public website)

1. Sign up at **vercel.com** with **"Continue with GitHub"**.
2. **Add New… → Project** → choose `basya-english-olympia` → **Import**.
3. Open **Environment Variables** and add both of these:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

4. Click **Deploy**. After about 2 minutes you get a link like `https://basya-english-olympia.vercel.app`. 🎉

## Step 4 — Connect the link back to Supabase

1. Supabase → **Authentication → URL Configuration**:
   - **Site URL:** your Vercel link
   - **Redirect URLs:** add `https://YOUR-LINK.vercel.app/**`
2. Click **Save**. This makes the "confirm your email" links open your website.

## Step 5 — Make yourself Super Admin

1. Open your website and **register** with your own email, then confirm the email.
2. Supabase → **SQL Editor**: paste `supabase/bootstrap-admin.sql`, change the email inside it to yours, and click **Run**.
3. Sign out and sign in again. You now see the Admin dashboard.

## Before inviting many students

- **Confirmation emails:** Supabase's built-in email service only sends a few emails per hour, which is fine for testing. Before a whole class registers, either connect a free email service (Supabase → Authentication → Emails → SMTP settings, e.g. Resend or Brevo), or turn off "Confirm email" (Authentication → Sign In / Providers → Email).
- **Excel library update:** Claude will install the patched SheetJS version (see README).
- **Custom domain (optional):** in Vercel → Project → Settings → Domains you can add e.g. `beo.yourschool.sch.id`.

After this, every code change Claude uploads to GitHub appears on the website automatically within a few minutes.
