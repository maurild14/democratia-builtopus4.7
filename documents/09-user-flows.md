# 09 — Complete Flows Map

## Flow 1 — First contact → Register → Use

```
Landing Page
  ├── Scroll: explore landing sections
  ├── Click "Sign up" → Register screen
  │     └── Complete form → Click "Create account"
  │           └── Verification screen (SMS code)
  │                 └── Correct code → Onboarding walkthrough (12 steps)
  │                       └── Complete or skip → Main Dashboard
  └── Click "Log in" → Login screen
        ├── Correct credentials → Main Dashboard
        ├── Account not verified → Verification screen
        └── Click "Forgot password?" → Recovery flow
```

## Flow 2 — Main navigation (post-login)

```
Main Dashboard
  ├── Click forum block (neighborhood/city/province/country) → Forum View
  │     ├── Click "Threads" → Threads view (list)
  │     ├── Click "Civic Radar" → Radar view
  │     └── Click "Reports" → Reports view
  ├── Click "Explore communities" → Forum Explorer
  │     ├── Search forum → Results → Click → Forum View (read-only if no bond)
  │     └── Navigate hierarchically → Click → Forum View
  ├── Click bell → Notifications dropdown
  │     └── Click notification → Navigate to relevant content
  └── Click profile → Profile & Settings screen
```

## Flow 3 — Participation in a thread (Layer 1)

```
Threads view
  ├── Click "+" (create thread) → Thread Creation screen
  │     └── Complete title + body + attachments → Click "Publish"
  │           └── Redirect to newly created thread
  └── Click a thread → Thread view
        ├── Vote agree/disagree/pass on the post
        ├── Vote agree/disagree/pass on comments
        ├── Click "Reply" → Inline field → Write → Publish
        ├── Click "Edit" (within 5 min) → Edit → Save
        ├── Click "Report" → Report modal → Select reason → Submit
        └── If in deliberation: Click "View process" → Deliberation Pipeline
```

## Flow 4 — Full deliberation pipeline

```
Thread elevated to deliberation
  └── Thread-in-deliberation view
        ├── Progress bar: Layer 1 → 2 → 3 → 4 → 5
        ├── "View original discussion" (collapsible)
        │
        ├── [Layer 2] Statement cards (Tinder interface)
        │     ├── Swipe/click agree/disagree/pass on each statement
        │     ├── Post-voting confirmation screen
        │     └── Option: "Propose new statement" → Text field → Submit
        │
        ├── [Layer 3] Opinion map (scatter plot)
        │     ├── Hover/tap on clusters → Cluster info
        │     ├── See "You are here"
        │     └── Click "View consensuses and divisions" → Dedicated screen
        │           ├── Section: Points of agreement (consensus statements)
        │           └── Section: Axes of disagreement (divisive statements)
        │
        ├── [Layer 4] Group Synthesis
        │     ├── AI-generated group statement
        │     └── Explicit dissenting voices
        │
        └── [Layer 5] Results and Proposals
              ├── Executive summary
              ├── Full traceability (expandable)
              ├── Formal proposals
              └── Open data download
```

## Flow 5 — Civic Radar

```
Radar view (from forum)
  ├── "Legislative news" tab (default)
  │     ├── Search / filter items
  │     ├── Click item → Item detail screen
  │     │     ├── Read AI summary
  │     │     ├── Click "Report error" → Inline field → Submit
  │     │     ├── Click "View original text" → Scroll to source document
  │     │     ├── Click "Open debate" → Creates thread in forum → Navigate to thread
  │     │     └── Click "Go to debate" (if exists) → Navigate to thread
  │     └── Empty state if no items
  │
  └── "Government transparency" tab
        ├── If data available: dashboard with visualizations
        └── If no data: message + links to official portals
```

## Flow 6 — Reports

```
Reports view (from forum)
  ├── Search / filter reports
  ├── Click deliberative report → Detail with full traceability
  │     └── Download open dataset
  ├── Click periodic report → Detail with activity metrics
  │     └── Download dataset
  └── Empty state if no reports
```

## Flow 7 — Profile and account management

```
Profile screen
  ├── Change pseudonym (every 15 days) → Edit → Save
  ├── Change primary neighborhood (every 6 months) → Hierarchical selector → Confirmation
  ├── Edit secondary neighborhoods → Add / edit / remove
  ├── Configure notifications → Toggles on/off per type
  ├── Change password → Current password → New → Confirm
  ├── Switch visual theme (light/dark) → Toggle
  ├── Change language → Selector
  ├── View tutorial → Re-open walkthrough
  ├── Log out → Redirect to landing
  └── Delete account → Warning → Type "DELETE" → Confirm
        └── 30-day grace period → Definitive deletion
```

## Flow 8 — Moderation

```
Moderation Panel
  ├── Dashboard with metrics
  ├── Report queue → Review content → Dismiss / Remove / Escalate
  ├── Off-topic appeal queue → Review → Maintain mark / Revoke
  └── Action log (admin only)

User flow when their content is marked off-topic:
  Notification received → Click → See marked content → Click "Appeal"
  → Write justification → Submit → Wait for moderator resolution
  → Notification with result
```

## Flow 9 — Unauthenticated user

```
Landing Page → Scroll → Explore
  └── Click public forum/thread/report → Read-only view
        └── Attempt to interact → Modal "To participate you need an account"
              ├── Click "Sign up" → Register
              └── Click "Log in" → Login
```
