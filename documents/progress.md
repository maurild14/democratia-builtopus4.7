# DemocratIA — Build Progress

**Purpose:** Single source of truth for what has been built, what is in progress, and what is blocked. Every coding agent MUST read this file before starting work and update it after finishing. Keep entries terse.

**Current phase:** Phase 0 — Foundation (not started).

---

## How to use this file

1. Before starting a task, scan the relevant phase section to understand context.
2. Move tasks between sections as their status changes: `Backlog → In Progress → Done`.
3. When you discover new work, add it to `Backlog` in the appropriate phase — do not silently expand scope.
4. Record blockers in the `Blockers` section with the task ID, a one-line description, and what decision unblocks it.
5. Update the `Last updated` date below on every commit to this file.

**Last updated:** 2026-04-23 (initial scaffold — no code written yet)

---

## Phase 0 — Foundation (Weeks 1–3)

### Done
- [x] Product specification written and translated to English (`documents/01-09`)
- [x] Technical architecture specification written and translated to English (`documents/10-18`)
- [x] Open-questions registry created (`documents/19-open-questions.md`)
- [x] `CLAUDE.md` agent guide

### In Progress
_(none)_

### Backlog
- [ ] Initialize repo: `pnpm init`, Turborepo config, workspace layout
- [ ] Set up `apps/web` with Next.js 15 (App Router) + TypeScript strict
- [ ] Set up `packages/ui`, `packages/db`, `packages/auth`, `packages/llm`, `packages/geo`, `packages/clustering`, `packages/config`
- [ ] Configure Supabase project (dev + staging + prod)
- [ ] Enable PostgreSQL extensions: PostGIS, pg_trgm, unaccent
- [ ] Write initial migration: `geo_zones`, `geo_zone_ancestors`, `forums`, `user_profiles`, `user_secondary_zones`, `user_notification_prefs`
- [ ] Write migration: `threads`, `comments`, `votes` (unified), `statements`, `deliberation_results`
- [ ] Write migration: `radar_items`, `reports`, `content_reports`, `offtopic_marks`, `notifications`
- [ ] Implement DB functions: `user_forum_access`, `upsert_vote`, `calculate_hot_score`, `generate_ancestors_for_zone`, `handle_new_user`
- [ ] Enable Row Level Security and write all RLS policies per [12-database.md](12-database.md) §4.5
- [ ] Seed CABA (48 neighborhoods) via Buenos Aires Data GeoJSON
- [ ] Seed San Francisco (49 neighborhoods) via DataSF GeoJSON
- [ ] Generate `geo_zone_ancestors` closure table for seed data
- [ ] Auth flow: registration page (single-page form with hierarchical geo selector)
- [ ] Auth flow: phone SMS verification screen
- [ ] Auth flow: email confirmation link
- [ ] Auth flow: login (email or pseudonym) + social (Google, Apple)
- [ ] Auth flow: password recovery
- [ ] IP-vs-declaration geo consistency check (non-blocking)
- [ ] Next.js middleware: route protection + verification-pending redirect
- [ ] `createServerSupabase()` and `createServiceSupabase()` helpers in `packages/auth`
- [ ] Landing page scaffold (all 6 sections placeholder)
- [ ] GitHub Actions CI: lint + type-check + test
- [ ] Vercel preview deploys on PRs
- [ ] README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE (AGPL-3.0), issue templates
- [ ] Publish repo publicly on GitHub

---

## Phase 1 — Forums & Conversation (Layer 1) (Weeks 4–7)

### Backlog
- [ ] Dashboard with forum cards (primary / secondary / city / province / country / explorer)
- [ ] Explorer of forums + global search (autocomplete with pg_trgm)
- [ ] Global activity map (Leaflet + CartoDB Dark Matter tiles)
- [ ] Forum view with three nav blocks (Threads / Radar / Reports)
- [ ] Thread CRUD: create (title + body + up-to-4 images + link preview), 5-min edit window, no deletion
- [ ] Nested comments (max 5 levels; depth > 5 renders flat with "in reply to" label)
- [ ] Agree/disagree/pass voting with live percentages via Supabase Realtime
- [ ] Thread ordering: Hot / New / Top (with period sub-selector) + filters
- [ ] Report flag modal (5 reasons + "Other")
- [ ] Profile + settings screens (pseudonym change 15d, zone change 6m, notification toggles, theme, language)
- [ ] In-app notification center (dropdown with badge)
- [ ] Onboarding walkthrough (12 steps, skippable, replayable from profile)

