# CHECKPOINT 2 — Implementation State

Date: 2026-08-23
Spec: `../README.md` (parent folder) — followed strictly; only MVP scope plus four explicitly
user-requested changes (see §3). Supersedes the state described in CHECKPOINT1.

---

## 1. Current Implementation State

**The full MVP is built, lint-clean, build-clean, and runs locally.**
Flow: Signup → Onboarding → Discover (swipe) → Mutual match + modal → Matches → Connect → Profile edit.

- Next.js **16.3.2**, React 19, Tailwind CSS v4, **JavaScript only** (README Rule 5), App Router
- Deps: `@supabase/supabase-js`, `@supabase/ssr` (nothing else beyond create-next-app defaults)
- `npm run lint` ✅ `npm run build` ✅ prod smoke test ✅ dev server verified running on :3000
- Live Supabase: schema APPLIED (verified via REST probe — `profiles` returns HTTP 200)
- Git: 8 commits following README §43 message list; working tree has the §3 fixes **uncommitted**

### Completed

| Area | State |
|---|---|
| Landing `/` | Exact README §31 headline/subheadline/CTAs + 01-02-03 steps |
| Auth | `/signup`, `/login`, logout, cookie sessions via @supabase/ssr; `proxy.js` guards protected routes, redirects logged-in users from auth pages |
| Onboarding `/onboarding` | 5-step wizard (basic info → skills → interests → experience+looking-for → availability+links), progress bar, per-step validation, prefills existing profile |
| Discovery `/discover` | One card at a time sorted by score desc; excludes self/swiped/incomplete; Like/Pass persisted via upsert; mutual-match detection; MatchModal with score+reasons; empty/error/skeleton states; **← Pass / → Like keyboard shortcuts** |
| Matching | Deterministic scoring (skills 40 / interests 25 / goals 20 / experience 10 / availability 5), need-satisfaction skill model via `ROLE_SKILL_MAP`, deterministic reason sentences. **Verified by node script:** complementary pair 71% vs identical clone 50%; typical user's top pool matches 80/67/63% |
| Matches `/matches` | Score-sorted cards (name, role, score pill, bio, skills **+ interests**, reasons, View Profile, Connect) |
| Connect | GitHub / LinkedIn / Discord reveal in ProfileDetail modal |
| Profile `/profile` | View + edit every field incl. GitHub/LinkedIn/Discord |
| Demo data | 24 profiles auto-seeded idempotently on first `/discover` visit (`is_demo=true`, fixed UUIDs); demo profiles like back at score ≥ 65 |
| States | Loading skeletons/spinners, friendly error mapping, empty states per README §36 |

---

## 2. Database Schema (supabase/schema.sql)

- **profiles**: `id uuid pk`, `user_id uuid unique not null`, name, username, avatar_url, bio, role,
  experience_level (CHECK Beginner/Intermediate/Advanced/null), `skills/interests/looking_for text[]`,
  availability, `github_url`, `linkedin_url`, `discord_username`, `is_demo boolean default false`,
  created_at/updated_at. No FK to auth.users (demo rows have synthetic UUIDs).
- **swipes**: action CHECK ('LIKE'/'PASS'), `unique(user_id,target_user_id)` (re-swipe = upsert),
  self-swipe CHECK.
- **matches**: score int CHECK 0–100, `compatibility_reasons text[]`, `unique(user1_id,user2_id)`
  with canonical pair order (smaller UUID first) preventing duplicates both directions.
- **RLS on all three**: profiles readable by authenticated, insert own-or-demo, update own only;
  swipes readable own-or-targeting-me, writable/deletable own only; matches participant-only, immutable.
- Indexes on lookup columns (user_id, is_demo, swipe target, match participants).

---

## 3. Changes Made This Session (checkpoint 1 → 2)

### A. Matching algorithm fix + verification (was "in progress" in CHECKPOINT1)
- `lib/demoData.js`: export `DEMO_PROFILES`.
- `lib/matching.js`: root-cause fix — generic goals ("Hackathon Teammate") previously self-tokenized
  through `expandToSkills` and counted as unsatisfiable *actionable* needs, deflating skill scores.
  Now a need is skill-measurable only when `ROLE_SKILL_MAP` maps it (`isActionableNeed`);
  lists with no measurable needs get neutral 0.5 coverage instead of 0.
  Also reworded shared-goal reason to `You're both looking for: X, Y`.

