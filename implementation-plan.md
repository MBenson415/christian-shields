# Implementation Plan — Fan Signup, Assist Agent, Ticketing, Admin

Scope reflects answers from planning:
- Events: reuse existing `dbo.Event` table (filtered to `BAND_ID = 1` for Christian Shields). Bandsintown stays as the public display source; `Event` powers ticketing + fan-signup `Event_Id` lookup.
- Fans: existing `CHRISTIAN_SHIELDS_MEMBERS` already renamed to `cs_fans` — schema additions below.
- SMS: TCPA-safe double opt-in via Twilio.
- Agent training: in-app system-prompt editor backed by DB.

---

## Phase 0 — Foundation

### 0.1 Schema migrations

**`cs_fans` — existing columns (keep, reuse):**
`Id`, `name`, `address`, `state`, `zip` (INT), `country`, `email`, `is_email_subscribed`, `subscription_tier`, `member_username`, `created`, `modified`, `password_hash`.

Notes on reuse:
- `name` covers the NFC form's "name" field — no need for a separate `full_name`.
- `zip` is `INT`. Migrate to `NVARCHAR(10)`.
- `address`, `state`, `country` exist but the NFC form won't ask for them (friction); they stay NULL for fan-only rows. Members can fill them later via account settings if needed.

**`cs_fans` — columns to add:**

| Column | Type | Notes |
|---|---|---|
| `phone` | NVARCHAR(20) NULL | E.164 format |
| `is_sms_subscribed` | BIT NOT NULL DEFAULT 0 | Form checkbox state |
| `sms_confirmed` | BIT NOT NULL DEFAULT 0 | Flipped after YES reply |
| `sms_confirmed_at` | DATETIME NULL | |
| `sms_consent_text` | NVARCHAR(500) NULL | Snapshot of consent language shown at signup (compliance evidence) |
| `email_confirmed` | BIT NOT NULL DEFAULT 0 | |
| `email_confirmed_at` | DATETIME NULL | |
| `email_confirm_token` | NVARCHAR(64) NULL | Single-use, short-lived |
| `ip_address` | NVARCHAR(45) NULL | IPv6-safe |
| `geo_lat` | DECIMAL(9,6) NULL | Browser-consented coords |
| `geo_lng` | DECIMAL(9,6) NULL | |
| `geo_consent_at` | DATETIME NULL | |
| `signup_event_id` | INT NULL FK → `dbo.Event.ID` | Best-guess show at signup time |
| `signup_source` | NVARCHAR(20) NOT NULL DEFAULT 'web' | 'nfc' \| 'web' \| 'subscribe' \| 'register' |

Add a filtered unique index on `phone` (`WHERE phone IS NOT NULL`).

**Reuse: `dbo.Event`** — existing schema is sufficient for admin CRUD:
```
ID INT IDENTITY PK
BAND_ID INT NULL              -- 1 = Christian Shields
VENUE_ID INT NULL             -- FK → dbo.Venues (assumed; confirm)
DATE datetime2 NOT NULL
TICKET_LINK varchar           -- external/Bandsintown ticket URL (fallback when no Stripe ticket)
FACEBOOK_LINK varchar
PROMO nvarchar                -- promo copy the agent can quote
NAME nvarchar                 -- event name
```
Admin CRUD operates only on rows where `BAND_ID = 1`. No additions needed unless we hit gaps mid-build (e.g., a `SET_TIME` column for the agent — flag if it comes up).

**Reuse: `dbo.Venue`** — existing schema covers the admin event editor's venue picker:
```
ID INT PK
NAME varchar
STREET nvarchar
ADDRESS nvarchar NOT NULL
CITY nvarchar
STATE varchar(2)
ZIP int
COUNTRY varchar
GOOGLE_MAPS_LINK nvarchar
```
Admin event form: venue field is a typeahead over `Venue.NAME` with an inline "Add new venue" mini-form (NAME, ADDRESS required; rest optional). New `api/AdminVenues` endpoint for list/create.

**New tables:**

