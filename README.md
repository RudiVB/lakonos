# Lakonos

Marketing site + lead capture for **Lakonos** — custom business automation for South African manufacturers.

**Stack:** Next.js 14 (App Router) · TypeScript · Supabase (Postgres) · deployed on Vercel.

---

## What's inside

```
lakonos/
├─ app/
│  ├─ layout.tsx          # metadata, fonts, favicon
│  ├─ page.tsx            # the landing page
│  ├─ globals.css         # full design system (Spartan: stone / bronze / crimson)
│  └─ api/lead/route.ts   # POST endpoint — saves a lead to Supabase
├─ components/
│  └─ LeadForm.tsx        # the contact form (client component)
├─ lib/
│  └─ supabaseServer.ts   # server-only Supabase client (service role)
├─ supabase/
│  └─ migrations/0001_init.sql   # the leads table + RLS
└─ .env.example
```

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local      # then fill in your Supabase values
npm run dev                      # http://localhost:3000
```

## 2. Set up Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor** and run the contents of `supabase/migrations/0001_init.sql`.
3. Go to **Settings → API** and copy these into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role secret>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

> The **service role key is server-only**. It's used by `app/api/lead/route.ts` to insert leads. Never expose it to the browser or commit it.

Leads land in the **`leads`** table. View/sort them in the Supabase Table Editor.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Lakonos: initial site + lead capture"
git branch -M main
# create an empty repo at github.com/new (name it 'lakonos'), then:
git remote add origin https://github.com/RudiVB/lakonos.git
git push -u origin main
```

## 4. Deploy to Vercel

1. vercel.com → **Add New → Project** → import the `lakonos` repo.
2. Framework preset auto-detects **Next.js** — no config needed.
3. Add the same three env vars under **Settings → Environment Variables**.
4. Deploy. Then point `lakonos.com` / `lakonos.co.za` at it in **Settings → Domains**.

---

## Notes

- The contact form posts to `/api/lead`; on success it shows a confirmation and the lead is stored.
- The old 3PL and the manufacturer are intentionally **not named** in the copy.
- All brand colours/type live in `app/globals.css` (`:root`).
- Logo assets (SVG): wordmark, icon, favicon — keep them in `/public` if you want to reference them as files.
