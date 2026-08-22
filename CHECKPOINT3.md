# CHECKPOINT 3 — Implementation State

Date: 2026-08-23
Spec: `../README.md` (parent folder) — MVP scope plus user-requested changes through this session.
Supersedes CHECKPOINT2.md (which documents §1-§5 history in detail; key deltas repeated here).
NOTE: "CHECKMATE.md" mentioned by user == typo for CHECKPOINT2.md (no such file exists).

---

## 1. Current Implementation State

**Full MVP + chat + GitHub sync are CODE-COMPLETE, lint-clean, build-clean, dev-server running.**
Flow: Signup → Onboarding → Discover (swipe) → Mutual match + modal → Matches → Chat / Connect → Profile edit (+ GitHub verify).

### Committed git log (9 commits)
```
b40e613 remove linkedin link option, keep github and discord
b013e8a expand demo data to 36 profiles
2b1c5b8 add linkedin link, keyboard swipes, match-only score, match-card interests
c969518 polish ui / ab0cfb8 matches / 6d9951a discovery / fe61d4c scoring /
e543254 onboarding / 682a373 profile db / 45db72a auth / d82c425 landing
```

### Completed & verified live
| Area | State |
|---|---|
| Landing / Auth / Onboarding / Discover / Matches / Connect | As per CHECKPOINT2 §1 — unchanged |
| Demo data | **36 profiles** (24 original + 12 Indian-origin, indices 24-35) seeded in live DB, verified count=36 |
| Match modal reliability | Fixed: demo like-back threshold 65 → **always like back (0)**; every Like now shows the animation+score modal |
| LinkedIn | Feature REMOVED entirely (user choice); GitHub + Discord links only |
| Chat (code done) | `messages` table design + RLS + realtime publication in schema.sql; `components/ChatModal.js` with history + Supabase Realtime (`postgres_changes`) + send + auto-scroll; demo partners auto-reply (~1-2s canned templates); Chat button on every MatchCard |
| GitHub sync (code done) | `app/api/github/sync/route.js` server route using `GITHUB_PAT` (token server-side only); derives top languages (recent pushes ×2) + topics from non-fork repos; "Sync from GitHub" buttons in Onboarding step 5 + ProfileEditForm; results saved as profile fields; green ✓ verified skill badges on cards; matcher counts verified languages via `effectiveSkills` union |

### Verified working end-to-end this session
- Signup returns instant session (email-confirmation toggle confirmed OFF)
- `/api/github/sync` smoke test: HTTP 200 for `octocat`, derived languages correctly with PAT
- All 36 demo rows present; REST probes used to confirm schema gaps below

---

## 2. Database Schema (supabase/schema.sql)

Four tables, all RLS-enabled, all policies `to authenticated`:

- **profiles**: identity + role/experience, skills/interests/looking_for text[], availability,
  github_url, discord_username, `github_skills text[] default '{}'`, `github_topics text[] default '{}'`,
  `github_synced_at timestamptz`, is_demo flag. No FK to auth.users.
- **swipes**: LIKE/PASS, unique(user_id,target_user_id), upsert semantics, self-swipe check.
- **matches**: canonical pair order (min uuid = user1), unique pair constraint, score 0-100, reasons[].
- **messages**: `id bigint identity pk`, match_id uuid, sender_id uuid, body ≤2000 chars,
  created_at; index (match_id, created_at); RLS: participants read; sender must be a match
  participant AND (auth.uid() OR an is_demo profile); added to `supabase_realtime` publication
  via idempotent DO block.

Migrations appended at end of schema.sql (safe to re-run): GITHUB SYNC columns ALTERs.
Messages section is create-if-not-exists + drop/create-safe policies + publication guard.

---

## 3. Changes This Session (checkpoint 2 → 3)

| Commit / Status | Change |
|---|---|
| `b013e8a` committed | Demo data 24 → 36 Indian-origin profiles; seeded live via one-off authenticated script (deleted after); created `hackmates.seeder@example.com` auth account for seeding (deletable) |
| `b40e613` committed | LinkedIn removed everywhere (schema column+ALTER, forms, cards, detail modal) after PGRST204 save failures; fixed user-reported save bug |
| UNCOMMITTED | Match-modal fix: `DEMO_LIKE_BACK_THRESHOLD` 65 → 0 in `app/discover/page.js` (root cause: score-sorted cards meant only top ~2 cleared 65 → "modal broken", "only 2 matches") |
| UNCOMMITTED | Chat feature (§1 table row above) — new files: `components/ChatModal.js`; edits: MatchCard (Chat button), matches page (matchId + modal wiring), schema.sql messages section |
| UNCOMMITTED | GitHub sync feature — new files: `app/api/github/sync/route.js`; edits: schema.sql columns, lib/utils.js helpers, lib/matching.js effectiveSkills, both forms' Sync button + payload, SkillBadge verified prop, verified badges in ProfileCard/MatchCard/ProfileDetail |
| UNCOMMITTED | Bug fix: ProfileDetail listBlock passed badge components receiving children while badges read props → empty pills; call sites now pass render functions + both badges accept children fallback |

`.env.local` now contains `GITHUB_PAT=...` (gitignored; token pasted in chat — user may rotate later).

## 4. Important Decisions Made (new ones; older ones in CHECKPOINT2 §4)

