# Deal Breakers -- Handover Document

**Purpose:** Complete specification for rebuilding Deal Breakers as a Progressive Web App on WordPress using Claude AI.

**Current live URL:** https://dealbreakers.co.za
**Repository:** https://github.com/prep-tech/deal-breakers
**Current stack:** React 18 + Vite 5 + Supabase + Vercel + Resend

---

## 1. What Deal Breakers Is

A structured couples relationship tool where two partners work through rounds of behavioural requests. One partner asks the other to START a behaviour and STOP a behaviour. The other partner responds (Accept / Compromise / Reject), writes an action plan with a deadline, and both receive daily check-in emails until the review date.

**Core premise:** "Deal breakers are the presence or the lack of specific actions or behaviours that one or both partners find intolerable. Left unchecked, they become the root of irreparable damage to the relationship."

**Positioning:** Not couples therapy. A structured exercise for couples who want to have difficult conversations without arguments. Works alongside a counsellor or independently. Free, no subscription.

---

## 2. User Flow (Complete)

### 2.1 Sign-Up and Invite

1. Partner A signs up (name, email, password).
2. A profile is auto-created via database trigger.
3. Partner A lands on their dashboard and sees the "Invite Your Partner" form.
4. Partner A enters Partner B's email. A partnership row is created (status: pending) with a 48-character hex invite token.
5. Partner B receives an email with a branded invite link: `https://dealbreakers.co.za?token=<48-char-hex>`.
6. The landing page detects `?token=` in the URL and redirects to `/app?token=<token>`.
7. Partner B sees a "You've been invited" sign-up form showing Partner A's name.
8. On sign-up, Partner B's account is created, then the `accept_invite` RPC function is called which: sets `partner_b_id`, sets partnership status to `active`, and backfills `responder_id` on any draft rounds.
9. If Partner B already has an account and a session, the invite is auto-accepted on page load (no duplicate sign-up form shown).

### 2.2 Drafting Before Partner Accepts

- Partner A can start drafting rounds immediately after sending the invite (even while the invite is still pending).
- Draft rounds have `responder_id = NULL`.
- Partner A can fill in START and STOP requests but CANNOT submit until Partner B accepts the invite.
- The submit button shows "AWAITING PARTNER" when `responder_id` is null.
- When Partner B accepts, `accept_invite` backfills the `responder_id` on all draft rounds.

### 2.3 Invite Revocation

- While the invite is pending, Partner A can revoke it.
- Revoking deletes the partnership row (and cascades to any draft rounds).
- A confirmation dialog is shown before revoking.

### 2.4 Starting a Round

- Either partner can start a round.
- Two buttons: "I GO FIRST" (current user is requester) or "[PARTNER NAME] GOES FIRST" (partner is requester).
- A round row is created with status `draft`.

### 2.5 Creating a Round (3-Step Stepper)

**Step 1 -- START Request:**
- Template shown: "I need you to [action] by [deadline] in order to [reason]. It is important to me because [motivation]. If this does not happen, [consequence]."
- Partner writes their specific START request in a textarea.
- Saved to `rounds.start_request`.

**Step 2 -- STOP Request:**
- Template shown: "I need you to STOP [behaviour] by [deadline] in order to [reason]. It is important to me because [motivation]. If this does not happen, [consequence]."
- Partner writes their specific STOP request in a textarea.
- Saved to `rounds.stop_request`.

**Step 3 -- Review and Submit:**
- Both requests shown for review.
- If partner hasn't accepted invite yet, a warning is shown: "Waiting on your partner -- your invite is still pending."
- Submit button is disabled until `responder_id` is set.
- On submit: status changes to `submitted`, an email is sent to the responder.

### 2.6 Responding to a Round

The responder sees each request and has three options per request:

- **Accept** -- writes an action plan (specific steps) and sets a deadline date.
- **Compromise** -- writes a compromise description, action plan, and deadline.
- **Reject** -- writes a reason for rejection.

