"use client";

import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import Button from "./Button";
import { hasGithubSkill } from "@/lib/utils";

// Discovery card (README section 17).
// Compatibility score is intentionally not shown here - it is revealed
// only when a mutual match happens (match modal / matches page).
export default function ProfileCard({ profile, compatibility, onLike, onPass, disabled }) {
  const { reasons } = compatibility;

  return (
    <article className="animate-fade-up w-full max-w-sm rounded-3xl border border-hairline bg-surface p-6 shadow-2xl shadow-black/40">
      <div className="flex items-start gap-4">
        <Avatar src={profile.avatar_url} name={profile.name} size={64} />
        <div>
          <h2 className="text-xl font-bold leading-tight">{profile.name}</h2>
          <p className="text-sm font-medium text-violet-300">{profile.role}</p>
          <p className="mt-0.5 text-xs text-muted">{profile.experience_level}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 text-sm leading-relaxed text-muted line-clamp-3">
          {profile.bio}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} verified={hasGithubSkill(profile, skill)} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Interests
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <InterestBadge key={interest} interest={interest} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Looking for
          </h3>
          <p className="text-sm text-foreground">{profile.looking_for.join(" · ")}</p>
        </div>
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 rounded-xl border border-hairline bg-surface-2 p-3">
          {reasons.slice(0, 3).map((reason) => (
            <li key={reason} className="flex items-start gap-2 text-xs text-emerald-300">
              <span aria-hidden>✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex gap-3">
        <Button variant="pass" className="flex-1 py-3" onClick={onPass} disabled={disabled}>
          Pass
        </Button>
        <Button variant="like" className="flex-1 py-3" onClick={onLike} disabled={disabled}>
          Like
        </Button>
      </div>

      <p className="mt-3 text-center text-xs text-muted">Availability: {profile.availability || "Not specified"}</p>
    </article>
  );
}
