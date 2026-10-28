# Digital Wedding Invitation + RSVP — Project Plan

Status: proposal for review (nothing built yet). Research date: 2026-10-28.

## 1. Goal

A mobile-first, shareable wedding invitation web page with a built-in RSVP.
The guest list lives in a Google Sheet. Every guest is asked "Can you come?"
and their **Yes / No** is written back to their own row in that Sheet.
Hosting must be free.

## 2. Recommended architecture (Option A)

```
Guest phone (Messenger / Viber / SMS link)
        │  https://<site>/?i=<guest token>
        ▼
Static site on GitHub Pages  (HTML + CSS + vanilla JS, built with Vite)
        │  GET  ?i=TOKEN            -> { name, party size, status }
        │  POST { token, yes/no, headcount, note }   (text/plain body)
        ▼
Google Apps Script web app  (deployed "Execute as me", access "Anyone")
        │  LockService + lookup by token
        ▼
Guest Google Sheet  (one row per guest / household)
```

Why this combination:

| Decision | Choice | Reason |
|---|---|---|
| Hosting | **GitHub Pages** (repo already on GitHub) | Free, custom domain + automatic Let's Encrypt HTTPS, deploy on push via GitHub Actions. Soft limits (100 GB/month bandwidth, 1 GB site) are far above a wedding site's needs. |
| Backup host | Cloudflare Pages | Also free (500 builds/month, 100 custom domains); same static files, no code change. |
| RSVP backend | **Google Apps Script bound to the Sheet** | No server, no secrets in the repo, no Google Cloud project, writes straight into the Sheet you already use. This is the pattern every open-source wedding template uses. |
| Guest identity | **Per-guest token in the URL** | No typing of names, no spelling mismatches, no strangers submitting. Falls back to a name search if a guest opens the bare link. |
| Frontend | Vite + vanilla JS + SCSS, single page | Fast, no framework to learn, easy to test with Playwright; same stack as the best-maintained template found. |

### 2.1 Google Sheet structure (source of truth)

Tab `Guests` (you own it, I only add columns):

| Column | Example | Filled by |
|---|---|---|
| Guest / Household | "Mr. & Mrs. Dela Cruz" | you |
| Contact (phone / email / FB) | 0917… | you |
| Allowed seats | 2 | you |
| Side / Group | Bride · Groom · Sponsors | you (optional) |
| **Token** | `k7Qm2xP9` | generated once by script (random, not guessable) |
| **Invite link** | `https://…/?i=k7Qm2xP9` | formula |
| **RSVP** | `YES` / `NO` / blank | written by the site |
| **Seats confirmed** | 2 | written by the site |
| **Guest names attending** | "Juan, Maria" | written by the site (optional) |
| **Message to couple** | free text | written by the site |
| **Responded at** | timestamp | written by the site |
| Link opened at | timestamp | written by the site (optional, tells you who has seen it) |

A second tab `Log` keeps every submission (append-only) so a changed answer never loses history. A `Config` tab holds RSVP deadline and the on/off switch.

### 2.2 Apps Script behaviour

- `doGet(?i=TOKEN)` → returns the guest's display name, allowed seats, current RSVP. Returns nothing useful for an unknown token.
- `doPost` → validates token, Yes/No, seats ≤ allowed, strips `= + - @` prefixes (formula injection), takes a `LockService` script lock, updates the guest row, appends to `Log`, optionally emails you (Gmail quota: 100 recipients/day on a free account, fine for a wedding).
- A guest can re-open the link and change their answer until the deadline; the newest answer wins.
- Honeypot field + token requirement + deadline check stop junk submissions.

Known Apps Script quirks and how they are handled:

- **CORS**: the browser sends the POST with a `text/plain` body so no preflight is issued; Apps Script answers through a redirect that carries `Access-Control-Allow-Origin: *`. This is the documented-by-practice pattern used by all the templates reviewed; it will be verified in step 1 of the build with a real test before any design work.
- **Deployment URL**: editing the *existing* deployment to a new version keeps the same `/exec` URL. Creating a *new* deployment changes it. The build notes will say which to click.
- **Access setting** must be "Anyone" (not "Anyone with a Google account"), otherwise guests get a Google sign-in page.
- Quotas that matter (consumer Gmail account): 20,000 URL fetches/day, 30 simultaneous executions per user, 6-minute runtime per call. A few hundred guests over weeks is nowhere near these.

### 2.3 Repo layout

```
wedding_invitation/
├── src/                 # page, styles, scripts
│   └── invitation.config.js   # names, date, venues, dress code, copy — single file to edit
├── public/              # photos, OG image, favicon, .ics file
├── apps-script/
│   └── Code.gs          # paste into the Sheet's Apps Script editor
├── tests/               # Playwright (phone-sized Chromium + WebKit) + unit tests
├── .github/workflows/   # lint + test + deploy to GitHub Pages
└── docs/                # this plan, setup guide for the Sheet + Apps Script
```

