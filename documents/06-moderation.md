# 06 — Moderation

Two planes of moderation operate in the platform.

## Plane 1 — Discussion: permissive moderation

In free conversation (Layer 1) and all direct user-to-user interaction, moderation is **deliberately permissive.** Users can express uncomfortable, controversial, unpopular, or politically incorrect opinions. **DemocratIA does not censor by political orientation or by how heterodox an opinion is.**

The only content removed in the discussion plane:

- **Explicit incitement to violence** against identifiable persons or groups.
- **Illegal discrimination** under the legislation of the country where the forum operates.
- **Doxxing** (publishing personal information of other users or third parties).
- **Direct personal threats.**
- **Illegal content.**

This list is intentionally short and bounded to what is legally required and to physical safety. The premise: a deliberative-democracy platform must host difficult debates; **discomfort is not equivalent to harm.**

### Content-report flow

1. User clicks the flag icon on a post or comment.
2. A modal opens with options: **Incitement to violence / Illegal discrimination / Doxxing / Direct threat / Illegal content / Other (specify).**
3. If "Other", a free-text field enables (max 500 chars).
4. On submit, confirmation: "Your report has been submitted. A moderator will review it."
5. The report enters the moderation queue.

## Plane 2 — Off-topic with AI

DemocratIA implements automated moderation for off-topic content. See prompt in [14-llm-prompts.md §9.5](14-llm-prompts.md).

- **At forum level:** an LLM classifier evaluates whether a new post relates to public-policy topics relevant to the forum's jurisdiction.
- **At thread level:** comments that deviate significantly from the post's topic are **auto-deprioritized** (moved to the end of the thread) and marked with a visible **"possibly off-topic"** tag.

**In both cases, content is NOT automatically deleted.** The user receives a notification with the reason and can appeal.

### Classification thresholds

- Confidence > 0.8 → mark as off-topic, notify user.
- Confidence 0.5–0.8 → log for human review but do not mark.
- Confidence < 0.5 → silently ignore.
- **If the API call fails: FAIL OPEN** — publish content without mark. Never block publication due to moderation failure.
- Users with >3 off-topic marks in a week have subsequent content routed directly to human review.

### Appeal flow

1. User receives notification that their content was marked off-topic.
2. On click, they see their content with the mark and an **"Appeal"** button.
3. Text field opens: "Explain why you believe your content is relevant to this thread" (max 500 chars).
4. On submit, confirmation. The appeal enters the moderation-panel queue.
5. A human moderator reviews and either **maintains the mark** or **revokes it** (content returns to its normal position, user is notified of the outcome).

## Moderation Panel

Moderators have a dedicated panel, accessible via a shield icon in the navbar (visible only to moderators and admins).

### Dashboard

Metrics overview: pending reports, pending appeals, actions taken.

### Reported-content queue

List of pending reports ordered by date. Each item shows:
- Reported content with context.
- Selected reason.
- Date.
- Number of reports accumulated on the same content.

**Actions:**
- **Dismiss report** — content stays.
- **Remove content** — hidden with placeholder: "This content was removed for violating community guidelines."
- **Escalate to admin.**

### Off-topic appeals queue

List of pending appeals. Each item shows:
- Marked content.
- AI reason.
- User's appeal text.
- Dates.

**Actions:** **Maintain off-topic mark** or **Revoke mark**.

### Action log

History of all moderation actions. **Visible only to admins**, not to regular moderators or users.

## Open question — moderator roles and governance

Moderator selection, terms, permissions, capture prevention, reputation systems, and admin structure are [19-open-questions.md Q2](19-open-questions.md). Must be resolved before launch.
