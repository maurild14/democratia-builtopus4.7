# 10 — Technology Stack

## Foundational decisions

These decisions were made during the technical-definition phase and condition the entire architecture. **Do not change without explicit user approval.**

- **Deploy target: Vercel.** Conditions Next.js as framework, ISR caching, Vercel Cron, and serverless functions.
- **Database: Supabase (managed PostgreSQL).** Postgres with PostGIS, integrated auth with social + SMS login, realtime subscriptions, Row Level Security, storage for images, Edge Functions for triggers.
- **LLM: Anthropic Claude API.** All AI features use Claude. Primary model: `claude-sonnet-4-20250514` for every task.
- **Pilot cities: CABA + San Francisco.** Dual launch, both cities have excellent open-data portals.
- **Open source from day 1.** Public repo from first commit. Architecture separates concerns so external contributors can participate without understanding the whole system.
- **License: AGPL-3.0.** Any deployed modified version must publish its code under the same license.

## Core

| Component | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Native Vercel deploy, SSR for SEO of public content, Server Components for performance, API Routes as backend, Server Actions for mutations |
| Database | **Supabase (PostgreSQL 15 + PostGIS)** | Managed Postgres with geographic extensions, integrated auth, realtime subscriptions, RLS, image storage |
| Auth | **Supabase Auth (GoTrue)** | Social login (Google/Apple), email/password, SMS phone, JWT tokens. Compatible with the anonymity + verification model |
| LLM | **Anthropic Claude API (`claude-sonnet-4-20250514`)** | Statement extraction, Habermas synthesis, off-topic moderation, Radar summaries, report generation |
| Storage | **Supabase Storage** | Thread images (max 4 per thread, max 5MB each), Radar source documents |
| Realtime | **Supabase Realtime (Postgres Changes)** | Live votes with percentages updating in real time, instant in-app notifications |
| Cron Jobs | **Vercel Cron** | Radar ingestion (every 6h), periodic reports (weekly), deliberation-trigger checks (hourly), deleted-account cleanup (daily) |

## Frontend

| Component | Technology | Rationale |
|---|---|---|
| UI components | **shadcn/ui + Radix UI** | Accessible (WCAG), customizable, not a heavy dependency — components are copied into the project, not imported from a package |
| Styling | **Tailwind CSS** | Consistent design system, themeable for dark/light, good contributor DX |
| State management | **Zustand** | Lightweight, simple, no boilerplate. For global state: authenticated user, active forum, notification counter |
| Forms | **React Hook Form + Zod** | Type-safe client-side validation, performance on complex forms like registration with hierarchical geo selector |
| Maps | **Leaflet + OpenStreetMap** | 100% free and open source, no API keys. CartoDB Dark Matter tiles for the global activity-dots map. Used in: mini-map confirmation in registration, activity map in the forum explorer |
| Charts | **Recharts or D3.js** | Interactive scatter plot for clustering (Layer 3), simple bar/pie charts for the transparency dashboard |
| i18n | **next-intl** | English as default, Spanish available. Extensible to other languages by contributors |
| Animations | **Framer Motion** | Tinder-style cards for statement voting (Layer 2), UI transitions between pipeline layers |

## Tooling and DX

| Component | Technology |
|---|---|
| Monorepo | **Turborepo** — caches builds per package, parallelizes tasks |
| Package manager | **pnpm** — native workspaces, faster and more disk-efficient than npm/yarn |
| Linting | **ESLint + Prettier** — with `prettier-plugin-tailwindcss` to order classes |
| Type safety | **TypeScript strict mode** — entire project, no exceptions |
| Testing | **Vitest** (unit tests per package) + **Playwright** (e2e in `apps/web`) |
| DB migrations | **Supabase CLI** — versioned SQL migrations, local dev with Docker |
| DB types | **Supabase CLI** — auto-generate TypeScript types from schema |
| CI/CD | **GitHub Actions** — lint + type-check + test on every PR |
| Pre-commit | **Husky + lint-staged** — format and lint before each commit |
| Documentation | **Starlight (Astro) or Docusaurus** — see [19-open-questions.md Q3](19-open-questions.md) |

## Deployment

### Environments

| Environment | Branch | URL |
|---|---|---|
| Production | `main` | democratia.org (custom domain — see [19-open-questions.md Q5](19-open-questions.md)) |
| Preview | Pull requests | `pr-{n}.democratia.vercel.app` |
| Development | local | `localhost:3000` |

### Recommended plan

**Vercel Pro ($20/month)** from the pilot. The Hobby plan has a 10-second timeout on serverless functions, insufficient for Claude API calls (15–30 seconds). Pro gives 60 seconds, 1TB bandwidth, and cron jobs.

### Caching strategy

- **ISR (Incremental Static Regeneration)** for public reports → `revalidate: 3600` (every hour).
- **ISR** for forums in read mode → `revalidate: 60` (every minute).
- **Dynamic** for threads with live votes → `force-dynamic`.
- **Server Components** for initial thread load (HTML without unnecessary JS to the client).
- **Edge Runtime** for light endpoints (search, autocomplete).
- **Vercel Image Optimization** for thread images.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Anonymous key (public, used in client)
SUPABASE_SERVICE_ROLE_KEY          # Service key (server-only, bypasses RLS)
ANTHROPIC_API_KEY                  # Claude API key
NEXT_PUBLIC_APP_URL                # App URL (for absolute links)
INTERNAL_API_KEY                   # For internal communication (Edge Functions → API Routes)
```

## Cost estimates (pilot)

### LLM (2 cities, first 3 months)

Assumptions: 500 active users, 200 threads/week, 2000 comments/week, 5 deliberative processes/week, 50 Radar items/week.

| Task | Weekly volume | Monthly cost |
|---|---|---|
| Off-topic moderation | ~2200 calls | ~$22 |
| Radar summaries | ~50 calls | ~$2.80 |
| Periodic reports | ~100 forums × 4/month | ~$2.50 |
| Deliberative reports | ~20/month | ~$0.90 |
| Statement extraction | ~5/week | ~$0.72 |
| Habermas synthesis | ~5/week | ~$0.52 |
| Proposals | ~3/week | ~$0.32 |
| **Total LLM** | | **~$30/month** |

### Infrastructure

| Service | Plan | Monthly cost |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase | Free (500MB, 50K rows) or Pro ($25) | $0–25 |
| Domain | .org | ~$1 |
| **Total infra** | | **$21–46/month** |

### Pilot total: ~$50–75/month for two cities and 500 active users.

### Cost optimizations

- **Prompt caching** for moderation (same system prompt across thousands of calls).
- **Moderation cache**: if a comment is identical to one already moderated, reuse result.
- **Batch processing**: group Radar items for joint processing.
- **Moderation skip**: users with >50 posts and 0 off-topic marks can skip automatic moderation.