Response choices are stored as `accepted`, `compromised`, or `rejected` in `start_response` and `stop_response`.

On submit: status changes to `in_progress` (if any deadline is set) or `responded` (if no deadlines). Email is sent to the requester. If a deadline exists, daily check-in emails are triggered for both partners.

### 2.7 Viewing a Round

Both partners can view the full round details: both requests, both responses, action plans, deadlines, and compromise/rejection text.

### 2.8 Review (on Deadline Date)

A guided review process for each request (START and STOP):

1. "Was this request fulfilled by the deadline?" -- Yes / No
2. If No: "Did your partner take reasonable steps to try?" -- Yes / No
3. If No (didn't try): Warning -- "Worth discussing honestly, possibly with a counsellor."
4. If Yes (tried but not fulfilled): "Are you willing to give them another opportunity?" -- Yes (restart) / No
5. If Yes (restart): Suggestion to rephrase and set a new deadline.
6. If No (not willing): Warning about incompatibility, suggest professional support.

After review: round status changes to `complete`. Email sent to both partners.

### 2.9 Next Round

After completing a round, partners swap roles. The previous responder becomes the requester for the next round.

### 2.10 Password Reset

- "Forgot password?" link on login form.
- Sends Supabase password reset email with `?type=recovery` redirect.
- Landing page detects `?type=recovery` and redirects to `/app?type=recovery`.
- App shows a "Reset Your Password" form.

### 2.11 Logout

Signs out and redirects to the landing page (`/`).

---

## 3. Database Schema

### 3.1 Tables

```sql
-- profiles (auto-created via trigger on auth.users insert)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- partnerships
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_b_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invite_email TEXT,
  invite_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- rounds (responder_id is nullable for drafts before partner accepts)
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_request TEXT,
  start_response TEXT CHECK (start_response IN ('accepted','compromised','rejected')),
  start_compromise_text TEXT,
  start_final_request TEXT,
  start_action_plan TEXT,
  start_deadline DATE,
  stop_request TEXT,
  stop_response TEXT CHECK (stop_response IN ('accepted','compromised','rejected')),
  stop_compromise_text TEXT,
  stop_final_request TEXT,
  stop_action_plan TEXT,
  stop_deadline DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','responded','in_progress','review','complete')),
  round_number INT NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reminders (for future daily check-in scheduling)
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL
    CHECK (reminder_type IN ('daily_checkin','deadline_review')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Trigger: Auto-Create Profile on Sign-Up

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3.3 Function: Accept Invite (SECURITY DEFINER)

This function bypasses RLS to atomically accept an invite. It is critical because the invited partner cannot read/update the partnership row via normal RLS (their `partner_b_id` is still NULL).

```sql
CREATE OR REPLACE FUNCTION public.accept_invite(
  invite_token_param TEXT,
  accepting_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Link partner B and activate the partnership
  UPDATE public.partnerships
  SET partner_b_id = accepting_user_id,
      status = 'active',
      invite_token = NULL
  WHERE invite_token = invite_token_param
    AND status = 'pending';

  -- Backfill responder_id on any draft rounds created before acceptance
  UPDATE public.rounds
  SET responder_id = accepting_user_id
  WHERE partnership_id IN (
    SELECT id FROM public.partnerships
    WHERE partner_b_id = accepting_user_id
  )
  AND responder_id IS NULL
  AND status = 'draft';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.4 Row Level Security (RLS) Policies

RLS is enabled on all four tables.

**profiles:**
- `profiles_own` (ALL): `auth.uid() = id` -- users can read/update their own profile.
- `Read partner profiles` (SELECT): allows reading your partner's profile via a subquery on partnerships (where you are partner_a or partner_b).

**partnerships:**
- `partnerships_members` (ALL): `partner_a_id = auth.uid() OR partner_b_id = auth.uid()`.
- `partnerships_insert_own` (INSERT): `partner_a_id = auth.uid()`.
- `Read pending invites by token` (SELECT): `invite_token IS NOT NULL AND status = 'pending'` -- allows unauthenticated partner to see the invite (to display the inviter's name).

**rounds:**
- Visible to members of the partnership (via subquery joining partnerships).

**reminders:**
- Visible to members of the round's partnership (via subquery).

---

## 4. Edge Function: send-email

A Supabase Edge Function (Deno) that sends transactional emails via Resend. Deployed at: `https://gkbnqshixwewkmyfypjy.supabase.co/functions/v1/send-email`

### Authentication
- Accepts either `x-internal-secret` header OR a valid Supabase `Authorization: Bearer <token>` header.
- JWT verification is disabled at the function level (handled manually in code).

### Email Types

| Type | Recipient | Subject | CTA Button |
|------|-----------|---------|------------|
| `invite` | Partner B (inviteEmail) | "[Name] has invited you to Deal Breakers" | ACCEPT INVITATION |
| `round_submitted` | Responder | "[Name] submitted their Deal Breakers requests" | VIEW & RESPOND |
| `response_received` | Requester | "[Name] responded to your Deal Breakers requests" | VIEW RESPONSE |
| `daily_checkin` | Both partners | "Daily check-in -- Deal Breakers with [Name]" | VIEW COMMITMENTS |
| `deadline_review` | Both partners | "Review time -- Deal Breakers deadline reached" | COMPLETE REVIEW |

### Email Template
All emails use a consistent branded wrapper:
- Purple gradient header (`#A06CD5` to `#7B4FA8`)
- Montserrat font
- "A FRAMEWORK FOR HONEST CONVERSATION" tagline
- Purple CTA button
- Cream footer with privacy note

### Environment Variables (Supabase Edge Function Secrets)
- `RESEND_API_KEY` -- from Resend dashboard
- `FROM_EMAIL` -- `noreply@dealbreakers.co.za`
- `APP_URL` -- `https://dealbreakers.co.za`
- `INTERNAL_SECRET` -- `dev-secret` (or your chosen secret)
- `SUPABASE_URL` -- auto-provided by Supabase
- `SUPABASE_ANON_KEY` -- auto-provided by Supabase

### Graceful Degradation
If `RESEND_API_KEY` is not set, emails are logged to the console but not sent. The app continues to function normally.

---

## 5. Brand and Design System

### 5.1 Day Zero Brand Guide (Adapted for Deal Breakers)

**Primary colour:** Purple `#A06CD5`
**Dark purple:** `#7B4FA8`
**Font:** Montserrat (Google Fonts) -- weights 300, 400, 500, 600, 700, plus italic 400

### 5.2 Colour Palette

```
purple:     #A06CD5   (primary -- buttons, headings, accents)
darkPurple: #7B4FA8   (gradients, header backgrounds, footer)
dark:       #1a1a1a   (body text)
cream:      #F7F4EF   (page background, card backgrounds)
border:     #e0dcd7   (card borders, dividers)
start:      #3AAFB9   (START request accent -- teal)
stop:       #C60F7B   (STOP request accent -- magenta/pink)
green:      #22c55f   (accept response, success states)
blue:       #3AAFB9   (same as start, used for feature highlights)
```

### 5.3 Typography

- All text uses Montserrat.
- Section labels: `0.85rem`, `letter-spacing: 0.3em`, weight 700, purple colour, uppercase.
- Headings: `clamp(1.5rem, 4vw, 2rem)`, weight 600.
- Body: `1rem-1.12rem`, colour `#444`, line-height 1.6.
- Small labels: `0.68rem-0.8rem`, `letter-spacing: 0.15-0.25em`, weight 500-700.

### 5.4 Component Patterns

**Buttons:**
- Primary: purple background, white text, no border, `letter-spacing: 0.15em`, weight 600, border-radius 3px.
- Outline: white background, purple text, purple border.
- Full width on forms, small variant for inline actions.

**Cards:**
- White background, 1px border `#e0dcd7`, border-radius 4px, box-shadow `0 2px 12px rgba(0,0,0,0.06)`.
- Optional left border (3px coloured for START/STOP context).
- Padding: `clamp(1.2rem, 5vw, 1.8rem)`.

**Request blocks (ReqBlock):**
- Left border: 4px, teal for START, magenta for STOP.
- Background: cream `#F7F4EF`.
- Label: tiny uppercase with colour-coded icon (triangle up for START, triangle down for STOP).
- Text: italic, in quotes.

**Response pills (Accept/Compromise/Reject):**
- Three equal-width buttons in a row.
- Active states: Accept = green, Compromise = purple, Reject = muted rose `#C9A0A0`.

**Stepper:**
- Numbered circles (36x36) with connecting lines.
- Active step: filled background with white number.
- Completed step: filled background with checkmark.
- Future step: white background with grey border.

**Info/Warning/Success boxes:**
- InfoBox: purple top and bottom borders, italic text, centered.
- SuccessBox: green background `#EDF7ED`, green border.
- WarnBox: rose background `#FDF0F0`, rose border.

### 5.5 Gradients

- Header/Nav/Hero/CTA: `linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)`
- Round headers in dashboard: same gradient
- Footer: solid dark purple `#7B4FA8`

---

## 6. Page Structure

### 6.1 Landing Page (public, unauthenticated)

**URL:** `/` (dealbreakers.co.za)

**Sections in order:**
1. **Nav** -- purple gradient, logo "Deal Breakers", links: HOW IT WORKS, LOG IN (outline button), SIGN UP FREE (white button).
2. **Hero** -- purple gradient, tagline "A FRAMEWORK FOR HONEST CONVERSATION", title "Deal Breakers", subtitle, two CTAs (SIGN UP FREE, HOW IT WORKS), three value props (Free, Private, Structured).
3. **Premise quote** -- blockquote with purple left border.
4. **What Is Deal Breakers** -- heading + description + 6 feature cards (Shared Dashboard, START Requests, STOP Requests, Action Plans & Deadlines, Built-in Review, Email Notifications).
5. **How It Works** -- 5 numbered steps with fade-in-on-scroll animation.
6. **Inside The App** -- 3 mockup cards showing START request template, Partner B response, and Dashboard view. Gradient headers on each card.
7. **Who Is It For** -- 4 category cards with coloured top borders (Couples in Conflict, in Counselling, Rebuilding Trust, Proactive Couples).
8. **Final CTA** -- purple gradient section with "Start your first round today." and SIGN UP FREE button.
9. **Footer** -- dark purple background, "DEAL BREAKERS" + tagline.

**Behaviour:**
- If URL has `?token=` or `?type=recovery`, immediately redirects to `/app` with the same query string (landing page is skipped).
- SIGN UP FREE buttons navigate to `/app?tab=signup`.
- LOG IN button navigates to `/app?tab=login`.

### 6.2 App Page (authenticated)

**URL:** `/app`

**Views (state machine, no router library):**

| View | Condition | Shows |
|------|-----------|-------|
| `auth` | No session, no token | Login/Signup tabbed form |
| `invite-signup` | `?token=` present | "You've Been Invited" sign-up form |
| `reset-password` | `?type=recovery` | Password reset form |
| `dashboard` | Authenticated | Partnership status, round list, action buttons |
| `round-create` | Creating a round | 3-step stepper (Start, Stop, Submit) |
| `round-respond` | Responding to a round | Response form with Accept/Compromise/Reject |
| `round-view` | Viewing a round | Read-only round details |
| `round-review` | Reviewing on deadline | Guided review questionnaire |

**App header:** Purple gradient, "A FRAMEWORK FOR HONEST CONVERSATION", "Deal Breakers" title, italic subtitle.

---

## 7. Infrastructure Configuration

### 7.1 Supabase

- **Project ID:** `gkbnqshixwewkmyfypjy`
- **Region:** eu-west-1
- **Auth:** Email/password enabled, email confirmation DISABLED
- **Site URL:** `https://dealbreakers.co.za`
- **Redirect URLs:** `https://dealbreakers.co.za/**`, `https://www.dealbreakers.co.za/**`
- **Edge Functions:** `send-email` (JWT verification off)

### 7.2 Vercel

- **Framework:** Vite
- **Build command:** `npm install --prefer-offline=false && npm run build`
- **Output directory:** `dist`
- **Clean URLs:** enabled
- **Rewrites:** `/app` and `/app/(.*)` both serve `app.html`

### 7.3 Resend

- **Domain:** `dealbreakers.co.za` (verified)
- **From address:** `noreply@dealbreakers.co.za`
- **DNS records (Cloudflare):** MX, SPF (TXT), DKIM (CNAME x3) -- all configured and verified.

### 7.4 Cloudflare DNS

- Domain `dealbreakers.co.za` uses Cloudflare nameservers.
- CNAME records point to Vercel.
- Resend DNS records (MX, SPF, DKIM) are configured.

### 7.5 Environment Variables (Frontend / .env)

```
VITE_SUPABASE_URL=https://gkbnqshixwewkmyfypjy.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_INTERNAL_SECRET=dev-secret
```

---

## 8. Key Architectural Decisions and Why

### 8.1 Multi-Page Build Instead of SPA Router
**Decision:** Two separate HTML entry points (index.html for landing, app.html for app) instead of React Router.
**Why:** The landing page is a marketing page that should load fast and be fully SEO-indexed. The app is behind auth and should be noindex. Separating them avoids flash-of-wrong-content issues where the auth form would briefly show before the landing page rendered.

### 8.2 View State Machine Instead of URL Routing
**Decision:** A `useState('auth')` drives which view is shown in the app, not URL paths.
**Why:** Simplicity. The app has ~8 views but they don't need individual URLs (except deep links to specific rounds via `?round=<id>`). The state is resolved synchronously from URL params on mount.

### 8.3 SECURITY DEFINER Function for Invite Acceptance
**Decision:** `accept_invite()` runs as the database owner, bypassing RLS.
**Why:** When Partner B signs up and needs to accept an invite, their user ID is not yet in the partnership row (partner_b_id is NULL). RLS policies that check `partner_b_id = auth.uid()` would block them from updating the row. The SECURITY DEFINER function solves this chicken-and-egg problem atomically.

### 8.4 Nullable responder_id on Rounds
**Decision:** `rounds.responder_id` is nullable.
**Why:** Partner A can start drafting rounds before Partner B accepts the invite. When Partner B accepts, the `accept_invite` function backfills `responder_id` on all draft rounds. Submission is blocked until `responder_id` is set.

### 8.5 Token-Based Invites (Not Email Lookup)
**Decision:** 48-character hex token in the URL, not just an email match.
**Why:** Security. Anyone with the email could claim the invite if it was email-based. The token ensures only someone who received the invite email can accept it. Tokens are cleared after acceptance.

### 8.6 Auto-Accept on Existing Session
**Decision:** If Partner B already has a Supabase session when they click the invite link, the invite is auto-accepted without showing a sign-up form.
**Why:** Partner B might have already created an account from a previous visit. Without this, they'd see a sign-up form, try to sign up with the same email, get an error, and be stuck. The auto-accept path handles this gracefully.

### 8.7 Invite Link Goes to Landing Page, Not /app
**Decision:** Invite URL is `https://dealbreakers.co.za?token=<token>` (root), and the landing page's JS redirects to `/app?token=<token>`.
**Why:** The landing page handles the redirect logic centrally. This also means the invite URL is cleaner and doesn't expose the `/app` path.

---

## 9. What Is NOT Yet Built

1. **Daily check-in email scheduling** -- the `reminders` table exists but there is no cron job or scheduled function to send daily emails. Currently, daily check-in emails are triggered once on response submission as a single email, not as a recurring daily schedule.

2. **Deadline-triggered review notifications** -- no automated trigger when a deadline date arrives. Partners must manually navigate to the round to review.

3. **Multiple partnerships** -- the current design assumes one partnership per user. There are no guards against a user being in multiple partnerships, but the UI only shows one.

4. **Round deletion** -- rounds cannot be deleted once created (only the entire partnership can be deleted via invite revocation).

5. **Profile editing** -- no UI to change your name or email after sign-up.

6. **Partner B starting a round while invite is pending** -- only Partner A can draft rounds while the invite is pending (Partner B doesn't have an account yet).

7. **Email unsubscribe** -- no unsubscribe mechanism for email notifications.

8. **PWA features** -- no service worker, no manifest.json, no offline support.

---

## 10. Rebuilding as a PWA on WordPress

### Recommended Approach

Since WordPress is a server-rendered CMS and Deal Breakers is a stateful interactive app, the best approach is:

1. **WordPress for the landing page** -- use WordPress themes/page builders for the marketing content. This gives you SEO, easy content editing, and plugin ecosystem.

2. **PWA for the app** -- build a standalone Progressive Web App (React or vanilla JS) that lives at `/app` on the same domain. WordPress can be configured to leave `/app` routes alone (via `.htaccess` or server config).

3. **Keep Supabase as the backend** -- the existing database schema, RLS policies, functions, and edge functions all work regardless of the frontend. The Supabase JS client works the same way in any web app.

4. **Add PWA features:**
   - `manifest.json` with app name, icons, theme colour `#A06CD5`, background colour `#F7F4EF`.
   - Service worker for offline caching of app shell.
   - "Add to Home Screen" prompt.

5. **Keep Resend for email** -- the edge function doesn't need to change. Just ensure `APP_URL` points to the correct domain.

### WordPress-Specific Considerations

- The landing page content (sections 1-9 of the landing page) can be recreated as WordPress blocks or with a page builder.
- The LOG IN and SIGN UP FREE buttons should link to `/app?tab=login` and `/app?tab=signup`.
- Password reset redirect URL in Supabase should still point to `https://dealbreakers.co.za?type=recovery` (or whatever your WordPress landing URL is).
- The invite email link should still point to the landing page root with `?token=`, and WordPress should have JS that detects this and redirects to `/app?token=`.

---

## 11. Complete File Reference

| File | Purpose |
|------|---------|
| `index.html` | Landing page HTML entry point |
| `app.html` | App HTML entry point (noindex) |
| `src/landing-main.jsx` | Landing page bootstrap, invite/recovery redirect logic |
| `src/Landing.jsx` | Full landing page component (242 lines) |
| `src/app-main.jsx` | App bootstrap |
| `src/App.jsx` | Entire application logic and UI (973 lines) |
| `src/supabase.js` | Supabase client, email helper, token generator |
| `vite.config.js` | Multi-page Vite build config |
| `vercel.json` | Vercel deployment config with rewrites |
| `package.json` | Dependencies: react 18, supabase-js 2, vite 5 |

### Edge Function (deployed to Supabase, not in repo)
| File | Purpose |
|------|---------|
| `send-email/index.ts` | Deno edge function for all transactional emails via Resend |

---

## 12. Supabase Project Details

- **Project ref:** `gkbnqshixwewkmyfypjy`
- **API URL:** `https://gkbnqshixwewkmyfypjy.supabase.co`
- **Region:** eu-west-1
- **Auth provider:** Email/password (no OAuth, no magic link)
- **Email confirmation:** Disabled (users can sign in immediately)
- **Edge function:** `send-email` (v5, active, JWT verification off)
- **Tables:** profiles, partnerships, rounds, reminders
- **Functions:** handle_new_user (trigger), accept_invite (RPC)
- **RLS:** Enabled on all tables

---

*End of handover document.*
