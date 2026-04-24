# 03 — Identity, Verification, and Anonymity

## Core model

DemocratIA operates under **public anonymity with internally verified identity.**

- Users debate, vote, and participate under pseudonyms. **No user can know the real identity of another participant.** There is no public profile view: the pseudonym appears as plain text (not clickable) in threads, accompanied only by the "Resident" or "Non-resident" badge.
- Every account is backed by a verified real person. **No multi-accounting, no bots.**
- The platform does not store personal-identity data (documents, biometrics). Verification produces a cryptographic uniqueness token, not an identity file.

This model balances two tensions: anonymity lets people express unpopular opinions without fear of retaliation (essential in low-trust or highly polarized contexts), while verification prevents mass manipulation via fake accounts (Sybil attacks).

## Registration — single-page form

One form, all fields, submitted once.

**Credentials section:**
- **Pseudonym** — text field with real-time availability validation; if left blank, auto-generated Reddit-style (e.g., `citizen_4829`).
- **Email**
- **Password** — with strength indicator.
- **Phone number** — with country-code selector.

**Geographic location section:**
- Cascading hierarchical selector: Country (dropdown) → Province/State (loads by country) → City/Municipality (loads by province) → Primary neighborhood (loads by city).
- After completing the hierarchy, a mini-map shows a pin at the selected location as visual confirmation.

**Secondary neighborhoods section (optional, during registration):**
- Two additional optional fields, each with the same cascading selector.
- Explanatory text: "Do you work, study, or have family in another neighborhood? You can add up to two secondary neighborhoods to participate in those forums too."

## Post-registration verification layers

**Layer 1 — Phone verified (required before app access):**
After submitting the form, the user reaches a verification screen. A 6-digit SMS code is sent. The user enters the code. **If they leave without verifying, the next login redirects them back here; the account is not enabled until this step completes.**

**Layer 2 — Email verified (soft):**
A confirmation link is sent in parallel. If the user does not confirm within 7 days, they are reminded on login but not blocked.

**Layer 3 — Geographic declaration validated (heuristic, non-blocking):**
The form-declared country is cross-checked against IP geolocation as a heuristic. If inconsistent (e.g., declares Argentina but IP is from Japan), an inline notice asks the user to confirm their correct country. **Registration is not blocked** — IP is not a reliable indicator (VPNs, travel).

This scheme is a minimum viable baseline and may evolve.

## Login and account recovery

- **Login:** Email or pseudonym + password. Social-login buttons (Google, Apple) as alternative.
- **Password recovery:** Click "Forgot password?" → email field → recovery link sent → "New password" screen (new + confirm) → redirect to login with success message.

## Pseudonym management

- User chooses pseudonym during registration; if blank, auto-assigned.
- Pseudonym can be changed from profile **once every 15 days.** If attempted earlier, the remaining time is shown.

## Account deletion

From profile → "Delete account" → warning screen explaining:
- The pseudonym is replaced with `[deleted]` in all their posts and comments.
- Their votes are kept anonymously to preserve the integrity of already-generated reports.
- **The process is irreversible after 30 days.**

The user must type `DELETE` (or `ELIMINAR` in Spanish UI) to confirm. The account enters a 30-day grace period during which logging in reactivates it. After 30 days, deletion is final.

## Open question — documentary verification

Document-based verification (national ID, passport) is desirable for higher authenticity, especially for report credibility with governments. Tensions between security, privacy, and adoption remain unresolved. See [19-open-questions.md](19-open-questions.md) Q3.

Goal: verify that a person exists and is unique **without storing any personal data.** Known risk: asking for ID in onboarding kills adoption.

## Sybil-attack protection summary

- Phone verification: 1 account per number.
- No multi-accounting.
- Rate limiting on votes (see [16-security-and-privacy.md](16-security-and-privacy.md)).
- Future: documentary verification with third-party provider (Onfido, Veriff — see open questions Q8).