```
Tickets
  ID INT IDENTITY PK
  BAND_ID INT NOT NULL                -- denormalized so non-CS bands can be filtered without joining Event
  EVENT_ID INT NOT NULL FK → dbo.Event.ID
  STRIPE_PRODUCT_ID NVARCHAR(50) NOT NULL
  STRIPE_PRICE_ID NVARCHAR(50) NOT NULL
  PRICE_CENTS INT NOT NULL
  LABEL NVARCHAR(100) NOT NULL        -- "General Admission", "VIP"
  IS_ACTIVE BIT NOT NULL DEFAULT 1
  CREATED DATETIME NOT NULL DEFAULT GETDATE()

  -- App writes BAND_ID = Event.BAND_ID at insert time. Optional CHECK/trigger to enforce.
  -- Indexes: (BAND_ID, IS_ACTIVE), (EVENT_ID).

cs_sms_log                            -- Twilio audit trail
  Id INT IDENTITY PK
  fan_id INT NULL FK → cs_fans.Id
  phone NVARCHAR(20) NOT NULL
  direction NVARCHAR(10) NOT NULL     -- 'out' | 'in'
  body NVARCHAR(1600) NOT NULL
  twilio_sid NVARCHAR(50) NULL
  created DATETIME NOT NULL DEFAULT GETDATE()

cs_agent_prompts                      -- versioned system prompts
  Id INT IDENTITY PK
  prompt_text NVARCHAR(MAX) NOT NULL
  notes NVARCHAR(500) NULL
  is_active BIT NOT NULL DEFAULT 0    -- exactly one active row
  created_by NVARCHAR(120) NOT NULL   -- admin email
  created DATETIME NOT NULL DEFAULT GETDATE()

cs_agent_conversations                -- chat + SMS transcripts
  Id INT IDENTITY PK
  channel NVARCHAR(10) NOT NULL       -- 'web' | 'sms'
  fan_id INT NULL FK → cs_fans.Id
  session_key NVARCHAR(64) NOT NULL   -- web session id or phone
  prompt_id INT NULL FK → cs_agent_prompts.Id
  started DATETIME NOT NULL DEFAULT GETDATE()

cs_agent_messages
  Id INT IDENTITY PK
  conversation_id INT NOT NULL FK → cs_agent_conversations.Id
  role NVARCHAR(10) NOT NULL          -- 'user' | 'assistant' | 'tool'
  content NVARCHAR(MAX) NOT NULL
  flagged BIT NOT NULL DEFAULT 0      -- admin review
  created DATETIME NOT NULL DEFAULT GETDATE()
```

Deliver migrations as a single SQL script committed under `api/sql/001_fan_agent_ticketing.sql`.

### 0.2 Secrets / env additions

Add to `api/local.settings.json` and Azure SWA app settings:
- `ANTHROPIC_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `GOOGLE_OAUTH_CLIENT_ID` (for admin login)
- `ADMIN_ALLOWLIST` = `benson.marshall@gmail.com,christianshields23@gmail.com`
- `PUBLIC_SITE_URL` (for email confirm links)

> Note: `api/local.settings.json` currently contains a live Stripe key and SQL password in plaintext. Confirm this file is gitignored before adding more secrets. (Quick check needed during Phase 0.)

---

## Phase 1 — Fan Signup Page (NFC landing)

**Route:** `/join` (short, NFC-friendly URL).

**Frontend (`src/pages/Join.jsx` + `Join.css`):**
- Mobile-first single-column form, large tap targets.
- Fields with `autocomplete` attrs for browser autofill:
  - `name` → `autocomplete="name"`
  - `email` → `autocomplete="email"` + `inputmode="email"`
  - `phone` → `autocomplete="tel"` + `inputmode="tel"`
  - `zip_code` → `autocomplete="postal-code"` + `inputmode="numeric"`
- Two distinct consent checkboxes (NOT pre-checked) with explicit TCPA-compliant copy near the SMS box (msg & data rates, frequency, STOP/HELP).
- Browser geolocation prompt fires only after the user taps submit, with a "share location?" explainer; signup proceeds with or without consent.
- On submit → `POST /api/JoinFan`.
- Success screen: "Check your phone for a confirmation text" (if SMS opted in) and "Check your email" (if email opted in).

**API: `api/JoinFan/index.js`** (new):
1. Validate inputs (email regex, US phone normalize to E.164, zip 5-digit).
2. Capture `ip_address` from `x-forwarded-for` (Azure SWA sets this) → fallback `req.headers['client-ip']`.
3. Look up most-likely `signup_event_id`: nearest `dbo.Event.DATE` (where `BAND_ID = 1`) to `GETDATE()` within ±2 days (configurable).
4. UPSERT into `cs_fans` keyed on email (and phone, if email absent). Store consents + `sms_consent_text` snapshot.
5. If `is_email_subscribed`: generate `email_confirm_token`, send confirm email via existing Resend SMTP (`SMTP_*` already set).
6. If `is_sms_subscribed`: send Twilio SMS "Reply YES to confirm…"; log to `cs_sms_log`.
7. Return `{ fanId, needsSmsConfirm, needsEmailConfirm }`.

**API: `api/TwilioInbound/index.js`** (new, webhook):
- Twilio posts inbound SMS here.
- If body matches `YES|Y|CONFIRM` → flip `sms_confirmed = 1`, `sms_confirmed_at = GETDATE()` on the fan whose phone matches; reply "You're in. Reply STOP to opt out."
- If body matches `STOP|UNSUBSCRIBE` → flip `is_sms_subscribed = 0`; Twilio handles the suppression list automatically but mirror locally.
- Always log inbound to `cs_sms_log`.
- Configure Twilio number's SMS webhook to `https://<site>/api/TwilioInbound`.

