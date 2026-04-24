# 07 — Reports, Accountability, and Public Output

The output of DemocratIA does not end in the conversation. The platform produces periodic reports and per-process reports that are simultaneously **input for governments** and **public data accessible to any citizen.**

Reports are accessed from one of the three internal navigation blocks of each forum. They also have a **public URL accessible without login.**

## Report generation

Two report types:

### Deliberative reports

Produced when a thread completes the deliberation pipeline (reaches Layer 3 or beyond).

Detail screen includes:
- Executive summary (consensus reached, derived proposals, key metrics).
- Full process with traceability (identical to the Layer 5 screen).
- Open data (download button for anonymized dataset + API link).
- Distribution info (to whom it was sent and delivery status).

Each report is sent to the official or government area responsible for the topic, in addition to being published openly on the platform.

See prompt in [14-llm-prompts.md §9.7](14-llm-prompts.md).

### Periodic forum reports

Weekly or monthly summaries of each geographic forum's activity.

Detail screen includes:
- Activity summary (most-discussed topics, emerging trends, deliberative processes in progress or completed).
- Community-health metrics (activity level, participation diversity, constructive-vs-flagged content ratio).
- Downloadable open data.

Shown both in the forum's reports section and in a platform-wide reports list. Generated every Monday at 00:00 UTC by Vercel Cron.

### Reports list view

Cards in vertical list with search and filters: **Type** (Deliberative / Periodic / All), **Date**, **State** (Published / Generating). Empty state if no reports yet.

## Distribution channels

Reports are distributed via multiple channels:
1. Directly to the relevant official.
2. Newsletter.
3. On the platform itself.
4. DemocratIA social media.
5. Public API / MCP.

## Open data and privacy

All aggregate data and reports are public and accessible via API. However, publishing open data requires privacy protections to prevent re-identification of users, especially in small neighborhoods.

### k-anonymity (implemented for v1)

**k=20.** No filter intersection (neighborhood + age range + gender + vote position) is published if the resulting group has fewer than 20 people. If an intersection yields <20, the group is aggregated up to the next geographic level.

## Pending definitions in this area

See [19-open-questions.md](19-open-questions.md) for open decisions:

- **Q9 — Differential privacy:** evaluate implementing controlled statistical noise in public datasets to make re-identification impossible without significantly degrading analytical utility. Define epsilon parameters and application mechanism.
- **Q10 — Data-retention policy:** define how long user activity (votes, comments, participation history) is stored. Options: indefinite, N years, only while account is active.
- **Right to erasure:** define whether a user can request complete deletion of all activity and the impact on already-generated reports. The current deletion implementation anonymizes pseudonym (`[deleted]`) and keeps votes anonymously to preserve report integrity. Evaluate whether this satisfies GDPR/CCPA right-to-erasure.
- **Regulatory compliance:** Ley 25.326 (Argentina Personal Data Protection) and CCPA (California Consumer Privacy Act). To be addressed before launch.
- **Dataset publication delay:** evaluate a 48-hour delay between data generation and public publication to detect anomalies or manipulation before data goes live.
- **Informed consent:** define what data is collected, how it is used, and how this is communicated to the user at registration. Consent must be clear, specific, and revocable.

## Public API v1

Published under `/api/public/v1/`:

- `GET /api/public/v1/reports` — list published reports with filters.
- `GET /api/public/v1/forums` — forum data.
- `GET /api/public/v1/data` — anonymized datasets (CSV/JSON), with k=20 enforcement applied server-side.

See [13-api-and-backend.md](13-api-and-backend.md) for endpoint specifications.
