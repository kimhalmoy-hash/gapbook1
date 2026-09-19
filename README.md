# WeekSlot

WeekSlot sells trades’ calendar gaps — open time at a better price, before it loses value.

Nordic marketplace for leftover tradesperson capacity — hours (min 3), days, or one week — at a **visible price**, often below usual rates. Not bidding.

P0 markets: **Oslo (NO)** and **Stockholm (SE)**. Trades: painting/wallpaper, electrician, plumber, carpenter, tile/masonry, roofing.

Job money is paid **directly** between customer and business. WeekSlot does not take a deposit and does not use Stripe for the job. WeekSlot bills the business a **success fee** after the fact (0% on the first two bookings, then 5%). Invoice UI is a stub.

Locked product terms: [`docs/vilkaar.md`](docs/vilkaar.md).

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL via Prisma
- Cookie session auth (e-post + passord)

## Setup

**Requirements:** Node 20+ and PostgreSQL 16.

### 1. Database

Docker:

```bash
docker compose up -d
```

Or local Postgres, then create a database:

```bash
createdb gapbook
# or:
psql -c "CREATE USER gapbook WITH PASSWORD 'gapbook' SUPERUSER;"
psql -c "CREATE DATABASE gapbook OWNER gapbook;"
```

### 2. App

```bash
cp .env.example .env
# set a long AUTH_SECRET (openssl rand -base64 32)
# local Docker: keep DATABASE_URL and DIRECT_URL as they are (same URI)
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health: [http://localhost:3000/api/health](http://localhost:3000/api/health) → `{"ok":true,"db":"up"}`.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (no migrate — for local compile) |
| `npm run vercel-build` | `prisma generate` + `prisma migrate deploy` + `next build` (what Vercel runs) |
| `npm test` | Slot window, success-fee, and landing-copy unit tests |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate deploy`) |
| `npm run db:migrate:dev` | Create a new migration locally |
| `npm run db:seed` | Replace data with the minimal demo set (**deletes all rows**) |
| `npm run db:studio` | Prisma Studio |

## Deploy (production)

Exact click-through: **[`docs/deploy.md`](docs/deploy.md)**.

Short version:

1. Create a **Neon** (or Supabase) Postgres project in the EU.
2. Copy **pooled** URI → `DATABASE_URL` and **direct** URI → `DIRECT_URL`.
3. Import this repo in **Vercel**. Set `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`.
4. Deploy. `vercel.json` runs `prisma migrate deploy` during the build.
5. Check `https://<app>.vercel.app/api/health`.

`prisma` is a runtime dependency so `migrate deploy` works on Vercel. Local Docker can use the same string for `DATABASE_URL` and `DIRECT_URL`; managed poolers cannot.

## Environment variables

See [`.env.example`](.env.example). Required:

| Variable | Local | Production |
| --- | --- | --- |
| `DATABASE_URL` | Docker URI in `.env.example` | Pooled URI (`-pooler` / Supabase port 6543) with `sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | Same as `DATABASE_URL` | Unpooled URI (Neon without `-pooler`, or `DATABASE_URL_UNPOOLED`; Supabase port 5432) |
| `AUTH_SECRET` | Random string | New random string (`openssl rand -base64 32`) |

No Stripe keys. Do not put secrets in git.

## Demo accounts

Password for all: `demo1234`

| Role | E-post | Notes |
| --- | --- | --- |
| Admin | `admin@gapbook.no` | Approve businesses |
| Customer | `kunde@demo.gapbook.no` | Search + book |
| Painter (Oslo, approved) | `maler@demo.gapbook.no` | Slot CRUD |
| Electrician (Stockholm, approved) | `elektriker@demo.gapbook.se` | Two launch bookings already (next fee is 5%) |
| Plumber (Oslo, approved) | `rorlegger@demo.gapbook.no` | Open hours slot |
| Roofer (Oslo, **not** approved) | `tak@demo.gapbook.no` | Hidden until admin approval |

## P0 flows

1. **Landing** — Norwegian default hero (*Se ledige timer og uker nær deg*) and CTAs: *Se ledig tid* / *Selg ledig tid*. Badge: *Ledige timer & uker — ofte under ordinær pris*. Switcher **nb / sv / en** changes landing strings only.
2. **Business profile** — country, city, trade(s), org.nr; public only after admin approval
3. **Publish slots** — trade, geography, start/end, unit hours(≥3)/day/week, visible price, «passer til»
4. **Customer search** — place + period + trade
5. **Booking** — digital agreement checkbox + timestamp, e-mail confirmation stub, no deposit
6. **Success fee ledger** — count bookings per business (`/bedrift/bookinger`); invoice generation is stubbed
