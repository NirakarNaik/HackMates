# CHECKPOINT 2 — Implementation State

Date: 2026-08-23
Spec: `README.md` (parent folder) — followed strictly; no features outside MVP scope added.
Supersedes CHECKPOINT1.md state; see §3 for what changed since checkpoint 1.

---

## 1. Completed

### Project scaffold
- **Location:** `C:\Users\ANKITA NAIK\Desktop\HackMates\hackmates` (own git repo)
- Next.js **16.3.2**, React 19, Tailwind CSS v4, JavaScript only (**no TypeScript** per README Rule 5), App Router, ESLint flat config
- Dependencies installed: `@supabase/supabase-js`, `@supabase/ssr`
- `npm run lint` ✅ `npm run build` ✅ production server smoke test ✅ (landing headline/CTA + /login render)

### Database (`supabase/schema.sql`) — written, NOT YET APPLIED to live DB
- `profiles` (README §11 + `is_demo boolean`), `swipes` (§12, unique(user_id,target_user_id)),
  `matches` (§13, canonical pair order, score 0–100 CHECK) — RLS enabled on all three, indexes on lookup columns
- **Verified not applied:** REST probe returns `PGRST205 Could not find the table 'public.profiles'`

### Lib
| File | Purpose |
|---|---|
| `lib/supabase.js` | Browser client singleton (@supabase/ssr `createBrowserClient`) |
| `lib/auth.js` | `useProtectedUser()` hook (user + profile + redirect-to-login), `signOut()` |
| `lib/constants.js` | Option lists verbatim from README §16 + `ROLE_SKILL_MAP` |
| `lib/utils.js` | `cn`, `norm`, `intersect`, `initialsOf`, avatar hue, `expandToSkills` |
| `lib/matching.js` | Deterministic compatibility (README §19–26) + reason sentences — **rewritten & verified this session** |
| `lib/demoData.js` | 24 demo profiles (README §38 names) with fixed UUIDs + idempotent `ensureDemoProfiles()` |

### Matching algorithm — VERIFIED (was "in progress" at checkpoint 1)
Verification script results (node, against real demo data):
- README §20 canonical complementary pair (Ananya frontend ↔ Arjun ML): **71%**, symmetric both directions
- Identical clone of Ananya vs herself: **50%** → complementary clearly beats similarity ✓
- Typical ML-dev user vs pool: top matches **80% / 67% / 63%** — good discovery UX
- All 276 demo pairwise scores: median 38, max 81, 18 pairs ≥65; no NaN/crash on empty inputs
Root causes fixed during rewrite:
1. Generic goals ("Hackathon Teammate") self-tokenized via `expandToSkills`, so they counted as
   unsatisfiable *actionable* needs and deflated skill scores → needs are now skill-measurable only
   when `ROLE_SKILL_MAP` maps them (`isActionableNeed`); generic-only lists get neutral 0.5.
2. Shared-goal reason sentence reworded (`You're both looking for: X, Y`).

### Auth & routing
- `proxy.js` (Next 16 middleware rename): session refresh, guards `/discover /matches /profile /onboarding`,
  redirects logged-in users away from `/login //signup`
- Signup → session? `/onboarding` : check-your-email message; Login → `/discover`; @supabase/ssr cookie sessions

### Pages & components
All built (see CHECKPOINT1 §6 inventory): landing, login, signup, 5-step onboarding wizard,
discover (swipe + match modal), matches (score-sorted cards, ProfileDetail, Connect reveal), profile view/edit.
Responsive classes throughout; loading/empty/error states per README §35–37.
Demo like-back threshold in discover: **65** (verified appropriate for new score distribution).

### Environment
`.env.local` has real values (gitignored, never committed):
```
NEXT_PUBLIC_SUPABASE_URL=https://qsuewdfysihfgozdlxcv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 2. Remaining Work (user actions + final pass)

1. **Apply schema (BLOCKER):** paste `supabase/schema.sql` into Supabase Dashboard → SQL Editor → Run.
   (Agent cannot run DDL remotely; verified table still missing.)
2. **Disable email confirmation (BLOCKER for demo):** Authentication → Providers → Email → turn off
   "Confirm email" so signup returns an instant session.
3. Full E2E manual test once 1+2 done: signup → onboarding → discover → like → match modal →
   matches → profile edit (60–120s demo flow per README §39).
4. Optional final polish after manual test feedback.

## 3. Changes made this session (checkpoint 1 → 2)

- `lib/demoData.js`: export `DEMO_PROFILES` (used by verification tooling)
- `lib/matching.js`: need-measurability fix (above), reason copy fix
- Verified scoring with node script; confirmed threshold 65 correct; lint/build/server smoke test green

## 4. Key Decisions (unchanged from checkpoint 1)

Client-side browser Supabase client everywhere (RLS secures data); `proxy.js` naming for Next 16;
`is_demo` + fixed UUIDs for auto-seeding; deterministic demo like-back ≥65; canonical match pair order;
upsert swipes; initials-fallback avatars (no Storage dependency); username from email prefix;
publishable key format accepted.

## 5. Issues / Blockers

1. **BLOCKER (testing):** schema not applied — user must run `schema.sql` in SQL editor.
2. **BLOCKER (demo):** disable "Confirm email" for instant-session demo flow.
3. Demo avatars load from i.pravatar.cc (needs internet; graceful initials fallback offline).
4. Keep mount-based form initialization pattern for any future forms (react-hooks v6 lint strictness).
