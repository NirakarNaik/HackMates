"use client";

import { cn } from "@/lib/utils";

// Renders an interactive or read-only 5-star rating control
export default function RatingStars({
  value = 5,
  onChange,
  readOnly = false,
  size = "md",
  className,
}) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            className={cn(
              "transition-transform",
              !readOnly && "hover:scale-125 cursor-pointer focus:outline-none",
              sizeClasses[size] || sizeClasses.md
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <span
              className={cn(
                "transition-colors duration-150",
                filled
                  ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                  : "text-slate-600 hover:text-amber-300/60"
              )}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}
