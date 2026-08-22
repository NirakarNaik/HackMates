"use client";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-accent to-accent-2 text-white hover:opacity-90 shadow-lg shadow-accent/20",
  secondary:
    "border border-hairline bg-surface-2 text-foreground hover:bg-white/5",
  ghost: "text-muted hover:text-foreground hover:bg-white/5",
  like: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90",
  pass: "border border-hairline bg-surface-2 text-muted hover:text-foreground",
};

export default function Button({
  children,
  variant = "primary",
  className,
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
