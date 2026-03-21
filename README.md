# Rationality

> A private thinking partner that challenges your investment thesis before you commit.

## What it does

- **Decision Journal** — log your thesis, key assumptions, and pre-mortem at the moment of entry
- **Thesis Challenger** — AI devil's advocate that surfaces your weakest assumptions and the arguments you haven't considered

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | Neon (Postgres, serverless) |
| ORM | Drizzle |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Hosting | Vercel |
| CI | GitHub Actions |

## Local dev setup

### 1. Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) project (free tier works)
- A [Clerk](https://clerk.com) application (free tier works)
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install

```bash
git clone https://github.com/YOUR_ORG/rationality
cd rationality
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/decisions/new

DATABASE_URL=postgresql://...

ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run database migrations

```bash
npm run db:push
```

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Schema lives in `src/db/schema.ts`. Three tables:

| Table | Purpose |
|-------|---------|
| `users` | Synced from Clerk (id = Clerk user ID) |
| `decisions` | Investment decisions / journal entries |
| `thesis_challenges` | AI-generated challenges per decision |

Generate a migration after schema changes:

```bash
npm run db:generate   # generate SQL migration
npm run db:migrate    # apply to database
npm run db:push       # push schema directly (dev only)
npm run db:studio     # open Drizzle Studio UI
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set all env vars from `.env.example` in Vercel project settings
4. Deploy — Vercel auto-deploys on every push to `main`

## CI

GitHub Actions runs on every push and PR to `main`:
- ESLint
- TypeScript check
- Next.js build

See `.github/workflows/ci.yml`.
