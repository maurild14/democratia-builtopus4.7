# 18 — Implementation Phases

The 21-week pilot roadmap. Work the phases in order. Track status in [progress.md](progress.md).

## Phase 0 — Foundation (Weeks 1–3)

- Set up the monorepo (Turborepo + pnpm + TypeScript strict).
- Configure Supabase (project, PostGIS / pg_trgm / unaccent extensions, auth providers).
- Complete DB schema: all tables, functions, triggers, RLS policies.
- Geographic ingestion: CABA (48 neighborhoods) + SF (49 neighborhoods) with polygons.
- Full auth flow: registration with hierarchical selector, SMS verification, login, social login.
- CI/CD: GitHub Actions → Vercel (preview deploys on PRs).
- Functional landing page.
- README + CONTRIBUTING.md + issue templates published.
- Public repo on GitHub.

## Phase 1 — Forums and Conversation (Layer 1) (Weeks 4–7)

- Main dashboard with forum cards (primary neighborhood, secondaries, city, province, country).
- Forum explorer with autocomplete search and hierarchical navigation.
- Forum view with 3 navigation blocks (Threads, Radar, Reports).
- Thread CRUD (create, edit within 5 min, no deletion).
- Nested comments (max 5 levels).
- Agree/disagree/pass voting with real-time percentages (Supabase Realtime).
- Hot/New/Top ordering with period sub-selectors.
- User profile and settings (pseudonym change, neighborhood, notifications, theme).
- In-app notification center (dropdown with badge).
- Onboarding walkthrough (12 steps, skippable).

## Phase 2 — Deliberation Pipeline (Layers 2–5) (Weeks 8–12)

- Automatic elevation logic (thresholds relative to forum size).
- Layer 2: Claude API integration for statement extraction.
- Layer 2: Tinder-style cards UI with Framer Motion (swipe or buttons).
- Layer 2: propose-new-statement flow with endorsement queue.
- Layer 3: implement PCA + K-Means + K-Means++ in TypeScript.
- Layer 3: optimal-K selection with silhouette score.
- Layer 3: consensus/division detection with geographic weights.
- Layer 3: interactive scatter plot with Recharts/D3 ("You are here").
- Layer 3: consensus/divisions view.
- Layer 4: Habermas synthesis with Claude API + view with dissenting voices.
- Layer 5: results screen, proposals, and open data (downloadable CSV/JSON).
- Navigable 5-node progress indicator.

## Phase 3 — Civic Radar (Weeks 13–15)

- Ingestion pipeline with scrapers / API clients per jurisdiction (CABA + SF).
- Summaries with Claude API + summary-error-report mechanism.
- List view with filters (type, date, debate state).
- Item detail with embedded original text.
- "Open debate" mechanic (creates linked thread in the forum).
- Government Transparency dashboard (when data is available).
- Vercel Cron for periodic ingestion every 6 hours.

## Phase 4 — Moderation and Reports (Weeks 16–18)

- Off-topic moderation with Claude API (async trigger via Edge Function).
- Content-report flow (modal → moderation queue).
- Moderation panel for moderators/admins.
- Appeal flow for content marked off-topic.
- Deliberative-report generation (auto on Layer 5 completion).
- Periodic-report generation (weekly, Vercel Cron).
- Public open-data API (`GET /api/public/v1/`).
- k-anonymity on exported datasets.

## Phase 5 — Polish and Launch (Weeks 19–21)

- Full dark mode.
- i18n (English + Spanish) with next-intl.
- Mobile responsive (desktop-first but usable on mobile).
- Performance audit (Core Web Vitals, Lighthouse).
- Security audit.
- Accessibility audit (WCAG 2.1 AA).
- Final landing page with all 6 sections.
- Help blog with categories and search.
- Legal pages (Terms, Privacy).
- Public project documentation.
- **Launch.**

## How to work a phase

1. Read [progress.md](progress.md) to see what's done in the current phase.
2. Pick the next unchecked task.
3. Read the relevant spec document(s) — don't guess.
4. Implement, test, commit.
5. Update [progress.md](progress.md): move task to Done, note new follow-up tasks.
6. Do not jump ahead to a later phase. If blocked, add to the Blockers section with the unblocking decision reference.