| Decision | Rationale |
|---|---|
| Demo always likes back | ≥65 starved the flow (only ~top-2 matches ever); every Like must visibly match |
| Chat = messages table + postgres_changes realtime | Zero new dependencies; DB-backed history; RLS enforced server-side |
| Demo chat partners auto-reply client-side | Single-account demonstrability, consistent with demo like-back philosophy |
| Messages insert policy allows demo-sender rows | Needed for bot replies; scoped to actual match participants flagged is_demo |
| GitHub API route handler holds PAT server-side | Browsers must never see tokens; route also normalizes errors |
| Recent repo pushes weight ×2 in language counts | Current skills outweigh stale ones |
| effectiveSkills = claimed ∪ verified (interests NOT merged yet) | Smallest safe scoring change; topics vocabulary doesn't match INTERESTS taxonomy |
| Verified badges = emerald ✓ ring via `hasGithubSkill` | Instant visual payoff; tooltip explains provenance |
| Commits held | User explicitly said don't commit until they say so |

## 5. Remaining Work

1. **BLOCKER — user must run ONE migration script in Supabase SQL Editor** (I cannot: anon key only, DDL needs dashboard). Paste-ready block:
   ```sql
   -- CHAT
   create table if not exists public.messages (
     id         bigint generated always as identity primary key,
     match_id   uuid not null,
     sender_id  uuid not null,
     body       text not null check (char_length(body) between 1 and 2000),
     created_at timestamptz not null default now()
   );
   create index if not exists idx_messages_match on public.messages (match_id, created_at);
   alter table public.messages enable row level security;
   create policy "messages_select_participant"
     on public.messages for select to authenticated
     using (exists (select 1 from public.matches m
       where m.id = messages.match_id
         and (m.user1_id = auth.uid() or m.user2_id = auth.uid())));
   create policy "messages_insert_participant_or_demo"
     on public.messages for insert to authenticated
     with check (
       exists (select 1 from public.matches m
         where m.id = messages.match_id
           and ((m.user1_id = auth.uid() and m.user2_id = sender_id)
             or (m.user2_id = auth.uid() and m.user1_id = sender_id)))
       and (sender_id = auth.uid()
         or exists (select 1 from public.profiles p
           where p.user_id = messages.sender_id and p.is_demo))
     );
   do $$ begin
     if not exists (select 1 from pg_publication_tables
       where pubname='supabase_realtime' and tablename='messages') then
       alter publication supabase_realtime add table public.messages;
     end if;
   end $$;
   -- GITHUB SYNC
   alter table public.profiles add column if not exists github_skills text[] not null default '{}';
   alter table public.profiles add column if not exists github_topics text[] not null default '{}';
   alter table public.profiles add column if not exists github_synced_at timestamptz;
   ```
2. After migration: browser-test chat (send → demo reply arrives live) and GitHub sync (Sync button → Save → ✓ badges appear; discover/matches scores shift slightly upward where languages help).
3. Commit the uncommitted feature work when user says so (suggested split: chat commit + github-sync commit, or one combined).
4. Optional polish backlog: merge github_topics into interest scoring (needs vocab mapping), unread-message badge on MatchCard, message timestamps, mobile pass.
5. Vercel deploy: **ON HOLD until user explicitly requests** (standing instruction).

## 6. Issues / Blockers

1. `messages` table absent on live DB (PGRST205 confirmed via probe) → chat modal shows "unavailable". Fixed by §5.1.
2. `github_skills/topics/synced_at` columns absent (42703 confirmed) → syncing works but SAVING the synced profile will fail until §5.1 runs.
3. react-hooks v6 lint strictness: keep mount-based form init pattern; avoid unused eslint-disable directives (they warn).
4. Next 16 JS codebase: undefined globals (e.g., forgotten imports) pass lint/build and only fail at runtime — grep usage sites when adding cross-file helpers.
5. Seeder account `hackmates.seeder@example.com` exists in auth (harmless; deletable via dashboard).
6. Dev server currently running detached on :3000 with GITHUB_PAT loaded (log: %TEMP%\opencode\hackmates-dev.log).

## 7. File Inventory (app code)

```
hackmates/
├── proxy.js                      # auth guard/session refresh (Next 16 middleware)
├── .env.local                    # SUPABASE_URL, ANON_KEY, GITHUB_PAT (gitignored)
├── supabase/schema.sql           # 4 tables + RLS + indexes + realtime pub + migrations
├── lib/
│   ├── constants.js              # README §16 option lists + ROLE_SKILL_MAP
│   ├── utils.js                  # cn/norm/intersect/initials/hue/expandToSkills +
│   │                             #   extractGithubUsername/githubSkillsOf/hasGithubSkill/effectiveSkills
│   ├── matching.js               # deterministic compatibility (uses effectiveSkills)
│   ├── supabase.js  auth.js  demoData.js (36 profiles)
├── components/
│   ├── Button  Avatar  SkillBadge(+InterestBadge, verified prop)  ChipSelect
│   ├── CompatibilityScore(ring+pill)  Navbar  EmptyState(+CardSkeleton)
│   ├── ProfileCard(no score)  MatchCard(+Chat btn, verified badges)
│   ├── MatchModal  ProfileDetail(fixed badges, topics)  ChatModal(realtime chat)
└── app/
    ├── layout  globals.css  page.js (landing)
    ├── api/github/sync/route.js  # POST {username} → PAT-authenticated GitHub derive
    ├── login/ signup/ onboarding/(step5 Sync button) 
    ├── discover/                 # arrow-key swipes, always-like-back demos
    ├── matches/                  # score-sorted, Chat + View Profile + Connect modals
    └── profile/                  # view/edit incl. Sync from GitHub
```
