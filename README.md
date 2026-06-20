# Lakonos homepage — drop-in update

Extract this folder **into your repo root** (`C:\Users\Rudi\Desktop\lakonos`) and let it
overwrite. All paths already match the repo layout.

## Files in this package

| File | Target path | New/Replace |
|------|-------------|-------------|
| app/page.tsx | app/page.tsx | replace |
| app/layout.tsx | app/layout.tsx | replace |
| app/sitemap.ts | app/sitemap.ts | new |
| app/robots.ts | app/robots.ts | new |
| app/opengraph-image.tsx | app/opengraph-image.tsx | new |
| app/api/lead/route.ts | app/api/lead/route.ts | replace |
| components/LeadForm.tsx | components/LeadForm.tsx | replace |
| components/ShaderField.tsx | components/ShaderField.tsx | new (WebGL hero) |
| components/Interactions.tsx | components/Interactions.tsx | new (tilt/magnetic/cursor) |
| components/Intro.tsx | components/Intro.tsx | new (cinematic intro) |
| lib/notify.ts | lib/notify.ts | replace |

## 1. Required manual edit — app/globals.css

NOT included here (so it can't clobber your version). In `app/globals.css`, inside `:root`,
replace these three lines:

```css
  --display:'Archivo', system-ui, -apple-system, sans-serif;
  --body:'Inter', system-ui, -apple-system, sans-serif;
  --mono:'Space Mono', ui-monospace, monospace;
```

with:

```css
  --display: var(--font-archivo), 'Archivo', system-ui, -apple-system, sans-serif;
  --body: var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif;
  --mono: var(--font-mono), 'Space Mono', ui-monospace, monospace;
```

(These three lines are identical in every version, so this is safe. Without it, /admin + the
case study fall back to system fonts.)

## 2. Install dependencies

```powershell
npm install lenis @vercel/analytics @vercel/speed-insights
```

(next/font, resend, and supabase are already in your project.)

## 3. Database — already applied

The `lakonos_leads` table already has the attribution columns
(`utm_source, utm_medium, utm_campaign, referrer, landing_path`) — no action needed.

## 4. Optional env (Vercel) to enable email

| Variable | Effect |
|----------|--------|
| RESEND_API_KEY | Owner alert + lead auto-reply |
| LAKONOS_ALERT_EMAIL | Where lead alerts go (falls back to LAKONOS_OWNER_EMAIL) |
| LAKONOS_AUTOREPLY_FROM | e.g. `Lakonos <hello@lakonos.com>` — set only with a verified domain |

## 5. Deploy

```powershell
cd C:\Users\Rudi\Desktop\lakonos
git add -A
git commit -m "Homepage: shader hero, intro reveal, interactions, lead pipeline, fonts, logo"
git push
```

## What's included visually
- Live WebGL shader hero (mouse-reactive, progressive fallback)
- Cinematic one-time intro reveal (real lambda mark draws itself, then LΛKONOS)
- Interactive depth layer (3D tilt cards, magnetic buttons, cursor glow) — desktop only
- Sora (headlines) + Hanken Grotesk (body), self-hosted via next/font
- Real Lakonos lambda logo (gradient) in intro, nav, footer, favicon
- Lead pipeline: UTM capture, honeypot + time-trap anti-spam, auto-reply
- Vercel Analytics + Speed Insights + conversion events
- SEO: OG image, sitemap, robots; perf (content-visibility) + a11y (skip link, contrast)

Mobile and /admin are unaffected by the desktop-only effects.
