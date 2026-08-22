export function EmptyState({ icon = "🛰️", title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-hairline bg-surface/50 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-full max-w-sm animate-pulse rounded-3xl border border-hairline bg-surface p-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-3.5 w-24 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-6 space-y-2.5">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
      </div>
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-20 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="mt-8 h-12 w-full rounded-xl bg-white/10" />
    </div>
  );
}
