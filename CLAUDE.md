# DemocratIA — Agent Guide

DemocratIA is an open-source, geolocated deliberative-democracy platform. Citizens discuss public-policy topics in forums organized by geography (neighborhood → city → province → country), access AI-summarized government information via the Civic Radar, reach structured consensus through a 5-layer deliberation pipeline, and produce public reports that feed back to governments and civil society.

This file is loaded into every session. Keep it short. Detailed specifications live in `documents/`.

---

## Non-negotiable constraints

- **Language: English only.** UI copy, code, comments, identifiers, and docs are in English. The source briefs were in Spanish; they are fully translated. Spanish (and other locales) are shipped via `next-intl`, never hardcoded.
- **License: AGPL-3.0.** Any change must be compatible. Do not introduce code under incompatible licenses.
- **TypeScript strict mode** across the entire monorepo. No `any` without a short `// TODO` justification. No `@ts-ignore` without the issue number it tracks.
- **Stack is fixed:** Next.js 15 (App Router) on Vercel, Supabase (Postgres + PostGIS + Auth + Realtime + Storage), Anthropic Claude (`claude-sonnet-4-20250514`) for all LLM features, Turborepo + pnpm, Tailwind + shadcn/ui. Do not swap these without an explicit user decision.
- **Pilot cities:** CABA (Buenos Aires, Argentina) and San Francisco (California, USA). Seed data, geo sources, and Radar ingesters target these two only for v1.
- **Open-source from day one.** Code, schemas, prompts, and reports are public. Never commit secrets; use `.env.example` and Vercel env vars.
- **Neutrality in LLM output.** Prompts never editorialize, never invent positions, never erase minority voices. See [14-llm-prompts.md](documents/14-llm-prompts.md) §9.1.

## Workflow rules

1. **Always read [progress.md](documents/progress.md) first** before starting any coding task. It is the single source of truth for what exists, what's in flight, and what's blocked.
2. **Update progress.md** at the end of every work session: mark tasks done, add new tasks you uncovered, record blockers. Keep entries terse (one line each).
3. **Load only the documents you need.** The spec is split so you can pull the relevant file for the task at hand without reading everything. Use the index below.
4. **When a spec is ambiguous, check [19-open-questions.md](documents/19-open-questions.md).** If the question is there, flag it to the user rather than guessing. If it isn't, add it.
5. **Never invent product decisions.** If a feature isn't specified, ask. Do not silently ship a default.
6. **Follow the phase order** in [18-implementation-phases.md](documents/18-implementation-phases.md) unless the user explicitly redirects. Don't build Phase 3 features while Phase 1 is incomplete.
7. **Package boundaries are strict.** Put UI in `packages/ui`, prompts in `packages/llm/prompts/v1`, geo sources in `packages/geo/sources`, clustering in `packages/clustering`. Do not leak concerns across packages.

## Documents index

Product specifications:

- [01-vision-and-principles.md](documents/01-vision-and-principles.md) — The problem, what DemocratIA is/is not, founding principles, central hypothesis, bottom-up strategy.
- [02-geographic-model.md](documents/02-geographic-model.md) — Forum hierarchy, residency weights (1.0 / 0.75 / 0.50), visibility rules, primary-zone change cooldown.
- [03-identity.md](documents/03-identity.md) — Registration, pseudonyms, phone/email/geo verification, login, account deletion.
- [04-deliberation-pipeline.md](documents/04-deliberation-pipeline.md) — The 5 layers, elevation criteria, Layer 1 conversation mechanics, Layer 2 statement voting, Layer 5 outputs.
- [05-civic-radar.md](documents/05-civic-radar.md) — Legislative feed, AI summaries, "Open debate" mechanic, government-transparency dashboard.
- [06-moderation.md](documents/06-moderation.md) — Permissive discussion moderation, AI off-topic classifier, report and appeal flows, moderation panel.
- [07-reports-and-opendata.md](documents/07-reports-and-opendata.md) — Deliberative and periodic reports, distribution channels, k-anonymity, public API.
- [08-ui-screens.md](documents/08-ui-screens.md) — All screens, landing-page sections, onboarding, dashboard, forum view, profile.
- [09-user-flows.md](documents/09-user-flows.md) — End-to-end user flows (9 flows, ASCII trees).
- [19-open-questions.md](documents/19-open-questions.md) — Unresolved product and technical decisions. Check before assuming.

Technical specifications:

- [10-tech-stack.md](documents/10-tech-stack.md) — Full stack with justifications, deployment target, cost estimates.
- [11-monorepo-structure.md](documents/11-monorepo-structure.md) — Directory layout, package boundaries, why each package exists.
- [12-database.md](documents/12-database.md) — Schema, tables, indexes, DB functions, RLS policies, triggers.
- [13-api-and-backend.md](documents/13-api-and-backend.md) — API route structure, auth middleware, Vercel Cron jobs.
- [14-llm-prompts.md](documents/14-llm-prompts.md) — All prompts (extraction, Habermas synthesis, proposals, moderation, Radar, reports), versioning, evals, caching.
- [15-clustering-algorithms.md](documents/15-clustering-algorithms.md) — PCA + K-Means++ pipeline, K selection, consensus/divisive detection, edge cases.
- [16-security-and-privacy.md](documents/16-security-and-privacy.md) — Security layers, attack protections, k-anonymity, compliance notes.
- [17-opensource-and-contrib.md](documents/17-opensource-and-contrib.md) — AGPL rationale, issue labels, good-first-issues, CONTRIBUTING structure.
- [18-implementation-phases.md](documents/18-implementation-phases.md) — Six phases (Weeks 1–21) with deliverables per phase.

Operational:

- [progress.md](documents/progress.md) — **Read first, update last.** Live status of what's built.
