import { cn } from "@/lib/utils";

// Circular score ring (README section 17: "94% Compatible")
export default function CompatibilityScore({ score, size = 64, className, label = true }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ fontSize: size * 0.26 }}
        >
          {score}%
        </span>
      </div>
      {label && (
        <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
          Compatible
        </span>
      )}
    </div>
  );
}

export function ScorePill({ score, className }) {
  const tone =
    score >= 80
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : score >= 60
        ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
        : "bg-white/5 text-muted border-hairline";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
        tone,
        className
      )}
    >
      {score}% match
    </span>
  );
}
