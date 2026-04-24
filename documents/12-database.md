# 12 — Database Architecture

## Required PostgreSQL extensions

- **PostGIS** — geographic data (neighborhood polygons, centroids, spatial queries).
- **pg_trgm** — fuzzy search with trigrams for forum and pseudonym autocomplete.
- **unaccent** — text normalization for accent-insensitive search (critical for Spanish: "Núñez" = "Nunez").

## Entity diagram

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  geo_zones   │────▶│   forums     │────▶│     threads      │
│              │     │  (1:1 with   │     │                  │
│ - name       │     │   geo_zone)  │     │ - title, body    │
│ - slug       │     │              │     │ - vote counts    │
│ - level      │     │ - member_cnt │     │ - hot_score      │
│ - parent_id  │     │ - thread_cnt │     │ - is_deliberation│
│ - boundary   │     └──────────────┘     │ - delib_stage    │
│ - country_code│                         └────────┬─────────┘
└──────┬───────┘                                   │
       │                                    ┌──────▼──────┐
       │              ┌──────────────┐      │  comments    │
       │              │   votes      │      │              │
       │              │  (unified)   │      │ - body       │
       │              │              │      │ - parent_id  │
       │              │ - target_type│      │ - depth (≤5) │
       │              │ - target_id  │      │ - vote counts│
       │              │ - value      │      └──────────────┘
       │              │ - user_weight│
       │              └──────────────┘
       │
┌──────▼───────────┐     ┌──────────────┐     ┌──────────────────┐
│  user_profiles   │     │  statements   │     │ deliberation_    │
│                  │     │               │     │ results          │
│ - pseudonym      │     │ - text        │     │                  │
│ - primary_zone_id│     │ - source (AI/ │     │ - cluster_data   │
│ - role           │     │   user)       │     │ - synthesis_text │
│ - locale, theme  │     │ - vote counts │     │ - proposals      │
│ - deleted_at     │     │ - cluster_id  │     │ - metrics        │
└──────────────────┘     │ - is_consensus│     └──────────────────┘
       │                 └──────────────┘
       │
┌──────▼───────────┐     ┌──────────────┐     ┌──────────────────┐
│ user_secondary_  │     │ radar_items   │     │   reports        │
│ zones            │     │               │     │                  │
│                  │     │ - item_type   │     │ - report_type    │
│ - slot (1 or 2)  │     │ - title       │     │ - executive_sum  │
│ - weight         │     │ - ai_summary  │     │ - full_content   │
│ - geo_zone_id    │     │ - source_url  │     │ - open_data_url  │
└──────────────────┘     │ - linked_     │     │ - distribution   │
                         │   thread_id   │     └──────────────────┘
                         └──────────────┘

┌──────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ content_reports  │     │ offtopic_    │     │ notifications    │
│                  │     │ marks        │     │                  │
│ - reason         │     │              │     │ - type           │
│ - status         │     │ - ai_reason  │     │ - title, body    │
│ - reviewed_by    │     │ - confidence │     │ - link           │
└──────────────────┘     │ - appeal_    │     │ - is_read        │
                         │   status     │     └──────────────────┘
                         └──────────────┘
