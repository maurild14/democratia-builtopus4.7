# 14 — LLM Prompts

All prompts live in `packages/llm/prompts/v1/`. Each is versioned (`v1/`, `v2/`). Current version is v1.

## 9.1 General principles (non-negotiable)

All DemocratIA prompts follow these principles:

- **Absolute neutrality.** The LLM never takes a political position. Never qualifies opinions. Never editorializes.
- **Inclusion of minority voices.** Positions with fewer adherents are not invisibilized. An 8% position is valid input equal to a 72% position.
- **Accessible language.** Outputs written for citizens, not experts. Reading level: completed secondary education.
- **Controlled determinism.** Temperature 0.1–0.2 for analytical tasks (extraction, moderation); 0.3–0.4 for generative tasks (synthesis, reports).
- **Structured output.** All prompts produce valid JSON for programmatic processing.
- **Language matching.** The LLM responds in the same language as the input conversation. (Platform UI is English, but content can be any user-input language.)

## 9.2 Prompt 1 — Statement Extraction (Layer 2)

**Model:** `claude-sonnet-4-20250514` | **Temperature:** 0.2 | **Max tokens:** 4096

**When:** Once, when a thread is elevated to deliberation.

**System prompt summary:** The LLM receives the full conversation (original post + all comments) and extracts **statements**: clear, concise (≤280 chars), neutral phrases that capture distinct positions expressed. Each statement must be **votable** (something one can agree, disagree, or have no opinion about).

**Key rules:**
- Reformulate in neutral language ("this crappy street" → "Street X needs repair").
- Do not merge distinct positions — one position = one statement.
- Capture **all** positions, including minority ones (if only one person mentioned it, include it).
- Do not invent positions that were not expressed.
- Deduplicate: if 5 people said the same thing, generate ONE statement with all 5 `comment_ids` as source.
- Generate between 5 and 25 statements depending on debate richness.

**Input:** Forum context (name, jurisdiction, geographic level), thread title, all comments with IDs, pseudonyms, and resident/non-resident badges.

**Output JSON:**
```json
{
  "statements": [
    {
      "text": "Statement in neutral language (≤280 chars)",
      "source_comment_ids": ["id1", "id2"],
      "position_summary": "Internal note on what position it captures (≤100 chars)"
    }
  ],
  "debate_axes": ["Debate axis 1", "Debate axis 2"],
  "extraction_notes": "Observations about the process"
}
```

**Guardrails:** If thread has <3 comments, do not execute. If JSON invalid, retry once. Validate all `source_comment_ids` exist. If a statement exceeds 280 chars, regenerate only that statement.

## 9.3 Prompt 2 — Habermas Synthesis (Layer 4)

**Model:** `claude-sonnet-4-20250514` | **Temperature:** 0.4 | **Max tokens:** 4096

**When:** Automatically after Layer 3 (clustering) completes.

Inspired by Google DeepMind's Habermas Machine. The LLM receives clustering results (identified clusters, consensus statements with per-cluster percentages, divisive statements with vote distribution) and generates a group synthesis.

**Prompt principles:**
- **Fair representativeness.** The synthesis reflects proportionally what the whole group thinks, not only the majority.
- **Explicit minority voices.** Minority positions described with the same argumentative dignity as the majority, in a dedicated "dissenting voices" section.
- **Honesty about disagreement.** If no real consensus exists, do NOT invent one. "The community is divided" is a valid result.
- **No motivation interpretation.** Report positions, not psychology ("those opposed do so out of fear" → NO).
- **No minimization.** Never "only a few think…" → use "a sector of the community argues…".

**Output JSON:**
```json
{
  "group_statement": "Group synthesis (≤1000 chars)",
  "dissenting_voices": "Minority positions and their arguments (≤800 chars)",
  "key_agreements": ["Agreement point 1 (≤150 chars)", "..."],
  "key_disagreements": ["Disagreement axis 1 (≤150 chars)", "..."],
  "consensus_strength": "strong | moderate | weak | none",
  "synthesis_metadata": {
    "dominant_position": "Brief description",
    "minority_positions": ["Position 1", "Position 2"],
    "unresolved_tensions": ["Tension 1"]
  }
}
```

