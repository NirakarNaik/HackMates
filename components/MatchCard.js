"use client";

import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import { ScorePill } from "./CompatibilityScore";
import Button from "./Button";

// Match list card (README section 30).
export default function MatchCard({ match, onViewProfile, onConnect, connecting }) {
  return (
    <article className="animate-fade-up flex flex-col rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:bg-surface-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={match.avatar_url} name={match.name} size={48} />
          <div>
            <h3 className="font-bold leading-tight">{match.name}</h3>
            <p className="text-sm text-violet-300">{match.role}</p>
          </div>
        </div>
        <ScorePill score={match.score} />
      </div>

      {match.bio && (
        <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-2">{match.bio}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {match.skills.slice(0, 4).map((skill) => (
          <SkillBadge key={skill} skill={skill} />
        ))}
      </div>

      {(match.interests || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {match.interests.slice(0, 4).map((interest) => (
            <InterestBadge key={interest} interest={interest} />
          ))}
        </div>
      )}

      {match.reasons && match.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {match.reasons.slice(0, 2).map((reason) => (
            <li key={reason} className="flex items-start gap-1.5 text-xs text-emerald-300">
              <span aria-hidden>✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => onViewProfile(match)}>
          View Profile
        </Button>
        {(match.github_url || match.linkedin_url || match.discord_username) && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onConnect(match)}
            loading={connecting}
          >
            Connect
          </Button>
        )}
      </div>
    </article>
  );
}
