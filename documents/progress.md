# DemocratIA — Build Progress

**Purpose:** Single source of truth for what has been built, what is in progress, and what is blocked. Every coding agent MUST read this file before starting work and update it after finishing. Keep entries terse.

**Current phase:** Phase 1 complete (all routes building clean). Phase 2 UI done; backend wiring pending Supabase setup.

---

## How to use this file

1. Before starting a task, scan the relevant phase section to understand context.
2. Move tasks between sections as their status changes: `Backlog → In Progress → Done`.
3. When you discover new work, add it to `Backlog` in the appropriate phase — do not silently expand scope.
4. Record blockers in the `Blockers` section with the task ID, a one-line description, and what decision unblocks it.
5. Update the `Last updated` date below on every commit to this file.

**Last updated:** 2026-04-23

---

## Phase 0 — Foundation (Weeks 1–3)

### Done
- [x] Product specifications written and translated to English (`documents/01-19`)
- [x] CLAUDE.md agent guide
- [x] Turborepo monorepo: `pnpm-workspace.yaml`, `turbo.json`, root `package.json`
- [x] `packages/config` — centralized constants + Zod env validation
- [x] `packages/db` — 7 SQL migration files + full TypeScript Database type
- [x] `packages/auth` — SSR-safe server/client/middleware subpath exports
- [x] `packages/llm` — `callLLM()` with retry/caching + 5 prompts (extract, synthesis, radar, moderation, proposals)
- [x] `packages/clustering` — pure TypeScript PCA + K-Means++ + silhouette selection + consensus pipeline
- [x] `apps/web` — Next.js 15 App Router, Tailwind CSS, shadcn/ui component set
- [x] Editorial black/white design system (Bebas Neue display, Inter body, dot-grid, inverted sections)
- [x] Auth flows: login, register, verify OTP, password recovery, reset password, OAuth callback, onboarding
- [x] Landing page — 6 sections + FAQ + CTA + footer
- [x] Legal pages: Terms of Service, Privacy Policy
- [x] `vercel.json` (radar cron every 6h, reports cron weekly), `.env.example`, `LICENSE`

### Backlog
- [ ] Configure Supabase project (dev + prod) — requires user to create project + set env vars
- [ ] Run migrations against Supabase instance: `pnpm db:migrate`
- [ ] Seed CABA (48 neighborhoods) via Buenos Aires Data GeoJSON
- [ ] Seed San Francisco (49 neighborhoods) via DataSF GeoJSON
- [ ] GitHub Actions CI: lint + type-check + test
- [ ] README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates
- [ ] Publish repo publicly on GitHub

---

## Phase 1 — Forums & Conversation (Layer 1) (Weeks 4–7)

### Done
- [x] Dashboard page with forum cards (primary / secondary / ancestor / explorer)
- [x] Explore page with global search + hierarchical browse + pilot cities quick links
- [x] Forum page — header, stats, Hot/New/Top thread tabs, Radar preview, Reports preview
- [x] Thread page — breadcrumb, deliberation banner, vote bar, comment section
- [x] New thread creation page
- [x] Agree/Disagree/Pass voting client component with Supabase RPC
- [x] Nested comment section with pseudonym resolution
- [x] Profile page — identity (pseudonym change), location (secondary zones), notifications, account
- [x] AppNavbar (with unread badge + mod shield), PublicNavbar, footer
- [x] Onboarding walkthrough (12 Framer Motion steps, skippable)
- [x] Civic Radar page per forum with filter pills + transparency sidebar
- [x] `VoteBar`, `PipelineProgress`, `GeoSelector` components
- [x] Textarea UI component
- [x] API routes: `geo/zones`, `geo/search`, `auth/resolve-pseudonym`
- [x] Moderation panel (role-gated, pending reports + AI-flagged content)

### Backlog
- [ ] Supabase Realtime subscription for live vote count updates
- [ ] Nested comment reply (depth 2–5 with "in reply to" label)
- [ ] Thread 5-minute edit window (frontend timer + API guard)
- [ ] Report-content modal (5 reasons + free text)
- [ ] In-app notification center dropdown
- [ ] Profile zone change 6-month cooldown enforcement in UI

---

## Phase 2 — Deliberation Pipeline (Layers 2–5) (Weeks 8–12)

### Done
- [x] Deliberation page router with stage-based content switching
- [x] Layer 2: Tinder-style statement voting UI (Framer Motion swipe cards)
- [x] Layer 3: PCA scatter plot (Recharts ScatterChart) + consensus/divisive statement lists
- [x] Layer 4: Habermas synthesis view + dissenting voices card
- [x] Layer 5: Numbered proposals with consensus % + open data download button
- [x] `PipelineProgress` 5-node progress indicator
- [x] `api/deliberation/elevate` — marks thread + calls Claude to extract statements

### Backlog
- [ ] Automatic elevation trigger on hot_score threshold (Supabase DB webhook or cron)
- [ ] Layer 3 clustering job endpoint (`api/deliberation/cluster`)
- [ ] Layer 4 synthesis job endpoint (`api/deliberation/synthesize`)
- [ ] Layer 5 proposals job endpoint (`api/deliberation/propose`)
- [ ] User-proposed statement flow with endorsement counter

---

## Phase 3 — Civic Radar (Weeks 13–15)

### Done
- [x] Radar list page with filter pills + AI summaries + transparency sidebar
- [x] RadarItemCard (expandable AI summary, Open Debate button)
- [x] `api/radar/ingest` — ingest endpoint with AI summary generation
- [x] `api/radar/open-debate` — creates linked thread from radar item

### Backlog
- [ ] Real ingester for CABA sources (Boletín Oficial CABA, legislature API)
- [ ] Real ingester for SF sources (DataSF, Board of Supervisors, LegiScan)
- [ ] Radar item detail page
- [ ] Government transparency dashboard with live Recharts visualizations

---

## Phase 4 — Moderation & Reports (Weeks 16–18)

### Done
- [x] Moderation panel page (role-gated, pending reports + AI-flagged items)
- [x] `api/public/v1/reports` — public paginated reports API with cache headers

### Backlog
- [ ] Off-topic classifier via Supabase Edge Function (webhook on INSERT to threads/comments)
- [ ] Report-content modal → content_reports table insert
- [ ] Deliberative report auto-generation on Layer 5 completion
- [ ] Periodic report generation (weekly Vercel Cron per forum)
- [ ] k-anonymity enforcement (k=20) on exported datasets

---

## Phase 5 — Polish & Launch (Weeks 19–21)

### Backlog
- [ ] Dark mode complete (CSS variables already in place, needs toggle wiring)
- [ ] i18n with next-intl (English default, Spanish secondary)
- [ ] Mobile responsive pass
- [ ] Core Web Vitals + Lighthouse audit
- [ ] Security audit (rate limiting, CSRF, input sanitization)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Help blog
- [ ] Launch checklist

---

## Blockers

- **Supabase project** — All data-dependent features blocked until user creates Supabase project and sets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and runs migrations.
- **Anthropic API key** — LLM features blocked until `ANTHROPIC_API_KEY` is set.

---

## Session log

- 2026-04-23 | claude | initial spec + docs scaffold
- 2026-04-23 | claude | built entire codebase: monorepo, DB schema, auth, LLM, clustering, all app pages, API routes — clean build (27 routes)
- 2026-04-24 | claude | hero redesign: capitol SVG full-width background, DEMOCRATIA title + tagline + pill CTA buttons overlaid; build clean
