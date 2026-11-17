# BASYA ENGLISH OLYMPIA

**Learn. Practise. Compete.**
*An English Learning Platform by Ma'am Basya.*

An English proficiency (CEFR A1–B2) and English Olympiad preparation platform for Indonesian SMP and SMA students.

Built with Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Row Level Security) · Zod · React Hook Form · Recharts · SheetJS.

---

## What works today (Phase 1 MVP + parts of Phases 2–4)

| Area | Features |
|---|---|
| **Public** | Landing page, registration (always as a student), sign-in, email-confirmation callback |
| **Student** | Dashboard (CEFR level, XP, streak, badges, accuracy, CEFR pathway, recommendations from the student's own data, recent results) · Learning programs (A1–B2 by skill, SMP/SMA Olympiad tracks) · Practice mode with instant feedback · Exam mode with timer and submit confirmation · Placement test that sets the CEFR level · Results with full answer review and distractor analysis · Progress analytics (charts) · History · Profile and joining a class with a code |
| **Super Admin** | Overview built from live counts · Question bank: search, filter, sort, paging, create, edit, publish/unpublish, delete · Excel/CSV import with column validation, preview, per-row errors, confirm, results · Excel export · Users: change roles · Classes: create with a join code and assign a teacher |
| **Teacher** | Dashboard of their own classes and students only (CEFR level, quizzes, average, XP, streak, last activity) |
| **Gamification** | XP for correct answers, completion and passing · daily streak (Jakarta time) · 6 badges awarded automatically |

**Not built yet (next phases):** admin editing of assessment packages, teacher-created assignments, weekly challenges, announcements UI, admin per-question analytics. The database tables for packages, assignments and announcements already exist.

---

## How security works (in plain language)

- **The database guards itself.** Every table has *Row Level Security* rules. Even if someone opened the browser console, the database refuses to give them data they aren't allowed to see.
- **Answer keys never reach students early.** Students can't read the questions table at all. They get questions through special database functions (`get_attempt`, `answer_question`, `submit_attempt`). These functions:
  - send question text and shuffled options with **no** correct-answer flag,
  - in **practice mode**, reveal the answer and explanation only after the student answers (and lock that answer),
  - in **exam mode**, reveal nothing until the quiz is submitted,
  - do all the **scoring on the server**, so scores can't be faked.
- **Roles can't be self-assigned.** Every new account is a student. Students can't edit their own role, XP, streak or CEFR level. Only the Super Admin can change roles.
- **Teachers see only their classes.** Teachers can only read students enrolled in classes assigned to them.
- **No secret keys in the website.** The website only uses the public *anon* key. The *service-role* key is never used by the app.

All of this is checked by an automated test suite (`npm run test:db`, 39 checks).

---

## Project structure

```
basya-english-olympia/
├── content/starter-questions.mjs        # 40 original starter questions (single source)
├── public/templates/                    # Import template + starter set as CSV (generated)
├── scripts/
│   ├── build-starter-content.mjs        # Generates seed.sql + CSV templates from content/
│   ├── test-db.mjs                      # 39 security & logic tests against local Supabase
│   ├── e2e-student.mjs                  # Browser test: register → placement → practice → profile
│   └── e2e-admin.mjs                    # Browser test: question CRUD → import → export → classes → teacher
├── supabase/
│   ├── migrations/
│   │   ├── …_core_schema.sql            # Tables, enums, reference data, RLS policies
│   │   └── …_quiz_engine.sql            # Secure quiz functions, scoring, XP, badges, analytics
│   ├── seed.sql                         # Starter questions for LOCAL development (generated)
│   ├── bootstrap-admin.sql              # One-time: make Ma'am Basya the Super Admin
│   └── config.toml                      # Local Supabase settings
└── src/
    ├── middleware.ts                    # Refreshes sessions, protects /student /teacher /admin
    ├── app/
    │   ├── page.tsx                     # Landing page
    │   ├── (auth)/login, register       # Auth pages + server actions
    │   ├── dashboard/                   # Sends each user to their role's home
    │   ├── student/                     # Dashboard, learn, assessments, quiz, results, progress, history, profile
    │   ├── teacher/                     # Teacher dashboard
    │   └── admin/                       # Overview, questions (CRUD, import/export), users & classes
    ├── components/
    │   ├── ui/                          # Design system: Button, Card, Badge, Field, Toast, StatCard…
    │   ├── brand/logo.tsx               # BEO monogram
    │   ├── charts.tsx                   # Recharts wrappers
    │   └── student/                     # CEFR pathway, quiz launcher, skill cards
    └── lib/                             # Supabase clients, auth guards, validation (Zod), import/export logic
```

## Database tables

`roles`, `profiles`, `classes`, `enrollments`, `question_categories`, `questions`, `question_options`, `question_tags`, `quiz_packages`, `quiz_questions`, `assignments`, `quiz_attempts`, `attempt_questions` (each student's shuffled order), `student_answers`, `achievements`, `student_achievements`, `xp_transactions`, `announcements`.

## Design system

| Token | Value | Used for |
|---|---|---|
| `ink` (Deep Purple) | `#28204F` | Headings, sidebar, hero backgrounds |
| `brand` (Primary Purple) | `#7957E8` | Buttons, links, active states, charts |
| `lavender` | `#EDE7FF` | Tints, icon tiles, progress tracks |
| `gold` (Champagne Gold) | `#E5C779` | Achievements, highlights, key calls to action |
| White | `#FFFFFF` | Cards |

Typography: **Fraunces** (elegant serif for headings) + **Plus Jakarta Sans** (clean sans-serif for body text; designed in Indonesia). Cards use 20px rounded corners and soft purple-tinted shadows. Tokens live in `src/app/globals.css`.

---

## Running it

### A. Publish it (Supabase + Vercel) — see **DEPLOY.md** for the beginner guide

1. Create a free project at [supabase.com](https://supabase.com) (region: Singapore is closest to Indonesia).
2. Apply the database schema (choose one):
   - **Supabase CLI:** `npx supabase link --project-ref YOUR-REF` then `npx supabase db push`
   - **Dashboard:** open *SQL Editor* and run the two files in `supabase/migrations/` in order.
3. Load questions: sign in as admin (step 5), then go to **Import / Export** and upload `public/templates/beo-starter-questions.csv`, or your own question bank.
4. Copy `.env.example` to `.env.local` and paste your project's URL and **anon** key (*Project Settings → API*).
5. Register on the website with Ma'am Basya's email, then run `supabase/bootstrap-admin.sql` in the SQL Editor (edit the email first).
6. In *Authentication → URL Configuration*, set the Site URL to your website address so email-confirmation links work.

### B. Local development (no cloud account needed; needs Docker)

```bash
npm install
npx supabase start          # starts Postgres + Auth locally, applies migrations + seed
cp .env.example .env.local  # then paste the local URL + anon key printed by `npx supabase status`
npm run dev                 # http://localhost:3000
```

### Tests

```bash
npm run test:db     # resets the LOCAL database, then runs 39 security/logic checks
npm run test:e2e    # browser tests (needs `npm run dev` running and Playwright installed)
```

### Updating the starter questions

Edit `content/starter-questions.mjs`, then run `npm run content:build` to regenerate `supabase/seed.sql` and the CSV files.

---

## Known limitations / notes

- **SheetJS version:** the npm registry only has `xlsx@0.18.5`, which has known advisories (prototype pollution and ReDoS when parsing untrusted files). Only the Super Admin can upload files, and parsing happens in her own browser, so the risk is low. Before production, install the patched version from SheetJS's CDN: `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.
- Deleting a question also removes students' saved answers to it. Their stored scores stay the same. Unpublishing is usually the better choice.
- The bulk import is all-or-nothing on the server: if any row fails there, nothing from that batch is saved.
