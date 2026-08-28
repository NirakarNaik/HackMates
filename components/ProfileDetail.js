"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { SkillBadge, InterestBadge } from "./SkillBadge";
import Button from "./Button";
import RatingStars from "./RatingStars";
import { hasGithubSkill } from "@/lib/utils";

// Full profile details modal with AI Recommendation and Teammate Reviews
export default function ProfileDetail({
  profile,
  score,
  reasons,
  aiRecommendation,
  onClose,
}) {
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Fetch reputation and reviews for this user
  useEffect(() => {
    let active = true;
    if (!profile?.user_id) return;

    (async () => {
      try {
        const res = await fetch(`/api/reviews?userId=${profile.user_id}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setReviewsData(data);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (active) setReviewsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile?.user_id]);

  const whyText =
    aiRecommendation?.why ||
    (reasons && reasons.length > 0
      ? reasons[0]
      : "Strong complementary skill and track synergies detected.");
  const complementaryPairs = aiRecommendation?.complementarySkills || [];
  const suggestedTeam = aiRecommendation?.suggestedTeam;
  const matchScore = aiRecommendation?.compatibilityScore ?? score;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-cyan-500/30 bg-surface/95 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline/60 pb-5">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.name} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{profile.name}</h2>
                <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                  SST
                </span>
              </div>
              <p className="text-sm font-medium text-cyan-300">{profile.role}</p>
              <p className="mt-0.5 text-xs text-slate-400 font-mono">
                {profile.experience_level}
                {profile.availability ? ` · ${profile.availability}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full border border-hairline px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* AI Match Banner */}
        {typeof matchScore === "number" && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span>✨</span>
              <span>AI Compatibility Score</span>
            </span>
            <span className="font-mono text-sm font-black text-emerald-300">
              {matchScore}% Match
            </span>
          </div>
        )}

        {/* FEATURE 1: "Why this match?" AI Recommendation Section */}
        <section className="mt-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-surface-2/70 to-violet-950/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>✦</span>
              <span>Why this match?</span>
            </span>
            {suggestedTeam && (
              <span className="rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300">
                {suggestedTeam}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-200">{whyText}</p>

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

        {/* FEATURE 2: Builder Reputation & Ratings */}
        <section className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-hairline/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">⭐</span>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                  Builder Reputation
                </h3>
                <p className="font-mono text-[10px] text-slate-400">
                  Verified post-project reviews from teammates
                </p>
              </div>
            </div>
            {reviewsData && (
              <div className="text-right">
                <span className="font-mono text-sm font-black text-amber-300">
                  {reviewsData.averageRating} / 5.0
                </span>
                <span className="block font-mono text-[9px] text-slate-400">
                  {reviewsData.totalReviews} reviews
                </span>
              </div>
            )}
          </div>

          {/* Category Averages */}
          {reviewsData?.categoryAverages && (
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="rounded-lg bg-surface-2/60 p-2 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Communication</span>
                <span className="font-mono font-bold text-amber-300">
                  ⭐ {reviewsData.categoryAverages.communication}
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-2 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Reliability</span>
                <span className="font-mono font-bold text-amber-300">
                  ⭐ {reviewsData.categoryAverages.reliability}
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-2 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Technical Skills</span>
                <span className="font-mono font-bold text-amber-300">
                  ⭐ {reviewsData.categoryAverages.technicalContribution}
                </span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-2 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Teamwork</span>
                <span className="font-mono font-bold text-amber-300">
                  ⭐ {reviewsData.categoryAverages.teamwork}
                </span>
              </div>
            </div>
          )}

          {/* Recent Reviews */}
          {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-hairline/60 pt-3">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Recent Teammate Reviews
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {reviewsData.reviews.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-white/5 bg-surface-2/50 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar src={r.reviewer_avatar} name={r.reviewer_name} size={18} />
                        <span className="font-bold text-slate-200">{r.reviewer_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          • {r.project_title || "Project"}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-300 font-bold">
                        ⭐ {r.rating}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-[11px] text-slate-300 italic">
                        &quot;{r.comment}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {bioBlock(profile.bio)}
        {listBlock("Skills", profile.skills, (item) => (
          <SkillBadge key={item} skill={item} verified={hasGithubSkill(profile, item)} />
        ))}
        {listBlock("Interests", profile.interests, (item) => (
          <InterestBadge key={item} interest={item} />
        ))}
        {listBlock("GitHub topics", profile.github_topics, (item) => (
          <InterestBadge key={item} interest={item} />
        ))}
        <div className="mt-5">
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Looking for
          </h3>
          <p className="text-sm text-cyan-200">
            {(profile.looking_for || []).join(" · ") || "Not specified"}
          </p>
        </div>

        {(profile.github_url || profile.discord_username) && (
          <div className="mt-6 border-t border-hairline/60 pt-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Connect
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer">
                  <Button variant="secondary">GitHub ↗</Button>
                </a>
              )}
              {profile.discord_username && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-sm text-slate-200 font-mono">
                  Discord: <strong className="text-white">{profile.discord_username}</strong>
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
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
        Bio
      </h3>
      <p className="text-sm leading-relaxed text-slate-300">{bio}</p>
    </div>
  );
}

function listBlock(title, items, renderItem) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
