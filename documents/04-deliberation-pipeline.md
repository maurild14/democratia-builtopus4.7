# 04 — Deliberation Pipeline (the 5 Layers)

The heart of DemocratIA is a five-layer deliberation pipeline that transforms free conversation into actionable consensus. The pipeline separates two functions that other platforms conflate: **discussion** (community-building and idea exploration) and **structured deliberation** (producing usable output for public policy).

> See [15-clustering-algorithms.md](15-clustering-algorithms.md) for the math and implementation of Layer 3, and [14-llm-prompts.md](14-llm-prompts.md) for the exact LLM prompts used in Layers 2, 4, and 5.

## Overview

```
Layer 1 → Layer 2 → Layer 3 → Layer 4 → Layer 5
Conversation  Statements  Clustering  Synthesis  Proposals
```

**Key principle — not every thread passes through all 5 layers.** Only those elevated to a "deliberative process" do. Most threads stay in Layer 1 and perform a valid community/engagement function. What is sent to governments as formal input is the output of threads that reach Layer 3 or beyond.

## Elevation to deliberation

A thread is automatically elevated from Layer 1 to Layer 2 when **both** conditions are met:

**Condition 1 — Minimum participation:**
```
unique_participants >= max(10, forum_member_count × 0.05)
```
At least 5% of forum members, with an absolute floor of 10 people (for small forums).

**Condition 2 — Minimum engagement:**
```
total_votes + total_comments >= max(20, forum_member_count × 0.10)
```
At least 10% of forum size, floor of 20 interactions.

**Examples:**
- Neighborhood with 80 members: elevates at ~10 participants and ~20 interactions.
- City forum with 3000 members: elevates at ~150 participants and ~300 interactions.

Thresholds are configurable in `packages/config/constants.ts` and will be tuned with pilot data.

**Whether manual elevation paths exist** (thread creator toggle, moderator action) is [19-open-questions.md Q1](19-open-questions.md).

### What happens when a thread elevates

1. `is_deliberation = true`, `deliberation_started_at = NOW()`, `deliberation_stage = 1`.
2. The original discussion **locks** (no new comments accepted).
3. The thread is **pinned** at the top of the forum's thread list, above the normal ordering (Hot/New/Top).
4. The thread is visually highlighted (glowing border or distinct background) with a prominent **"In deliberation"** badge.
5. Statement extraction (Layer 2) is triggered via Claude API.
6. A 5-node horizontal progress indicator appears, navigable: **Layer 1 (Conversation) → Layer 2 (Statements) → Layer 3 (Clustering) → Layer 4 (Synthesis) → Layer 5 (Proposals).** Active node highlighted, completed nodes checkmarked, future nodes grey. Clicking a completed node navigates to its view. **All users can see the pipeline progress**, not just participants.

Users can still view the original discussion via a collapsible "View original discussion" button.

---

## Layer 1 — Free Conversation

**Function:** Community, engagement, organic identification of relevant topics.

Open discussion inside the forum. Users create threads; other bonded users comment.

### Thread creation

Click "+" button → creation screen with:
- **Title** (required, max 150 chars)
- **Body** (required, max 5000 chars)
- **Attach images** button (max 4, max 5MB each)
- **Inline links** (pasting a URL auto-generates a preview card)
- **Publish** / **Cancel** buttons

On publish, user is redirected to the new thread.

### Voting system

DemocratIA does **not** use Reddit-style upvote/downvote — that measures popularity, not quality, and buries legitimate minority opinions. Instead, every post and comment receives **agree / disagree / pass** votes.

- Results are shown as **live percentages** (e.g., `67% agree · 22% disagree · 11% pass`).
- Each user votes once but can **change their vote**.
- Inspired by Pol.is; empirically shown to reduce polarization vs. binary systems.

### Comments

- **Nested Reddit-style** with visual indentation by depth.
- **Max 5 levels of nesting.** Level ≥6 renders flat at level 5 with an "in reply to [pseudonym]" indicator.
- Each comment shows pseudonym + resident/non-resident badge, text (max 2000 chars), date, and the agree/disagree/pass percentage bar.
- The new-comment input sits at the **end** of the thread to incentivize reading before commenting.

### Edit and permanence

- Posts and comments are editable **within 5 minutes** of publication. After that, locked.
- An edit shows `(edited)` without diff detail.
- **Nothing can be deleted** (except via account deletion, which replaces pseudonym with `[deleted]`).

### Thread ordering inside a forum

Dropdown filters:
- **Hot / Trending** (default) — prioritizes recent activity relative to age (Wilson-score variant; see [12-database.md](12-database.md) `calculate_hot_score`).
- **New** — reverse chronological.
- **Top** — by total participation, with period sub-selector (Today / This week / This month / All time).

Additional filters: **State** (All / Active / In deliberation), **Date** (range).

