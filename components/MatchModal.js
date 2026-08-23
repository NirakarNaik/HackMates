"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import Button from "./Button";
import Confetti from "./Confetti";

// Full-screen match celebration (README section 27: showMatchModal).
export default function MatchModal({ matchedProfile, score, reasons, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      {/* Confetti Explosion Layer */}
      <Confetti />

      <div className="animate-pop-in relative z-50 w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-surface/95 p-8 text-center shadow-2xl shadow-cyan-500/30 backdrop-blur-xl">
        {/* Mecha Tech Corner Accents */}
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-violet-400" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-pink-400" />

        <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-pink-300">
          <span className="animate-ping text-pink-400">⚡</span>
          <span>SST Mutual Squad Match!</span>
        </div>

        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white leading-tight">
          You & {matchedProfile.name} Matched
        </h2>
        <p className="mt-1 text-xs text-cyan-300 font-semibold">{matchedProfile.role}</p>

        <div className="my-6 flex items-center justify-center gap-5 rounded-2xl border border-cyan-500/20 bg-surface-2/60 p-4">
          <div className="relative">
            <Avatar src={matchedProfile.avatar_url} name={matchedProfile.name} size={76} />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black ring-2 ring-surface">
              ✓
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-mono text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              {score}%
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Synergy Score
            </span>
          </div>
        </div>

        {reasons && reasons.length > 0 && (
          <div className="mb-6 space-y-2 rounded-2xl border border-hairline bg-surface-2/70 p-4 text-left">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Why You Work Well Together
            </div>
            <ul className="space-y-1.5">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-xs text-emerald-300">
                  <span className="text-cyan-400" aria-hidden>✦</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/matches" className="flex-1" onClick={onClose}>
            <Button
              variant="primary"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white font-bold shadow-lg shadow-cyan-500/25"
            >
              Open Squad Matches
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="flex-1 py-3.5 border-hairline hover:border-cyan-500/40"
            onClick={onClose}
          >
            Keep Swiping Deck
          </Button>
        </div>
      </div>
    </div>
  );
}
