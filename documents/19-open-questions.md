# 19 — Open Questions

Decisions that remain unresolved. **Check here before assuming anything** — if the answer you need is listed as open, ask the user. If the ambiguity you hit isn't listed, add it here.

Each item has a numeric ID so other documents can cross-reference (e.g., "see Q3").

---

## Product questions

### Q1 — Elevation criterion to deliberation

[`04-deliberation-pipeline.md`](04-deliberation-pipeline.md) specifies **automatic thresholds**. Still undecided whether **additional elevation paths** should exist:

- Thread creator toggles "elevate" manually?
- Forum moderators decide?
- Only the automatic threshold?
- Some combination?

**Phase:** 2. **Impact:** UX of thread elevation, moderator power, potential capture risks.

### Q2 — Moderator roles and community governance

Open set:
- How are moderators elected? (Self-nomination, community vote, appointment?)
- Term length.
- What can moderators do vs. what only admins can do.
- Prevention of forum capture by politicized moderators.
- Does the Civic Radar have "curator" roles?
- User reputation/trust system?
- Admin structure: global vs. per-jurisdiction.

**Phase:** Pre-launch. **Impact:** Platform legitimacy. **Must resolve before launch.**

### Q3 — Documentary verification (DNI/passport)

[`03-identity.md`](03-identity.md) §5.6. Tension between adoption (ID-gated onboarding kills signup), credibility with governments, and privacy (we refuse to store documents).

Options: Onfido, Veriff, Stripe Identity, self-hosted approach, or defer post-pilot.

**Phase:** Post-pilot. **Impact:** Report credibility with governments.

### Q4 — Civic Radar data-ingestion method

[`05-civic-radar.md`](05-civic-radar.md). Options:
- Automated scraping per jurisdiction.
- Manual curation by a team.
- Hybrid.

**Phase:** 3. **Impact:** Radar coverage, maintenance burden, reliability.

### Q5 — Endorsement threshold for user-proposed statements

[`04-deliberation-pipeline.md`](04-deliberation-pipeline.md) §Layer 2. When does a user-proposed statement enter the voting pool?

Options: 3, 5, 10 absolute endorsements, or relative to forum size.

**Phase:** 2. **Impact:** Statement pool quality and contributor freedom.

### Q6 — Off-topic classification criteria

[`06-moderation.md`](06-moderation.md) + [`14-llm-prompts.md`](14-llm-prompts.md) §9.5. Classifier parameters must be empirically tuned. Needs eval fixtures with labeled examples before launch.

**Phase:** 4. **Impact:** Moderation accuracy, false positives.

### Q7 — Profile avatars and visual personalization

[`08-ui-screens.md`](08-ui-screens.md) §Profile. What options does the user have for visual identity without compromising anonymity?

Options:
- Auto-generated (identicon, blockies).
- Selectable from a curated set.
- Custom upload (risks: identifying photos).

**Phase:** 1. **Impact:** UX warmth vs. anonymity.

### Q (mobile) — Mobile-responsive strategy

The platform is desktop-first. Define: responsive web only (v1)? Native app future? What degrades on mobile?

**Phase:** 5. **Impact:** Reach.

---

## Technical questions

### Q-tech-1 — Hot-score algorithm

[`12-database.md`](12-database.md) specifies a Wilson-score variant. Confirm whether to stick with the custom version or switch to Reddit-style. **Phase:** 1.

### Q-tech-2 — Documentation-site framework

Starlight (Astro) vs. Docusaurus for the docs site in `apps/docs/`. **Phase:** 0. **Impact:** DX for docs contributors.

### Q-tech-3 — SMS provider

Twilio (Supabase default) vs. alternative. **Phase:** 0. **Impact:** Per-SMS cost.

### Q-tech-4 — Domain

`democratia.org`, `democratia.io`, or other. **Phase:** 0. **Impact:** Project identity.

### Q-tech-5 — Minimum vote count to trigger Layer 3

[`15-clustering-algorithms.md`](15-clustering-algorithms.md) defaults to 10 qualified voters. Confirm or adjust. **Phase:** 2.

---

## Privacy and compliance questions

### Q9 — Differential privacy

Add controlled statistical noise to public datasets on top of k-anonymity? Define epsilon and application mechanism. **Phase:** Post-pilot.

### Q10 — Data-retention policy

How long is user activity (votes, comments, history) stored?

Options: indefinite, N years, only while account is active.

**Phase:** Pre-launch. **Impact:** Compliance (Ley 25.326, CCPA, GDPR-adjacent).

### Q11 — Right to erasure and anonymization sufficiency

Is the current account-deletion scheme (pseudonym replaced with `[deleted]`, votes kept anonymously) sufficient under Ley 25.326 and CCPA?

**Phase:** Pre-launch. **Impact:** Legal compliance, report integrity.

### Q12 — Dataset publication delay

Implement a 48-hour delay between data generation and public publication to allow anomaly/manipulation detection before data goes live? **Phase:** 4.

### Q13 — Informed consent

Define exactly what data is collected, how it's used, and how this is communicated at registration. Consent must be clear, specific, and revocable. **Phase:** 5 (pre-launch).

---

## How to resolve

1. Bring the question to a user decision — don't silently resolve it in code.
2. Once a decision is made, **remove the item from this file** and update the relevant spec doc.
3. Log the resolution in [progress.md](progress.md) session log.
