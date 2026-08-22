import { cn } from "@/lib/utils";

export function SkillBadge({ skill, children, className, verified = false }) {
  return (
    <span
      title={verified ? "Verified via GitHub" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium",
        verified
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "bg-accent/15 text-violet-300",
        className
      )}
    >
      {verified && <span aria-hidden>✓</span>}
      {skill ?? children}
    </span>
  );
}

export function InterestBadge({ interest, children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-muted border border-hairline",
        className
      )}
    >
      {interest ?? children}
    </span>
  );
}