```

## Main tables

### geo_zones

Central table of the geographic model. Each row is a zone (neighborhood, city, province, or country). Hierarchical via `parent_id` (neighborhood → city → province → country). Field `boundary` stores the PostGIS polygon (MultiPolygon SRID 4326). Field `slug` for friendly URLs.

**Key indexes:** GIST on `boundary` for spatial queries, GIN with trigrams on `name` and `slug` for autocomplete.

### geo_zone_ancestors

**Closure table** that precomputes the full ancestor hierarchy of each zone. Enables efficient queries like "does this user belong to any neighborhood inside CABA?" without recursive JOINs. Auto-regenerated on zone insertion.

### forums

1:1 relationship with `geo_zones`. Every geographic zone has exactly one forum. Counters `member_count` and `thread_count` are **denormalized for performance** (updated by triggers).

### user_profiles

Extends Supabase's `auth.users` table. Auto-created via trigger on user registration. Key fields: `pseudonym` (unique, changeable every 15 days), `primary_zone_id` (primary neighborhood, changeable every 6 months), `role` (`citizen`/`moderator`/`admin`), `deleted_at` (soft delete with 30-day grace).

### user_secondary_zones

Up to 2 secondary neighborhoods per user, each with slot (1 or 2) and weight (0.75 and 0.50 respectively).

### user_notification_prefs

On/off toggles per notification type, with defaults per [08-ui-screens.md](08-ui-screens.md) §Profile.

### threads

Each thread belongs to a forum with an author. Vote counters (`vote_agree`, `vote_disagree`, `vote_pass`) and `comment_count` **denormalized** and updated by triggers to avoid expensive COUNT queries.

`hot_score` auto-recalculated by trigger using a Wilson-score-style algorithm balancing recency and engagement.

Deliberation fields (`is_deliberation`, `deliberation_started_at`, `deliberation_stage`) track pipeline progress.

Field `radar_item_id` links threads created from the Civic Radar ("Open debate").

### comments

Nested via `parent_id`. `depth` is CHECK-constrained to 5 levels. For `depth > 5`, field `reply_to_pseudonym` stores "in reply to [pseudonym]" for UI.

`moderation_status`: `visible`, `offtopic` (AI-flagged), or `removed` (human-moderator removed).

### votes

**Unified table** for votes on threads, comments, and statements. Field `target_type` discriminates (enum: `thread`, `comment`, `statement`). UNIQUE constraint on `(user_id, target_type, target_id)` enforces one vote per user per target. Field `user_weight` stores the user's geographic weight **at time of voting** (1.0, 0.75, or 0.50).

Function `upsert_vote` handles insert-or-change logic, auto-updating denormalized counters on the target table.

### statements

LLM-extracted statements (`source='ai_extracted'`) or user-proposed (`source='user_proposed'`). Proposed start with `status='pending'` until receiving enough endorsements. Clustering fields (`cluster_id`, `is_consensus`, `is_divisive`, etc.) filled when Layer 3 completes.

### deliberation_results

Stores Layer 3/4/5 results per thread. Flexible JSONB structure for complex data like `cluster_data` (scatter-plot coordinates, centroids) and `proposals` (Layer 5 structured proposals).

### radar_items

Each Civic Radar item with type, source, original text, and AI-generated summary. Field `summary_error_reports` counts user-submitted errors (if >N, triggers human review). Field `linked_thread_id` links to the debate thread.

## Database functions

- **`user_forum_access(user_id, forum_id)`** — central permissions function. Checks if a user has access to a forum and returns their weight. Verifies: (1) primary neighborhood matches forum's zone or is a descendant, (2) any secondary neighborhood matches, (3) returns `(has_access, is_resident, weight)`. Used in RLS policies and API routes.
- **`upsert_vote(user_id, target_type, target_id, value, weight)`** — handles vote insert/update with auto-update of denormalized counters. Returns updated counters for immediate frontend UI update.
- **`calculate_hot_score(agree, disagree, pass, comment_count, created_at)`** — Wilson-score variant weighing total engagement (votes + comments×2) divided by `(age_hours + 2)^gravity`. Gravity of 1.8 makes young high-engagement threads rise fast but decay with age. See [19-open-questions.md Q1](19-open-questions.md) if tuning needed.
- **`generate_ancestors_for_zone(zone_id)`** — walks `parent_id` up and populates `geo_zone_ancestors` with all ancestors and their depth.
- **`handle_new_user()`** — trigger on `AFTER INSERT ON auth.users`. Extracts pseudonym and primary zone from registration metadata, creates `user_profiles`, `user_notification_prefs` with defaults, increments `member_count` of the corresponding forum.

## Row Level Security (RLS)

First line of defense for permissions.

- **Public content** (threads, comments, forums, geo_zones, reports, radar): SELECT permitted for everyone including unauthenticated. Enables read-mode-without-login.
- **Private content** (votes, notification prefs, secondary zones): only the user can see/edit.
- **Content creation** (threads, comments): requires authentication AND forum access via `user_forum_access`.
- **Content editing**: only author, only if not edited before, only within 5 minutes.
- **Moderation**: action log visible only to admins.
- **Profiles**: public read (for pseudonyms display), update only own profile.

## Triggers

- **`trg_thread_hot_score`** — recompute `hot_score` on INSERT/UPDATE of votes or comments on threads.
- **`trg_comment_count`** — increment `comment_count` in parent thread on comment insert.
- **`on_auth_user_created`** — auto-create `user_profiles` and `user_notification_prefs`.

## Migration strategy

All schema changes go through Supabase CLI versioned SQL migrations in `packages/db/migrations/`. Each migration is idempotent and includes both `UP` and a commented `DOWN` for reference. Generated TypeScript types committed to `packages/db/types/` after each migration.