### B. Four user-requested changes (latest work — UNCOMMITTED)
1. **LinkedIn field (optional)** alongside GitHub/Discord:
   `supabase/schema.sql` (+`linkedin_url text` column + idempotent ALTER at file end),
   onboarding step 5 input, profile-edit input + payload, profile page Links section,
   ProfileDetail Connect row, MatchCard Connect-button condition includes it.
2. **Arrow keys on Discover**: ArrowLeft = Pass, ArrowRight = Like; disabled while match modal open,
   while swiping, or while loading/error.
3. **Compatibility score shown only for matches**: removed the score ring from discovery cards
   (`components/ProfileCard.js`); score still appears in MatchModal, MatchCard, ProfileDetail.
4. **Interests on MatchCard**: InterestBadge row under skills (max 4).

Verification after B: `npm run lint` ✅, `npm run build` ✅; hot-reloaded onto the running dev server.

---

## 4. Important Decisions Made (and why)

| Decision | Rationale |
|---|---|
| Client components + browser Supabase client everywhere | Simplest architecture per spec; RLS secures data server-side regardless |
| `proxy.js` instead of `middleware.js` | Next.js 16 renamed it (functionality identical) |
| `is_demo` column + fixed UUIDs | Auto-seeding demo data while keeping RLS safe (anyone may INSERT demo rows, never edit others' real profiles) |
| Demo users like back at score ≥ 65 | Makes mutual-match demonstrable single-account; threshold validated against actual score distribution |
| Canonical match pair order | One unique constraint prevents duplicates in both directions |
| Swipe = upsert | Spec: one current decision per target |
| Initials-fallback avatars (no Storage upload) | Avoids storage failure modes; works offline |
| Needs measured only when ROLE_SKILL_MAP-mapped | Generic goals carry no skill signal; counting them as unsatisfiable deflated complementary pairs |
| Score hidden pre-match (user request #3) | Deliberate deviation from spec §17 card layout; score revealed at match time |

---

## 5. Remaining Work

1. **Run the LinkedIn migration on the live DB (blocker for that field):**
   `alter table public.profiles add column if not exists linkedin_url text;`
   (Supabase Dashboard → SQL Editor → Run; already appended to schema.sql.)
2. **Commit the four changes** (8 modified files, see §3B) — e.g. message "add linkedin link, keyboard swipes, match-only score, match-card interests" or split per change.
3. E2E re-test of the four changes in the browser (signup → onboarding w/ LinkedIn → discover arrow keys → like top card → modal shows score → matches shows skills+interests → connect reveals all three links).
4. Verify email-confirmation toggle is OFF (Authentication → Providers → Email) if not done earlier — signup must yield an instant session for the demo.
5. Optional: deploy to Vercel, final mobile pass.

## 6. Issues / Blockers

1. `linkedin_url` missing from live DB until the ALTER above runs — saving that field will fail (PGRST204 unknown column) until then.
2. Demo avatars load from i.pravatar.cc (needs internet; initials fallback is graceful).
3. react-hooks v6 lint strictness: keep the mount-based form initialization pattern for future forms.
4. Uncommitted working tree (intentional — commit pending user go-ahead).

## 7. File Inventory (app code)

```
hackmates/
├── proxy.js                      # auth guard/session refresh (Next 16 middleware)
├── supabase/schema.sql           # 3 tables + RLS + indexes + linkedin migration
├── lib/
│   ├── constants.js              # README §16 option lists + ROLE_SKILL_MAP
│   ├── utils.js                  # cn/norm/intersect/initials/hue/expandToSkills
│   ├── matching.js               # deterministic compatibility + reasons (verified)
│   ├── supabase.js               # browser client singleton
│   ├── auth.js                   # useProtectedUser, signOut
│   └── demoData.js               # 24 demo profiles + ensureDemoProfiles()
├── components/
│   ├── Button.js  Avatar.js  SkillBadge.js (+InterestBadge)  ChipSelect.js
│   ├── CompatibilityScore.js (ring + ScorePill)  Navbar.js
│   ├── ProfileCard.js (no score ring)  MatchCard.js (+interests)
│   ├── MatchModal.js  ProfileDetail.js (+LinkedIn)  EmptyState.js (+CardSkeleton)
└── app/
    ├── layout.js  globals.css  page.js            # shell/theme/landing
    ├── login/page.js  signup/page.js
    ├── onboarding/page.js + OnboardingForm.js      # step 5 now has LinkedIn
    ├── discover/page.js                            # ← / → shortcuts, no score on cards
    ├── matches/page.js
    └── profile/page.js + ProfileEditForm.js        # view/edit incl. LinkedIn
```