## 3. Features

### MVP (must ship)

1. **Hero / cover** with names, date, monogram or photo, and an "Open invitation" moment (envelope or fade). Optional background music with a visible mute button.
2. **Personalized greeting** from the token ("Dear Mr. & Mrs. Dela Cruz, we reserved 2 seats for you").
3. **Event details**: ceremony and reception, date, time, venue, address, embedded or linked Google Map, "Add to Calendar" (Google + `.ics`).
4. **Countdown** to the ceremony.
5. **RSVP form**: Yes / No, seats (capped at allowed), names of those attending, message; confirmation screen; editable until the deadline; closed state after the deadline.
6. **Dress code** with colour swatches (palette chips are very common in Philippine invitations).
7. **Entourage / wedding party**: parents, principal sponsors (ninong/ninang), secondary sponsors, bridesmaids, groomsmen, etc. Collapsible so it doesn't dominate the page.
8. **Link preview for Messenger / Viber / WhatsApp**: `og:title`, `og:description`, 1200×630 PNG/JPG `og:image`. In the Philippines most invites are sent through Messenger, so this is the first thing guests see.
9. **Mobile-first, fast, accessible**: single column, big tap targets, works without JavaScript for reading (RSVP needs JS), reduced-motion respected, WCAG AA contrast.
10. **noindex** so the page doesn't show up in search.

### Nice to have (pick what you want)

- Photo gallery / prenup photos (lazy-loaded, compressed).
- "Our story" timeline.
- FAQ (parking, kids, unplugged ceremony, gift note / "your presence is enough", GCash QR if you want it).
- Hashtag and social links.
- Program timeline for the day.
- Reminder sender: a script button in the Sheet that lists who hasn't answered, with their links ready to copy into Messenger.
- RSVP dashboard tab in the Sheet (counts by Yes/No/pending, seats confirmed) — plain formulas, no code.
- English / Tagalog toggle.
- QR code image for the printed invite (points at the same site).

## 4. Hosting options compared (all free tiers verified against official docs on 2026-10-28)

| Host | Free tier | Custom domain + HTTPS | Fit |
|---|---|---|---|
| **GitHub Pages** | 1 GB site, 100 GB/mo bandwidth (soft), 10 builds/hr (soft; unlimited via Actions) | Yes, automatic Let's Encrypt | **Recommended.** Repo is already here; one Actions workflow deploys on push. Note: a Pages site is public even if the repo is private, and Pages on a *private* repo needs a paid GitHub plan, so the repo should be public (no guest data lives in the repo, only in the Sheet). |
| Cloudflare Pages | 500 builds/mo, 20k files, 25 MiB/file, unmetered static bandwidth | Yes, 100 domains/project | Excellent backup; also fine as primary if you prefer Cloudflare DNS. |
| Vercel Hobby | 100 GB transfer, 1M function invocations, 50 domains | Yes | Fine, but "non-commercial personal use" terms and the Vercel connector in this workspace is not signed in. Only needed if we go with Option B. |
| Netlify Free | 300 credits/mo credit model (bandwidth 20 credits/GB, 15 credits per production deploy) | Yes | Workable but the credit model is easy to exhaust with frequent deploys; not recommended. |

Domain: a free `username.github.io/wedding_invitation` URL works out of the box. A custom domain (e.g. `juanandmaria.ph` or a `.com`) costs money (roughly ₱600–1,500/year) and is optional; it only makes the link prettier.

## 5. Alternatives considered

| Option | Summary | Verdict |
|---|---|---|
| **A. Static + Apps Script (above)** | Site on GitHub Pages, Apps Script writes to the Sheet | **Recommended.** Zero cost, zero servers, Sheet stays the source of truth. |
| B. Static + serverless function + Sheets API | A Vercel/Cloudflare function holds a Google service-account key and writes to the Sheet through the official API | Proper CORS, secrets in env vars, more robust. Costs: a Google Cloud project, a service account, sharing the Sheet with it, and a Vercel/Cloudflare account. Worth it only if Apps Script's CORS quirk fails in testing. |
| C. Supabase as database, sync to Sheet | Supabase (already connected here) stores RSVPs; a script copies them to the Sheet | Two sources of truth and an extra moving part for no benefit here. Not recommended. |
| D. Google Form (prefilled per guest) embedded in the page | Zero code backend | Can't write Yes/No into the guest's row (responses land in a separate tab, needs lookup formulas), looks like a form not an invitation, and guests can type any name. Fallback only. |
| E. Ready-made services (Zola, RSVPify, Joy, Canva sites) | Hosted builders | Fast, but RSVPs live in their system, not your Sheet, and personalised links or exports are often paid. Not what you asked for. |

