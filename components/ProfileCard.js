"use client";

import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import Button from "./Button";
import { hasGithubSkill } from "@/lib/utils";

// Discovery card with AI Recommendation & "Why this match?" section (NewFeatures Feature 1)
export default function ProfileCard({
  profile,
  compatibility,
  aiRecommendation,
  onLike,
  onPass,
  disabled,
}) {
  const reasons = compatibility?.reasons || [];
  const score = aiRecommendation?.compatibilityScore ?? compatibility?.score ?? 88;
  const whyText =
    aiRecommendation?.why ||
    (reasons.length > 0 ? reasons[0] : "Strong complementary skill synergy detected.");
  const complementaryPairs = aiRecommendation?.complementarySkills || [];
  const suggestedTeam = aiRecommendation?.suggestedTeam;

  return (
    <article className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/30 bg-surface/90 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl group">
      {/* Mecha Tech Corner Accents */}
      <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyan-400" />
      <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-violet-400" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-pink-400" />

      {/* Profile Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={profile.avatar_url} name={profile.name} size={68} />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-black ring-2 ring-surface">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white leading-tight">{profile.name}</h2>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                SST
              </span>
            </div>
            <p className="text-sm font-semibold text-cyan-300">{profile.role}</p>
            <p className="mt-0.5 text-xs text-slate-400 font-mono">
              {profile.experience_level} • {profile.availability || "Flexible"}
            </p>
          </div>
        </div>

        {/* AI Match Score Badge */}
        <div className="flex flex-col items-end">
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-black text-emerald-300 shadow-sm shadow-emerald-500/20">
            <span>✨</span>
            <span>{score}% Match</span>
          </div>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
            AI Scored
          </span>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 text-sm leading-relaxed text-slate-300 line-clamp-3 bg-surface-2/60 rounded-xl p-3 border border-white/5">
          {profile.bio}
        </p>
      )}

      {/* FEATURE 1: "Why this match?" AI Recommendation Section */}
      <section className="mt-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-surface-2/70 to-violet-950/30 p-4 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 text-sm">✦</span>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
              Why this match?
            </h3>
          </div>
          {suggestedTeam && (
            <span className="rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300">
              {suggestedTeam}
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-slate-200">{whyText}</p>

        {/* Complementary Skills Pairs */}
        {complementaryPairs.length > 0 && (
          <div className="mt-3 border-t border-hairline/60 pt-2.5">
            <span className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Complementary Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {complementaryPairs.map((pair, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2 py-1 font-mono text-[10px] font-medium text-cyan-200"
                >
                  <span className="text-white font-semibold">{pair.mySkill}</span>
                  <span className="text-cyan-400 text-[9px]">↔</span>
                  <span className="text-slate-300">{pair.theirSkill}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Skills & Tech Stack */}
      <div className="mt-4 space-y-3">
        <div>
          <h3 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Skills & Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} verified={hasGithubSkill(profile, skill)} />
            ))}
          </div>
        </div>

        {(profile.interests || []).length > 0 && (
          <div>
            <h3 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Interests & Domains
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <InterestBadge key={interest} interest={interest} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Squad Looking For
          </h3>
          <p className="text-xs font-medium text-cyan-200">
            {profile.looking_for.join(" • ")}
          </p>
        </div>
      </div>

      {/* Pass / Like Controls */}
      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          className="flex-1 py-3 border-rose-500/30 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 hover:border-rose-500/50"
          onClick={onPass}
          disabled={disabled}
        >
          <span className="font-mono text-xs opacity-60 mr-1">[←]</span>
          <span>PASS</span>
        </Button>
        <Button
          variant="primary"
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 text-white shadow-lg shadow-cyan-500/25 hover:opacity-95"
          onClick={onLike}
          disabled={disabled}
        >
          <span>SQUAD LIKE</span>
          <span className="font-mono text-xs opacity-80 ml-1">[→]</span>
        </Button>
      </div>
    </article>
  );
}
