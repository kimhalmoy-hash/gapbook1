# Deploy WeekSlot (production)

WeekSlot is a Next.js app + PostgreSQL. Job money stays **off-platform** (no Stripe, no deposit). WeekSlot bills the business a **5% success fee after the fact** (0% on the first two bookings). Locked terms: [`vilkaar.md`](vilkaar.md).

Recommended pairing: **Vercel** (app) + **Neon** (Postgres). Supabase works the same way if you prefer it.

Closest EU pairing: Neon **Frankfurt (`eu-central-1`)** and Vercel **Frankfurt (`fra1`)** — already set in `vercel.json`.

---

## What you must create / paste (manual)

| Item | Where | What to do |
| --- | --- | --- |
| GitHub repo | Already `kimhalmoy-hash/gapbook1` | Vercel will ask to connect GitHub |
| Neon (or Supabase) project | Browser account signup | Create a Postgres database |
| `DATABASE_URL` | Neon **pooled** / Supabase **transaction pooler** | Paste into Vercel → Environment Variables |
| `DIRECT_URL` | Neon **direct** (no `-pooler`) / Supabase port **5432** | Paste into Vercel (skip if Neon’s Vercel integration set `DATABASE_URL_UNPOOLED`) |
| `AUTH_SECRET` | Generate locally | `openssl rand -base64 32` → paste into Vercel |
| Vercel project | Import this GitHub repo | First production deploy |

Do **not** add `STRIPE_*` keys.

---

## A. Neon Postgres (recommended)

1. Open [https://console.neon.tech](https://console.neon.tech) and sign in (GitHub is fine).
2. **New project**
   - Name: `gapbook`
   - Postgres version: default (16+)
   - Region: **AWS Frankfurt (eu-central-1)** (or another EU region)
   - Create project
3. Open **Connect** (dashboard) and copy **two** URIs:
   - **Pooled** — hostname contains `-pooler` → this is `DATABASE_URL`
   - **Direct** — hostname does **not** contain `-pooler` → this is `DIRECT_URL`
4. Append query params if they are missing:
   - Pooled: `?sslmode=require&pgbouncer=true`
   - Direct: `?sslmode=require`

Prisma **migrate** cannot run through the pooler. That is why `DIRECT_URL` exists (`prisma/schema.prisma` `directUrl`).

### Optional: Neon ↔ Vercel integration (fewer pastes)

1. In Neon: **Integrations → Vercel → Add to Vercel**
2. Select the WeekSlot Vercel project and the `gapbook` Neon DB
3. Enable preview branches if offered (each PR gets its own DB — safer than migrating Production from Preview)
4. Neon injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct)
5. The Vercel build script copies `DATABASE_URL_UNPOOLED` → `DIRECT_URL` when `DIRECT_URL` is unset
6. You still must set **`AUTH_SECRET` yourself** in Vercel

---

## B. Supabase Postgres (alternative)

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a project (`gapbook`, EU region, strong DB password — save it).
2. **Project Settings → Database → Connection string**
   - **URI** method
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`  
     Add `?sslmode=require&pgbouncer=true` if missing
   - **Direct** (port `5432`) → `DIRECT_URL`  
     Add `?sslmode=require` if missing
3. Replace `[YOUR-PASSWORD]` in both URIs.

---

## C. Vercel project

1. Open [https://vercel.com](https://vercel.com) and **Continue with GitHub**.
2. Authorize the `kimhalmoy-hash` GitHub account if asked.
3. **Add New… → Project** → import **`gapbook1`**.
4. Framework: **Next.js** (auto-detected). Leave Root Directory `.`
5. **Environment variables** (Production; add Preview too if you use a separate DB):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Pooled URI from A or B |
   | `DIRECT_URL` | Direct URI from A or B (optional if `DATABASE_URL_UNPOOLED` is already set) |
   | `AUTH_SECRET` | Output of `openssl rand -base64 32` |

6. Build Command is already `npm run vercel-build` via `vercel.json` (`prisma generate` → `prisma migrate deploy` → `next build`). Do not switch it back to plain `next build`.
7. **Deploy**. The first Production deploy applies `prisma/migrations` to the empty database.

### After the deploy

1. Open `https://<your-app>.vercel.app/api/health`  
   Expect: `{"ok":true,"db":"up"}`  
   `{"ok":false,"db":"down"}` with HTTP 503 means `DATABASE_URL` cannot be reached (wrong URI, missing `sslmode`, or IP restrictions).
2. Open `/` — landing is Norwegian by default; **nb / sv / en** switches landing copy only.
3. Optional demo data (**wipes all rows**): from your laptop, with Production URLs in the shell:

   ```bash
   export DATABASE_URL='postgresql://...pooled...'
   export DIRECT_URL='postgresql://...direct...'
   npm run db:seed
   ```

   Demo password is `demo1234` (see README). Skip seed on a real production database.

### Preview deployments

`prisma migrate deploy` runs on **every** Vercel build, including Preview.

- **Good:** Neon Vercel integration with a database branch per Preview.
- **Risky:** one Production database URL on Preview — a PR migration would change Production before merge.
- **Safer MVP:** in Vercel → Settings → Git, disable Preview deployments until you have a Preview database.

---

## Local check that migrate works

```bash
cp .env.example .env
# set AUTH_SECRET; DATABASE_URL + DIRECT_URL already match docker-compose
docker compose up -d
npx prisma migrate deploy
npm run db:seed
npm run dev
curl -s localhost:3000/api/health
```

`migrate deploy` is the production command (applies committed SQL only). Use `npm run db:migrate:dev` only when **creating** a new migration locally.

---

## Not in this deploy

- Stripe / card checkout / customer deposits
- Real e-mail provider (booking confirmation is a log stub)
- Custom domain (add later in Vercel → Settings → Domains)
