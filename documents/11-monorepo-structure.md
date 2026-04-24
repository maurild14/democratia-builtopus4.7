# 11 — Monorepo Structure

```
democratia/
├── apps/
│   ├── web/                          # Next.js 15 — main app
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/               # Group: login, register, verification, recovery
│   │   │   ├── (public)/             # Group: landing, public forums (read-only), reports
│   │   │   ├── (app)/                # Group: everything requiring authentication
│   │   │   │   ├── dashboard/        # Main dashboard (post-login home)
│   │   │   │   ├── forum/[forumId]/  # Forum view
│   │   │   │   │   ├── threads/      # Thread list
│   │   │   │   │   ├── radar/        # Civic Radar for the forum
│   │   │   │   │   └── reports/      # Forum reports
│   │   │   │   ├── thread/[threadId]/ # Thread view
│   │   │   │   │   └── deliberation/ # Pipeline Layers 2–5
│   │   │   │   ├── explore/          # Forum explorer / global search
│   │   │   │   ├── profile/          # Profile and settings
│   │   │   │   └── moderation/       # Moderation panel (mods/admins only)
│   │   │   ├── api/                  # API Routes (backend)
│   │   │   │   ├── llm/              # Endpoints calling Claude API
│   │   │   │   ├── radar/            # Legislative-data ingestion
│   │   │   │   ├── reports/          # Report generation
│   │   │   │   ├── deliberation/     # Pipeline triggers
│   │   │   │   ├── geo/              # Geographic queries
│   │   │   │   └── public/           # Public open-data API (v1)
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/               # App-specific components
│   │   ├── hooks/                    # Custom hooks (useRealtimeVotes, useNotifications, etc.)
│   │   ├── lib/                      # App-specific utilities
│   │   └── middleware.ts             # Auth middleware
│   │
│   └── docs/                         # Documentation site
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   └── src/
│   │       ├── vote-bar.tsx          # Agree/disagree/pass vote bar with percentages
│   │       ├── statement-card.tsx    # Tinder-style card for statement voting
│   │       ├── forum-card.tsx        # Forum card for the dashboard
│   │       ├── geo-selector.tsx      # Cascading hierarchical selector (Country→Province→City→Neighborhood)
│   │       ├── thread-editor.tsx     # Thread editor with image support and link preview
│   │       ├── pipeline-progress.tsx # 5-node pipeline progress indicator
│   │       └── ...
│   │
│   ├── db/                           # Database
│   │   ├── migrations/               # Versioned SQL migrations
│   │   ├── seed/                     # Seed scripts (pilot geographic data)
│   │   ├── types/                    # TypeScript types generated from the DB
│   │   └── queries/                  # Reusable queries and helper functions
│   │
│   ├── auth/                         # Authentication logic
│   │   ├── server.ts                 # Supabase auth server-side (Server Components, API Routes)
│   │   ├── client.ts                 # Supabase auth client-side (Client Components)
│   │   └── middleware.ts             # Next.js auth middleware (route protection)
│   │
│   ├── llm/                          # Claude API integration
│   │   ├── prompts/
│   │   │   └── v1/                   # Versioned prompts (v1 = current)
│   │   │       ├── extract-statements.ts
│   │   │       ├── habermas-synthesis.ts
│   │   │       ├── proposals.ts
│   │   │       ├── moderation-offtopic.ts
│   │   │       ├── radar-summary.ts
│   │   │       ├── report-deliberative.ts
│   │   │       ├── report-periodic.ts
│   │   │       └── cluster-descriptions.ts
│   │   ├── pipelines/                # LLM call orchestration
│   │   │   ├── deliberation.ts       # Full pipeline: extract → cluster → synthesize
│   │   │   └── moderation.ts         # Off-topic moderation pipeline
│   │   ├── evals/                    # Test cases to evaluate prompts
│   │   │   └── fixtures/             # Curated test data
│   │   └── client.ts                 # Anthropic SDK wrapper with retry and error handling
│   │
│   ├── geo/                          # Geographic logic
│   │   └── sources/                  # One file per country/data source
│   │       ├── argentina.ts          # CABA: BA Data + INDEC
│   │       └── usa.ts                # SF: DataSF + Census Bureau
│   │
│   ├── clustering/                   # Clustering algorithms (Layer 3)
│   │   └── src/
│   │       ├── matrix.ts             # Vote-matrix construction
│   │       ├── imputation.ts         # Missing-data handling
│   │       ├── pca.ts                # Dimensional reduction for visualization
│   │       ├── kmeans.ts             # K-Means with K-Means++ init
│   │       ├── optimal-k.ts          # Optimal-K selection with silhouette score
│   │       ├── consensus.ts          # Consensus/division detection
│   │       ├── trigger.ts            # When-to-run-clustering logic
│   │       ├── pipeline.ts           # Full-pipeline orchestration
│   │       └── types.ts              # TypeScript types
│   │
│   └── config/                       # Shared configuration
│       ├── constants.ts              # All magic numbers centralized
│       └── env.ts                    # Env-var validation with Zod
│
├── supabase/                         # Supabase configuration
│   ├── config.toml                   # Local config
│   └── functions/                    # Edge Functions (DB triggers)
│
├── .github/
│   ├── workflows/ci.yml              # CI: lint + type-check + test
│   ├── ISSUE_TEMPLATE/               # Templates for bug reports and features
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── CONTRIBUTING.md                   # Contributor guide
├── CODE_OF_CONDUCT.md
├── LICENSE                           # AGPL-3.0
├── README.md
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # Workspace config
├── vercel.json                       # Vercel cron jobs
└── .env.example                      # Environment-variable template
```

## Why the package split

The package separation is the most important architectural decision for open-source success. Every package has its own `package.json`, tests, and can be understood in isolation:

- A **frontend contributor** works in `packages/ui` without touching the DB.
- A **prompts/NLP contributor** works in `packages/llm/prompts` without touching the UI.
- A contributor who wants to **add a new country** only touches `packages/geo/sources/<country>.ts`.
- A **data-science contributor** works in `packages/clustering` — pure TypeScript, no React.
- A **translation contributor** works in the i18n files inside `apps/web`.

**Turborepo caches builds per package**: if only `packages/ui` changed, `packages/llm` is not rebuilt.

## Package boundaries (enforced)

- `packages/ui` never imports from `packages/db` or `packages/llm` directly. UI components receive data via props.
- `packages/clustering` is pure TypeScript with one dependency (`ml-matrix`). No React, no Next.js, no Supabase.
- `packages/llm` does not import from `packages/db`. It takes structured input and returns structured output.
- `packages/geo/sources/*` each export a normalized format. Adding a country = one new file.
- All magic numbers live in `packages/config/constants.ts`. No inline magic numbers in feature code.