Open-source templates reviewed for reuse of ideas (not copied wholesale):

- `lfrocharod/wedding-invitation-template` (MIT, Vite + vanilla JS + SCSS, Apps Script RSVP, envelope intro, music, countdown, calendar, honeypot, LockService, Playwright tests, GitHub Pages CI). Closest to the recommended stack. Its RSVP is free-text name, not token-gated; we add the token lookup.
- `doug144/open-sheet-rsvp` (GPL-3, Apps Script + Sheets, guests pre-listed with a `Group_ID` in the URL, household RSVPs, admin page). Best model for the token-per-household idea; GPL licence means we borrow the design, not the code.
- `rampatra/wedding-website` (GPL-3, ~1.8k stars, Sheets RSVP, map, calendar). Older jQuery stack; useful for feature checklist only.
- `andyool/WeddingRSVP` (no licence, personal links with the name in the URL fragment, reply tokens). Idea reference only.

## 6. Skills and tools to use in this workspace

Already enabled here:

- **frontend-design** (install: anthropics/skills) — for a distinctive, non-template look. Recommended to install before the design pass.
- **theme-factory** — quick palette/typography themes to choose from before custom design.
- **canvas-design** — monogram, OG preview image, printable QR card.
- **google-workspace** — to set up the Sheet columns, the `Log`/`Config` tabs and the dashboard formulas.
- **dataviz** — only if you want a visual RSVP dashboard; Sheet formulas may be enough.
- **artifact-design** — for a clickable design mock-up you can approve before I build the real page.
- **/run** + Playwright (preinstalled) — phone-sized screenshots and end-to-end tests of the RSVP flow.
- **/security-review** and **/code-review** — before go-live.
- **docs** — if you want this plan as a shareable doc instead of Markdown.

Not needed: Supabase connector (Option C only), Vercel connector (Option B only, and not signed in).

## 7. Build plan (phased)

| Phase | What | You get | Needs from you |
|---|---|---|---|
| 0. Decisions | Answer the questions in §8 | — | 15 minutes |
| 1. Backend spike (½ day) | `Code.gs` + Sheet columns + token generator; prove GET/POST from a GitHub Pages test page works on a phone | Working RSVP endpoint | Share the guest Sheet (or let me create a template Sheet in your Drive) |
| 2. Design pass (½–1 day) | Theme choice, mock-up of hero/RSVP/details, OG image | Visual to approve | Names, date, venue, colours/motif, 3–5 photos |
| 3. Build MVP (1–2 days) | All §3 MVP features, config file, tests, Actions deploy | Live site on `*.github.io` | Entourage list, dress code, copy |
| 4. Polish + nice-to-haves (1 day) | Gallery, FAQ, music, reminders script, dashboard | Final site | Your picks from §3 |
| 5. Go-live checklist | Security/code review, Messenger/Viber preview test, deadline set, send 3 test invites to family | Launch | Custom domain if wanted |

## 8. Decisions needed from you

1. **Couple names, wedding date, ceremony + reception venues** (addresses and times).
2. **The guest Sheet**: share it with the account used here, or should I create a fresh template Sheet in your Drive with the columns above? (I could not find one named guest/wedding/RSVP in your Drive.)
3. **RSVP rules**: one row per household or per person? Are plus-ones allowed beyond the seats you set? RSVP deadline?
4. **Distribution**: Messenger / Viber / SMS / printed QR? (affects OG image and QR card work)
5. **Design direction**: colours, motif (e.g. floral, minimalist, Filipiniana), fonts you like, any peg invitations.
6. **Language**: English only, or English + Tagalog?
7. **Domain**: free `github.io` URL or buy a custom domain?
8. **Repo visibility**: OK to keep this repo public (required for free GitHub Pages)? No guest data will be committed.
9. **Nice-to-haves** from §3 you want in scope.

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Apps Script CORS behaviour changes | Verified first in Phase 1; Option B kept as fallback. |
| Guest shares their personal link with someone else | Token only unlocks that household's seats; seats are capped; you can void a token by regenerating it in the Sheet. |
| Duplicate / racing submissions | `LockService` lock + append-only `Log` + "newest wins". |
| Formula injection via the message field | Inputs starting with `= + - @` are stored as text. |
| Apps Script URL changes on redeploy | Documented "edit deployment → new version" step; URL kept in one config constant. |
| Email notification limit | 100/day on free Gmail; notifications are optional and batched. |
| Public repo | Only code and the couple's public content; guest list, tokens and responses stay in the Sheet. |