**API: `api/ConfirmEmail/index.js`** (new):
- `GET /api/ConfirmEmail?token=...` → flip `email_confirmed = 1`, clear token, redirect to a `/email-confirmed` page.

**Acceptance:**
- NFC tap on a phone hits `/join`, autofill works for all four fields, both consent flows complete end-to-end in a real-device test.

---

## Phase 2 — Admin (Google login, fans + events + ticketing)

### 2.1 Admin auth

- Add Google Identity Services (`gsi/client`) script on a new `/admin` route.
- New API `api/AdminLogin/index.js`:
  - Verify Google ID token using `google-auth-library`.
  - Check email against `ADMIN_ALLOWLIST` env var.
  - Issue a JWT with `role: 'admin'` scope (1h expiry).
- Shared `requireAdmin(req)` helper in `api/_shared/auth.js` (new) — used by every admin endpoint.

### 2.2 Admin UI (`src/pages/admin/*`)

Routes under `/admin/*`, protected client-side by `AdminContext` and server-side by `requireAdmin`:
- `/admin` — dashboard
- `/admin/fans` — read-only paginated table; columns: name, email, phone, zip, opt-ins, sms_confirmed, signup_event, source, created. CSV export.
- `/admin/events` — list + CRUD form against `dbo.Event` filtered to `BAND_ID = 1` (fields: NAME, DATE, VENUE_ID via typeahead → `dbo.Venue`, TICKET_LINK, FACEBOOK_LINK, PROMO).
- `/admin/venues` — light CRUD on `dbo.Venue` (also accessible via the inline "Add venue" form on the event editor).
- `/admin/events/:id/tickets` — add ticket tier (label + price) → creates Stripe product/price via API → stores `Tickets` row keyed to `Event.ID` (and `BAND_ID` copied from the parent event). When a Stripe ticket exists, public Tour page prefers it over `Event.TICKET_LINK`.
- `/admin/agent` — see Phase 4.

### 2.3 New admin APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/AdminFans` | GET | Paginated fan list (admin only) |
| `/api/AdminEvents` | GET/POST/PUT/DELETE | Event CRUD (scoped to `BAND_ID = 1`) |
| `/api/AdminVenues` | GET/POST/PUT | Venue list + create + edit |
| `/api/AdminTickets` | POST/DELETE | Create/disable ticket tier; calls Stripe `products.create` + `prices.create` |
| `/api/AdminAgentPrompt` | GET/POST | List versions, save new active prompt |
| `/api/AdminAgentConversations` | GET | Paginated transcripts for review |

---

## Phase 3 — Public ticketing on Tour page

