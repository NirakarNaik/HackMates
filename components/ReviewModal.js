"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import RatingStars from "./RatingStars";

export default function ReviewModal({ match, onClose, onSuccess }) {
  const [projectTitle, setProjectTitle] = useState("Hackathon Collaboration");
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [technicalContribution, setTechnicalContribution] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const averageRating = (
    (communication + reliability + technicalContribution + teamwork) /
    4
  ).toFixed(1);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!projectTitle.trim()) {
      setError("Please specify the project or hackathon name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: match.user_id,
          projectTitle: projectTitle.trim(),
          communication,
          reliability,
          technicalContribution,
          teamwork,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-surface/95 p-6 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
        {/* Mecha Corner Ticks */}
        <div className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 border-t-2 border-r-2 border-violet-400" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-pink-400" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex items-center gap-3.5">
            <Avatar src={match.avatar_url} name={match.name} size={52} />
            <div>
              <div className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300 mb-0.5">
                <span>POST-PROJECT REVIEW</span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">
                Rate {match.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">{match.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full border border-hairline px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-black text-emerald-400">Review Submitted!</h3>
            <p className="mt-1 text-xs text-slate-300">
              Thank you for contributing to {match.name}&apos;s verified builder reputation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Project Name */}
            <div>
              <label
                htmlFor="projectTitle"
                className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Project / Hackathon Name
              </label>
              <input
                id="projectTitle"
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. AI Hackathon MVP, FinTech Dashboard"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            {/* Rating Categories */}
            <div className="space-y-2.5 rounded-2xl border border-white/5 bg-surface-2/60 p-3.5">
              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <span className="text-xs font-semibold text-slate-200">Communication</span>
                <RatingStars
                  value={communication}
                  onChange={setCommunication}
                  size="md"
                />
              </div>

              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <span className="text-xs font-semibold text-slate-200">Reliability</span>
                <RatingStars
                  value={reliability}
                  onChange={setReliability}
                  size="md"
                />
              </div>

              <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                <span className="text-xs font-semibold text-slate-200">Technical Contribution</span>
                <RatingStars
                  value={technicalContribution}
                  onChange={setTechnicalContribution}
                  size="md"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Teamwork</span>
                <RatingStars
                  value={teamwork}
                  onChange={setTeamwork}
                  size="md"
                />
              </div>
            </div>

            {/* Score Summary */}
            <div className="flex items-center justify-between rounded-xl bg-cyan-950/30 border border-cyan-500/20 px-3.5 py-2 text-xs">
              <span className="font-mono text-[11px] text-cyan-300 font-bold">Overall Rating</span>
              <span className="font-mono text-xs font-black text-amber-300 flex items-center gap-1">
                ⭐ {averageRating} / 5.0
              </span>
            </div>

            {/* Written Review */}
            <div>
              <label
                htmlFor="comment"
                className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                Written Review (Optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was it building with them? What did they excel at?"
                className="w-full rounded-xl border border-hairline bg-surface-2 p-3 text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit Rating ⭐
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
