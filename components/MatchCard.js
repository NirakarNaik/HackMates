"use client";

import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import { ScorePill } from "./CompatibilityScore";
import Button from "./Button";
import { hasGithubSkill } from "@/lib/utils";

// Match list card with Chat, Profile, and Post-Project Rating (README section 30 + NewFeatures Feature 2).
export default function MatchCard({
  match,
  onViewProfile,
  onConnect,
  onChat,
  onRate,
  connecting,
}) {
  return (
    <article className="animate-fade-up relative flex flex-col rounded-2xl border border-cyan-500/25 bg-surface/90 p-5 backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-surface-2 group">
      {/* Corner Ticks */}
      <div className="pointer-events-none absolute top-0 left-0 h-2.5 w-2.5 border-t-2 border-l-2 border-cyan-400" />
      <div className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 border-t-2 border-r-2 border-violet-400" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={match.avatar_url} name={match.name} size={50} />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white leading-tight">{match.name}</h3>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1 py-0.2 font-mono text-[8px] font-bold text-cyan-300">
                SST
              </span>
            </div>
            <p className="text-xs font-semibold text-cyan-300">{match.role}</p>
          </div>
        </div>
        <ScorePill score={match.score} />
      </div>

      {match.bio && (
        <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-2 bg-surface-2/40 rounded-lg p-2 border border-white/5">
          {match.bio}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {match.skills.slice(0, 4).map((skill) => (
          <SkillBadge key={skill} skill={skill} verified={hasGithubSkill(match, skill)} />
        ))}
      </div>

      {(match.interests || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {match.interests.slice(0, 3).map((interest) => (
            <InterestBadge key={interest} interest={interest} />
          ))}
        </div>
      )}

      {match.reasons && match.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg border border-cyan-500/15 bg-cyan-950/20 p-2">
          {match.reasons.slice(0, 2).map((reason) => (
            <li key={reason} className="flex items-start gap-1 text-[11px] text-emerald-300">
              <span className="text-cyan-400" aria-hidden>✦</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="text-xs py-2 border-hairline hover:border-cyan-500/40"
          onClick={() => onViewProfile(match)}
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          className="text-xs py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold shadow-md shadow-cyan-500/20"
          onClick={() => onChat(match)}
        >
          Chat 💬
        </Button>
        <Button
          variant="secondary"
          className="text-xs py-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          onClick={() => onRate && onRate(match)}
        >
          Rate Teammate ⭐
        </Button>
        {(match.github_url || match.discord_username) && (
          <Button
            variant="secondary"
            className="text-xs py-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            onClick={() => onConnect(match)}
            loading={connecting}
          >
            Connect 🔗
          </Button>
        )}
      </div>
    </article>
  );
}