---

## Phase 2 — Deliberation Pipeline (Layers 2–5) (Weeks 8–12)

### Backlog
- [ ] Automatic elevation trigger per [04-deliberation-pipeline.md](04-deliberation-pipeline.md)
- [ ] Thread lock on elevation, pin, "In deliberation" badge, 5-node progress indicator
- [ ] Layer 2 statement extraction via Claude API (`extract-statements` prompt v1)
- [ ] Layer 2 Tinder-style voting UI (Framer Motion, swipe or buttons)
- [ ] User-proposed statement flow with endorsement queue
- [ ] Layer 3 clustering: matrix build, imputation, PCA, K-Means++, silhouette-based K selection (`packages/clustering`)
- [ ] Consensus/divisive classification with geographic weighting
- [ ] Interactive scatter plot ("You are here") with Recharts/D3
- [ ] Dedicated consensus/divisions view
- [ ] Layer 4 Habermas synthesis via Claude API with explicit dissenting voices
- [ ] Layer 5 screen: executive summary, traceability, proposals, open data download (CSV/JSON)
- [ ] API public v1 endpoint stubs

---

## Phase 3 — Civic Radar (Weeks 13–15)

### Backlog
- [ ] Radar ingester for CABA sources (Boletín Oficial CABA, legislature, data.buenosaires.gob.ar)
- [ ] Radar ingester for SF sources (DataSF, SF Board of Supervisors, LegiScan CA, congress.gov)
- [ ] Radar summary prompt (Claude API) + error-report mechanism
- [ ] Radar list view with filters (type, date, debate state) + search
- [ ] Radar item detail screen with embedded original text
- [ ] "Open debate" action that creates a linked thread in the matching forum
- [ ] Government transparency dashboard (when data is available) with Recharts visualizations
- [ ] Vercel Cron every 6 hours for Radar ingestion

---

## Phase 4 — Moderation & Reports (Weeks 16–18)

### Backlog
- [ ] Off-topic classifier via Claude API, triggered by Supabase DB webhook → Edge Function
- [ ] Fail-open behavior on moderation API failure
- [ ] Prompt caching enabled for moderation system prompt
- [ ] Report-content modal → moderation queue
- [ ] Moderation panel (dashboard, report queue, appeal queue, admin-only action log)
- [ ] Off-topic appeal flow
- [ ] Deliberative report generation (auto on Layer 5 completion)
- [ ] Periodic report generation (weekly, Vercel Cron, per forum)
- [ ] Public API v1: `/api/public/v1/reports`, `/forums`, `/data`
- [ ] k-anonymity enforcement (k=20) on exported datasets

---

## Phase 5 — Polish & Launch (Weeks 19–21)

### Backlog
- [ ] Dark mode complete
- [ ] i18n with next-intl (English default, Spanish secondary)
- [ ] Mobile responsive pass (desktop-first but usable)
- [ ] Core Web Vitals + Lighthouse audit
- [ ] Security audit (XSS/CSRF/rate limiting)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Landing page final copy (all 6 sections)
- [ ] Help blog with categories + search
- [ ] Legal pages (Terms, Privacy)
- [ ] Public documentation site (Starlight or Docusaurus — see Q3 in 19-open-questions.md)
- [ ] Launch

---

## Blockers

_(List tasks blocked on product or technical decisions. Reference the question in [19-open-questions.md](19-open-questions.md) that unblocks each.)_

- None recorded yet.

---

## Session log

_(Append one line per session: `YYYY-MM-DD | agent | summary`. Keep this short — full history is in git.)_

- 2026-04-23 | claude | initial repo scaffold: CLAUDE.md + documents/ created, no code yet.
