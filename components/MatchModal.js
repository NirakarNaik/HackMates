"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import Button from "./Button";
import { ScorePill } from "./CompatibilityScore";

// Full-screen match celebration (README section 27: showMatchModal).
export default function MatchModal({ matchedProfile, score, reasons, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in w-full max-w-md rounded-3xl border border-hairline bg-surface p-8 text-center shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent-2">
          It&apos;s a match!
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">
          You and {matchedProfile.name} matched
        </h2>

        <div className="my-6 flex items-center justify-center gap-4">
          <Avatar src={matchedProfile.avatar_url} name={matchedProfile.name} size={80} />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-black bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              {score}%
            </span>
            <span className="text-xs uppercase tracking-wide text-muted">Compatible</span>
          </div>
        </div>

        {reasons && reasons.length > 0 && (
          <ul className="mb-6 space-y-2 rounded-2xl border border-hairline bg-surface-2 p-4 text-left">
            <li className="text-xs font-semibold uppercase tracking-wider text-muted">
              Why you work together
            </li>
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-emerald-300">
                <span aria-hidden>✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/matches" className="flex-1" onClick={onClose}>
            <Button variant="primary" className="w-full py-3">
              View Matches
            </Button>
          </Link>
          <Button variant="secondary" className="flex-1 py-3" onClick={onClose}>
            Keep Discovering
          </Button>
        </div>
      </div>
    </div>
  );
}
