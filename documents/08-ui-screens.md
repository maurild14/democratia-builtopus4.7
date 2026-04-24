# 08 — Screens and Navigation

## Screen map

**Public (no login required):** Landing Page (with integrated FAQ), Login, Register, Password recovery, Forum view (read-only), Thread view (read-only), Public report view, Legal pages (Terms, Privacy), Help blog.

**Private (require authentication):** Onboarding walkthrough, Main dashboard, Forum explorer, Forum view (interactive), Thread view (interactive), Deliberation pipeline (Layers 2–5), Civic Radar (list and item detail), Government Transparency dashboard, Reports section, Profile and settings, Notifications center (dropdown), Moderation panel (moderators/admins only).

## Landing Page

The landing page coexists on the same domain as the app. Users arrive, see the landing, and from there can register, log in, or scroll.

**Sticky navbar:** Logo left. "Log in" (secondary) and "Sign up" (primary) buttons right. On mobile, collapses into hamburger menu.

**Section 1 — Hero.** Background image or illustration. Text with the project's motto (one short, identity-defining phrase). Two centered buttons: "Sign up" + "Log in". No other elements; clean and uncluttered.

**Section 2 — Platform pulse.** Real-time insights geolocated by IP: number of active communities in the area, most-discussed topics this week (2–3 headlines), completed deliberative processes, mini-map with activity dots. If no nearby activity: global data with message "No active communities in your area yet — be the first to start."

**Section 3 — What is DemocratIA?** Concise explanation: what problem it solves, why it was created. Honest, direct tone, not corporate.

**Section 4 — How it works.** Four blocks with icons/illustrations: Geolocated forums, Civic Radar, Deliberation pipeline, Open reports.

**Section 5 — Vision and principles.** Emotional/philosophical section with manifesto tone.

**Section 6 — FAQ.** Accordion (minimum 8, maximum 15 questions).

**Footer:** Logo, column links (Product, Project, Legal), social media, GitHub.

## Onboarding Walkthrough

After phone verification on first access. Full-screen carousel with max 12 steps, navigable with "Next" and "Back". Skippable with "Skip" button visible on every slide. Replayable from Profile → Help → "Watch welcome tutorial".

**Content sequence:** Welcome → Your Dashboard → Your forums → Geographic structure → Explorer → Inside a forum (the 3 blocks) → Threads and discussion → Deliberation pipeline → Civic Radar → Reports → Your identity → Done! (CTA to dashboard).

## Main Dashboard (Home)

Post-login screen. Central navigation hub.

**Top navbar (persistent across the app):** DemocratIA logo (clickable, returns to dashboard) on the left. Bell icon (notifications with numeric badge) and avatar/profile icon on the right. For moderators/admins, additional shield icon to access the moderation panel.

**Main area — forum blocks as cards:**
- Primary-neighborhood block (name, jurisdiction, recent activity, "Primary" badge).
- Secondary-neighborhood blocks ("Secondary" badge, max 2).
- Higher-level forum blocks (city, province, country — auto-generated).
- Explorer block (visually differentiated, with mini-map of global activity dots).

**Ordering:** Fixed and hierarchical — primary, secondary, city, province, country, explorer.

## Forum Explorer (Global Search)

The forum explorer and global search are the **same feature.**

**Top — Global activity map.** Map of the world with white dots on dark background. Dots illuminate (platform accent color) where communities are active. Visual and decorative; not clickable for navigation. Also appears on the landing page. Its function is to convey the platform's global scale.

**Center — Search field.** Text field with real-time autocomplete. Results show full hierarchy for disambiguation (e.g., `Palermo — CABA — Buenos Aires — Argentina`). Selecting navigates to the forum.

**Bottom — Hierarchical navigation.** Browsable tree for exploring without knowing what to search: list of countries → provinces → cities → neighborhoods. Forums show activity indicators.

## Forum View

Every forum (neighborhood, city, province, country) has the same structure.

**Forum header:** Name prominent. Contextual navigation dropdown that shows the current location and expands the hierarchy to navigate between levels. Metadata: member count, active threads, geographic level. Read-mode banner if the user has no bond.

**3 Internal navigation blocks:** "Discussion threads" (with count of active threads), "Civic Radar" (with count of recent items), "Reports" (with count of available reports). Clicking each loads that view. Default view is Threads.

## Profile and Settings

Accessed from the profile icon in the navbar. **Exclusively private; no public view exists.**

**Identity section:** Pseudonym (with change button, every 15 days), avatar (customization options — see [19-open-questions.md Q7](19-open-questions.md)).

**Location section:** Primary neighborhood (with change button, every 6 months, confirmation dialog), secondary neighborhoods (list, add, edit, remove).

**Participation history (visible only to the user themselves):** Threads created, comments made, forums participated in, deliberative processes voted in.

**Notification settings:** On/off toggles per event type:
- Replies to my threads (on by default)
- Replies to my comments (on)
- My content marked off-topic (on, not disableable)
- Thread I follow entered deliberation (on)
- New item in primary-neighborhood Radar (on)
- New item in secondary-neighborhood Radar (off)
- Report generated in my forum (on)
- Periodic report available (on)
- My proposed statement was approved (on)

All notifications are in-app for now.

**Account section:** Email, phone (partially hidden), change password, delete account.

**Preferences section:** Light/dark toggle, language selector (English default, Spanish and others available).

**Help section:** Link to "Watch welcome tutorial" and link to Help blog.

**Log out:** No confirmation, immediate close and redirect to landing.

## Notifications

Dropdown notification center on bell-icon click. "Notifications" header with "Mark all as read" link. Notification list with icon per type, short descriptive text, relative timestamp, read/unread indicator. Clicking a notification navigates to the relevant content. Footer with "Configure notifications" link (to profile). Numeric badge on bell icon (max `99+`).

## Auxiliary pages

**Help blog.** Separate section accessible from footer and profile. Help-center structure with own search, article categories (Getting started / Forums and threads / Deliberation / Civic Radar / Privacy and security / Technical problems), each article with title, formatted content, last-updated date.

**Legal pages.** Terms & Conditions and Privacy Policy: text pages with sidebar table of contents. Accessible from footer and from the registration flow (inline link: "By registering, you agree to our Terms & Conditions and Privacy Policy").

## General UX considerations

- **Desktop-first platform.** Mobile strategy is [19-open-questions.md Q (mobile)](19-open-questions.md).
- Light and dark mode.
- Multi-language, primarily English (next-intl).
- **Infinite scroll** on all lists (threads, Radar items, reports).
- **Automatic link preview** (preview cards) for URLs in threads.
- Threads in deliberation render pinned at the top of the thread list.
