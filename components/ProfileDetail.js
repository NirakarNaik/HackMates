"use client";

import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import Button from "./Button";

// Full profile details, used as a modal from the Matches page.
export default function ProfileDetail({ profile, score, reasons, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.name} size={64} />
            <div>
              <h2 className="text-xl font-extrabold">{profile.name}</h2>
              <p className="text-sm font-medium text-violet-300">{profile.role}</p>
              <p className="mt-0.5 text-xs text-muted">
                {profile.experience_level}
                {profile.availability ? ` · ${profile.availability}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full border border-hairline px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {typeof score === "number" && (
          <p className="mt-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {score}% Compatible
          </p>
        )}

        {bioBlock(profile.bio)}
        {listBlock("Skills", profile.skills, SkillBadge)}
        {listBlock("Interests", profile.interests, InterestBadge)}
        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Looking for
          </h3>
          <p className="text-sm">{(profile.looking_for || []).join(" · ") || "Not specified"}</p>
        </div>

        {(profile.github_url || profile.discord_username) && (
          <div className="mt-6">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Connect
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer">
                  <Button variant="secondary">GitHub ↗</Button>
                </a>
              )}
              {profile.discord_username && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-4 py-2.5 text-sm">
                  Discord: <strong>{profile.discord_username}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function bioBlock(bio) {
  if (!bio) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Bio</h3>
      <p className="text-sm leading-relaxed text-muted">{bio}</p>
    </div>
  );
}

function listBlock(title, items, Badge) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}
