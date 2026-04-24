# 16 — Security and Privacy

## Security layers

```
Layer 1: Supabase RLS             → Row-level permissions in the DB
Layer 2: Next.js Middleware        → Route protection by authentication
Layer 3: API-route validation      → Zod input validation + forum-access verification
Layer 4: Rate limiting             → Vercel Edge Middleware or Upstash (per IP and per user)
Layer 5: Input sanitization        → DOMPurify for UGC (XSS prevention)
```

## Attack protection

- **Sybil attacks (fake accounts):** Phone verification (1 account per number). Future plan: documentary verification. See [19-open-questions.md Q8](19-open-questions.md).
- **Vote manipulation:** RLS prevents voting without a geographic bond. Rate limiting on votes.
- **XSS:** HTML/markdown sanitization in threads and comments with DOMPurify.
- **CSRF:** Supabase Auth uses httpOnly cookies with `SameSite`.
- **Data exfiltration:** k-anonymity on public data.
- **LLM prompt injection:** all LLM inputs include clear role separation; user content is delimited and escaped; outputs are JSON-schema-validated before use.

## k-anonymity in open data

All aggregate data published as open data (reports, downloadable datasets, public API) enforces **k-anonymity with k=20**. No filter intersection (neighborhood + age range + vote position) is published if the resulting group has <20 people. If an intersection yields <20, the group aggregates up to the next geographic level.

Enforcement is **server-side** in `/api/public/v1/data/`, never client-side.

## Privacy model

- **No personal-identity data stored.** Verification produces a uniqueness token, not a document file.
- **Anonymous pseudonyms.** No other user can see another's real identity.
- **No public profile.** Pseudonyms render as plain text, not clickable.
- **Deletion:** 30-day grace period, then pseudonym replaced with `[deleted]`, votes kept anonymously to preserve report integrity.

## Pending — must resolve before launch

See [19-open-questions.md](19-open-questions.md):

- **Q9 — Differential privacy** for public datasets.
- **Q10 — Data retention policy** (indefinite, N years, or only while account is active).
- **Right to erasure** compatibility with GDPR / Ley 25.326 / CCPA.
- **Dataset publication delay** (e.g., 48 hours) before public availability.
- **Informed consent** wording at registration.
- **Regulatory compliance audit** for Argentina and California launch jurisdictions.

## Secrets management

All secrets live in Vercel env vars and `.env` (gitignored). `.env.example` documents required variables without values. **Never commit real keys.** Use Supabase Vault or Vercel env vars for production.

## Auditability

- All LLM calls log `{prompt_version, model, temperature, input_hash, output_hash, timestamp, latency_ms, token_usage}` to an internal logs table.
- All moderation actions log actor, target, action, reason, timestamp.
- Admin-only action log visible in the moderation panel.