- `TourDates.jsx` continues fetching Bandsintown for display.
- Additionally fetch `/api/PublicTickets?bandId=1` once on page load → returns all active tickets for that band (`Tickets.BAND_ID = 1`, joined to `Event`, future dates only).
- Match each Bandsintown event to a DB event by `DATE` + venue name (loose match) or `Event.NAME`. If matched and a `Tickets` row exists, render a "Buy Tickets" button → `CreateCheckoutSession` (`mode: 'payment'`, ticket's `STRIPE_PRICE_ID`). Otherwise fall back to Bandsintown's offer link or `Event.TICKET_LINK`.
- New API `api/PublicTickets/index.js` — joins `dbo.Event` + `Tickets`, filters by `BAND_ID` query param, returns active tiers.

---

## Phase 4 — Fan Assist Agent

### 4.1 Backend

**API: `api/AgentChat/index.js`** (new):
- Loads active `cs_agent_prompts` row.
- Calls Anthropic API (`@anthropic-ai/sdk`, model `claude-sonnet-4-6` for cost/latency) with tool use enabled. Tools:
  - `lookup_events(date_range?)` — `dbo.Event WHERE BAND_ID = 1` JOIN `dbo.Venue` (returns name, date, city, state, address, google maps link, promo)
  - `lookup_tickets(event_id)` — query `Tickets` + return Stripe checkout URLs (falls back to `Event.TICKET_LINK`)
  - `lookup_merch()` — `stripe.products.list({ active: true })`
  - `get_band_info()` — static blob editable in admin (store as a row in `cs_agent_prompts` or separate `cs_agent_facts` table — decision in 4.4)
- Persists conversation + messages to `cs_agent_conversations` / `cs_agent_messages`.
- Returns assistant reply.

**Add dependency:** `@anthropic-ai/sdk` to `api/package.json`. Use prompt caching on the system prompt (`cache_control: { type: 'ephemeral' }`) since it'll be reused across every conversation — meaningful cost savings.

**API: `api/AgentSms/index.js`** (Twilio webhook for general SMS, not the YES/STOP path):
- Same agent loop, channel = `sms`. Twilio number routes:
  - Body matches `YES|STOP|HELP` → `TwilioInbound` (Phase 1).
  - Everything else → `AgentSms`.
  - Simplest: single webhook that branches by body.
- Reply via Twilio TwiML; chunk messages over 1600 chars.

### 4.2 Frontend chat widget

- New `src/components/AgentChat.jsx` — floating bottom-right chat bubble across the site (or just on Home/Tour/Store).
- Stores session_key in localStorage; sends to `/api/AgentChat`.

### 4.3 Admin agent UI (`/admin/agent`)

- **Prompt editor:** textarea bound to `cs_agent_prompts.prompt_text`, "Save as new active version" button. Version history list (rollback by setting `is_active`).
- **Test pane:** ephemeral chat that uses the unsaved draft prompt (not yet active in DB).
- **Conversation review:** list of recent `cs_agent_conversations`; click → see messages; "flag" toggle on bad responses for future evaluation.

### 4.4 Open design questions to confirm before building

- **Band facts source:** keep band/merch facts in the system prompt itself, or split into a `cs_agent_facts` table the agent reads via a tool? Recommend the latter — easier to update without re-versioning the whole prompt.
- **Model choice:** Sonnet 4.6 is the right default; Opus for occasional admin "test" runs if quality matters more than cost.
- **Streaming:** want streamed responses in the web widget? (Better UX; small implementation cost via SSE.) SMS can't stream.

---

## Suggested PR ordering (small, reviewable units)

1. **Phase 0 migrations** — SQL script only, no code change.
2. **Phase 1 fan signup** (no Twilio yet) — form + DB write + email confirm. Validates schema end-to-end.
3. **Phase 1 Twilio double opt-in** — adds outbound + inbound webhook.
4. **Phase 2.1 admin auth scaffold** — Google login + `requireAdmin` + empty `/admin` shell.
5. **Phase 2.2 fan list + event CRUD.**
6. **Phase 2.3 + Phase 3 ticketing** — Stripe ticket products + public buy button.
7. **Phase 4 agent (chat only).**
8. **Phase 4 agent (SMS channel + admin review).**

---

## Risks / things to verify early

- `api/local.settings.json` contains live secrets — confirm `.gitignore` excludes it before this branch grows.
- Azure SWA Functions cold-start latency may hurt the chat widget's first message; consider keepalive ping or migrate the agent endpoint to a different host if it's bad.
- TCPA: the SMS consent checkbox copy needs legal review; I'll draft it but you should approve before launch.
- Geolocation accuracy on mobile browsers is inconsistent — IP geo as fallback is worth adding even though it's coarser.
- Stripe ticketing as one-time products means refunds/voids are manual. Confirm that's acceptable, or plan a refund flow.