## 9.4 Prompt 3 — Proposal Generation (Layer 5)

**Model:** `claude-sonnet-4-20250514` | **Temperature:** 0.3 | **Max tokens:** 4096

**When:** After synthesis, **only if `consensus_strength` is `moderate` or `strong`.** If `weak` or `none`, no proposals are generated.

The LLM transforms consensus into concrete, actionable proposals directed at the correct government level. Each proposal has: title (≤100 chars), description (≤500 chars), recipient (government area), jurisdictional level, consensus basis, priority. Max 5 proposals per process.

## 9.5 Prompt 4 — Off-Topic Moderation

**Model:** `claude-sonnet-4-20250514` | **Temperature:** 0.1 | **Max tokens:** 512

**When:** Asynchronously every time a new thread or comment is created. Triggered by Supabase Database Webhook → Edge Function → API Route.

**Critical principle: BE PERMISSIVE.** The threshold is high for marking something as off-topic. **When in doubt, always classify as on-topic.** Better to let a dubious comment through than to censor a legitimate one.

**NOT off-topic** (even if tangential): controversial opinions on the topic, personal anecdotes illustrating a point, comparisons to other cities, harsh government criticism, related humor or sarcasm.

**IS off-topic:** spam, advertising, completely irrelevant content (cooking recipe in transport thread), unrelated self-promotion.

**Output JSON:**
```json
{
  "is_offtopic": false,
  "confidence": 0.95,
  "reason": "Brief explanation (≤200 chars)"
}
```

**Post-prompt logic:**
- Confidence > 0.8 → mark off-topic, notify user.
- Confidence 0.5–0.8 → log for human review but do not mark.
- Confidence < 0.5 → silently ignore.
- If API call fails: **fail open** — publish content without mark. NEVER block publication due to moderation failure.
- If a user has >3 off-topic-marked items in a week, subsequent content goes directly to human review.

## 9.6 Prompt 5 — Civic Radar Summaries

**Model:** `claude-sonnet-4-20250514` | **Temperature:** 0.2 | **Max tokens:** 2048

The LLM receives legal/regulatory text and produces a plain-language summary answering three questions: **What changes? Who is affected? Why does it matter for neighbors?**

Main summary is ≤800 chars, accompanied by key data, affected groups, and technical references.

## 9.7 Prompt 6 — Report Generation

Two variants:

- **Deliberative reports** (`claude-sonnet-4-20250514`, temp 0.3, max 8192 tokens): professional compilation of a full deliberative process's results. Includes executive summary, context, participation, positions, agreements, disagreements, synthesis, and proposals.
- **Periodic reports** (`claude-sonnet-4-20250514`, temp 0.3, max 4096 tokens): weekly per-forum activity summaries with highlights, metrics, and trends.

## 9.8 Cluster-description prompt (Layer 3 support)

Claude generates label (≤30 chars) and description (≤200 chars) per cluster based on the cluster's voting profile, not on demographic characteristics. **Never uses political labels** (left/right/progressive/conservative).

## 9.9 Prompt versioning

Prompts versioned by directory (`v1/`, `v2/`). Each substantive change creates a new version. Previous version archived. Evals (curated test cases in `packages/llm/evals/fixtures/`) run against the new AND previous version to compare. A prompt is only promoted to production if it passes >95% of evals. Evals run in CI (GitHub Actions) on every PR touching `packages/llm/`.

## 9.10 Prompt caching

For off-topic moderation (high volume, same system prompt), activate Anthropic prompt caching. Send the system prompt with `cache_control: { type: 'ephemeral' }`, reducing system-prompt cost to a fraction after the first request.

Example wrapper pattern (in `packages/llm/client.ts`):

```typescript
await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 512,
  system: [
    { type: 'text', text: MODERATION_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
  ],
  messages: [{ role: 'user', content: userContent }],
});
```