### Who can participate

All registered users with a bond (primary resident or secondary), labeled accordingly.

---

## Layer 2 — Statement Extraction

**Function:** Synthesize the key positions of the thread into votable affirmations.

When a thread is elevated, an LLM (Claude) analyzes the entire conversation and extracts **statements** — clear, concise, neutral phrases that capture the main positions. See the exact prompt in [14-llm-prompts.md §9.2](14-llm-prompts.md).

**Example:** If a thread discusses pedestrianizing a street, statements might be:
- "Street X should become permanently pedestrian."
- "Pedestrianization should be limited to specific hours."
- "Pedestrianization hurts local shops."

### Voting UI — Tinder-style cards

Statements are presented as stacked cards in the center of the screen. Two interaction modes:
- **Swipe:** right = agree, left = disagree, down = pass.
- **Buttons inside the card:** "Agree" (green), "Disagree" (red), "Pass" (grey).

After voting a card, the next appears with a transition animation. Progress counter: `Statement 4 of 12`. Built with Framer Motion.

### No replies to statements

Intentional restriction. Eliminates point-by-point fighting and forces users to position themselves without attacking each other. A validated Pol.is design principle.

### Post-voting

On finishing all statements, a confirmation screen appears with the option **"Propose a new statement"** if the user feels a position was missing (text field, max 280 chars). Proposed statements enter a review queue and join the voting pool once approved by moderators or after reaching a minimum endorsement threshold from other users. Endorsement threshold is [19-open-questions.md Q5](19-open-questions.md).

### Results are hidden during voting

Vote percentages/distributions are **not shown** during the voting phase to prevent conformity bias. Results are revealed only once Layer 3 (clustering) completes.

---

## Layer 3 — Clustering (see [15-clustering-algorithms.md](15-clustering-algorithms.md))

**Function:** Identify opinion groups and find cross-group consensus.

As votes accumulate on statements, clustering algorithms (PCA + K-Means++) identify groups of users with similar voting patterns. Clusters are **organic opinion camps**, not pre-defined political parties.

### Triple output

1. **Opinion map** — interactive scatter plot. Each point is a participant, grouped by similarity. Clusters distinguished by color. The current user's point is highlighted ("You are here"). Hovering/tapping a cluster shows its number, size, and an AI-generated description of its opinion profile. Users see **which cluster they belong to but not which individual users are in which cluster** (anonymity preserved within clusters).
2. **Consensus statements** — on a dedicated screen (accessed via "View consensuses and divisions" button). Statements where multiple clusters agree. Each shows text, a visual indicator of how many clusters agree, and total agreement percentage. **Highest-value output for public policy.**
3. **Divisive statements** — on the same dedicated screen. Each shows text, a visualization of how each cluster voted (colored horizontal bars), and a description of the conflict axis. Marks the real axes of disagreement.

---

## Layer 4 — Habermas-style Synthesis

**Function:** Generate a group statement that represents the community's consensus.

For consensus statements from Layer 3, an LLM (following Google DeepMind's Habermas Machine caucus-mediation architecture) generates a **group statement** capturing the shared position. See prompt in [14-llm-prompts.md §9.3](14-llm-prompts.md).

**Crucially, the group statement does not only reflect the majority: it explicitly includes minority positions and their objections**, ensuring consensus does not invisibilize dissenting voices.

### Layer 4 screen

- Group statement (AI-generated) in prominent typography.
- **"Dissenting voices" section** — explicit minority positions and their objections.
- Visible note: "This synthesis was generated by AI and reflects the data of the deliberative process. It is not an editorial position of DemocratIA."

### Definitive output, no iteration

The synthesis is informational and definitive. **No accept/reject mechanism by users. No iteration.** This is a product decision; users do not vote on the synthesis.

---

## Layer 5 — Action and Proposals

**Function:** Convert consensus into actionable documents and concrete proposals.

### Screen layout

**Section 1 — Executive summary.** Consensus reached in plain language, the Layer 4 group synthesis, and the derived concrete proposals (if any).

**Section 2 — Full traceability.** Expandable panel with the entire process: link to the original conversation, the list of statements with voting results (now visible), the opinion map with clusters, consensuses and divisions, the group synthesis, and participation metrics (participant count, distribution by bond type, temporal evolution).

**Section 3 — Formal proposals.** Only generated when `consensus_strength` is `moderate` or `strong` (see [14-llm-prompts.md §9.4](14-llm-prompts.md)). Max 5 proposals. Each proposal card shows: title, description, recipient (government area or official), jurisdictional level, consensus basis, priority, and link to the full report.

**Section 4 — Open data.** Download button for the anonymized dataset (CSV/JSON) + link to the public API. All deliberative-process data (anonymized with k-anonymity k=20) is published as open data so researchers, journalists, and other actors can analyze it.
