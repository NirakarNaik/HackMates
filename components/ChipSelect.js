"use client";

import { cn } from "@/lib/utils";

// Multi-select chip picker used in onboarding and profile edit.
export default function ChipSelect({
  options,
  selected = [],
  onChange,
  allowCustom = false,
  max,
  error,
}) {
  function toggle(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else if (!max || selected.length < max) {
      onChange([...selected, option]);
    }
  }

  function addCustom(value) {
    const trimmed = value.trim();
    if (
      trimmed &&
      !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase()) &&
      (!max || selected.length < max)
    ) {
      onChange([...selected, trimmed]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97]",
                isSelected
                  ? "border-accent bg-accent/20 text-violet-200"
                  : "border-hairline bg-surface-2 text-muted hover:border-white/20 hover:text-foreground"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <input
          type="text"
          placeholder="Type your own and press Enter..."
          className="mt-3 w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom(e.target.value);
              e.target.value = "";
            }
          }}
        />
      )}

      {selected.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Selected: {selected.join(", ")}
        </p>
      )}
      {error && <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}

export function OptionSelect({ options, value, onChange, error }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option;
        return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97]",
            isSelected
              ? "border-accent bg-accent/20 text-violet-200"
              : "border-hairline bg-surface-2 text-muted hover:border-white/20 hover:text-foreground"
          )}
        >
          {option}
        </button>
        );
      })}
      {error && <p className="w-full mt-1 text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}
