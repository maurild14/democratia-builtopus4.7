# 13 — API Layer and Backend

## Endpoint structure

```
/api/
├── auth/
│   ├── verify-geo/              # POST: validate IP vs geographic declaration
│   └── cleanup-deleted/         # POST (cron): delete accounts with 30+ days of grace
│
├── forums/
│   ├── [forumId]/
│   │   ├── threads/             # GET: list with ordering (hot/new/top), POST: create
│   │   ├── radar/               # GET: Radar items with filters
│   │   └── reports/             # GET: forum reports
│   └── search/                  # GET: forum autocomplete (pg_trgm)
│
├── threads/
│   └── [threadId]/
│       ├── comments/            # GET: nested comments, POST: create comment
│       ├── vote/                # POST: vote thread (agree/disagree/pass)
│       ├── elevate/             # POST: elevate to deliberation (if thresholds met)
│       └── deliberation/
│           ├── statements/      # GET: statements, POST: propose new statement
│           ├── vote/            # POST: vote on statement
│           ├── cluster/         # GET: clustering results
│           ├── synthesis/       # GET: Habermas synthesis
│           └── results/         # GET: final results (Layer 5)
│
├── llm/
│   ├── extract-statements/      # POST: trigger statement extraction (internal)
│   ├── moderate/                # POST: off-topic check (called by Edge Function)
│   └── summarize-radar/         # POST: generate Radar-item summary (internal)
│
├── moderation/
│   ├── reports/                 # GET: report queue, POST: take action
│   ├── appeals/                 # GET: pending appeals, POST: resolve
│   └── log/                     # GET: history (admin only)
│
├── radar/
│   └── ingest/                  # POST (cron): periodic legislative-data ingestion
│
├── deliberation/
│   └── check-triggers/          # POST (cron): check if any thread should move to clustering
│
├── reports/
│   └── generate-periodic/       # POST (cron): generate weekly reports
│
├── notifications/
│   └── mark-read/               # POST: mark notification as read
│
├── profile/
│   ├── update/                  # PATCH: update profile
│   ├── change-zone/             # POST: change primary neighborhood (6-month cooldown)
│   └── delete/                  # POST: initiate soft delete
│
└── public/                      # Public API (open data, no authentication)
    └── v1/
        ├── reports/             # GET: published reports
        ├── forums/              # GET: forum data
        └── data/                # GET: anonymized datasets (CSV/JSON, k=20 enforced)
```

## Standard API-route pattern

All API routes follow the same pattern:

1. **Authenticate** the user (via Supabase session in cookies).
2. **Validate input** with a Zod schema.
3. **Check permissions** (forum access via `user_forum_access`).
4. **Execute** business logic.
5. **Return** typed JSON response.

Write operations (create thread, vote, comment) use the `upsert_vote` RPC function or direct inserts protected by RLS. Read operations use the user's Supabase client (which respects RLS automatically).

## Authentication middleware

The Next.js middleware (Edge Runtime) protects routes:

- **Public routes** (`/`, `/login`, `/register`, `/forum/*`, `/thread/*`, `/report/*`): no authentication required.
- **Protected routes** (everything else): no session → redirect to `/login?redirect=<original>`.
- **Pending verification**: session but phone not verified → redirect to `/verify`.
- **API routes** handle their own authentication internally (some public, some require auth).

## Server-side auth clients

Two Supabase clients for server-side in `packages/auth`:

- **`createServerSupabase()`** — uses request cookies, respects RLS. For Server Components and API Routes where queries should respect the authenticated user's permissions.
- **`createServiceSupabase()`** — uses service role key, bypasses RLS. For administrative operations (triggers, cron jobs, automated moderation).

## Vercel Cron Jobs

Configured in `vercel.json`:

| Cron | Schedule | Function |
|---|---|---|
| Radar ingestion | Every 6 hours | Fetch new legislative items from configured sources, generate summaries with Claude |
| Periodic reports | Monday 00:00 UTC | Generate weekly activity reports per forum |
| Deliberation-trigger check | Every hour | Check if any Layer-2 thread meets conditions to move to Layer 3 |
| Account cleanup | Daily 03:00 UTC | Definitively delete accounts with >30 days in grace period |

## Realtime

### Live votes

Agree/disagree/pass percentages update in real time via Supabase Realtime (Postgres Changes). The frontend subscribes to the vote channel for a specific target and refetches counters on change. Multiple users on the same thread see percentages update without refreshing.

### In-app notifications

Notifications are rows in `notifications` sent to the frontend via Supabase Realtime (subscribed by `user_id`). Frontend maintains `unreadCount` state, shown as bell-icon badge. Types: reply to thread, reply to comment, content marked off-topic, thread entered deliberation, new Radar item, report published, proposed statement approved.

## Edge Functions (Supabase)

Used for DB-triggered events that need to call external services:

- **Off-topic moderation trigger** — `BEFORE INSERT` webhook on `comments` and `threads` → Edge Function → `/api/llm/moderate` → updates `offtopic_marks` and sends notification. Must `fail open` (publish content if API errors).
