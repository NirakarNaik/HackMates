import { cn } from "@/lib/utils";

export function SkillBadge({ skill, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-accent/15 px-2.5 py-1 text-xs font-medium text-violet-300",
        className
      )}
    >
      {skill}
    </span>
  );
}

export function InterestBadge({ interest, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-muted border border-hairline",
        className
      )}
    >
      {interest}
    </span>
  );
}
