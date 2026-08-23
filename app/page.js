import Link from "next/link";

const STATS = [
  { label: "SST Builders", value: "36+" },
  { label: "Avg Match Compatibility", value: "92%" },
  { label: "Complementary Skills", value: "100%" },
  { label: "Instant GitHub Verify", value: "Live" },
];

const STEPS = [
  {
    number: "01",
    title: "Initialize Builder Profile",
    description:
      "Configure your primary tech stack, interests, availability, and verify your skills directly via GitHub integration.",
    tag: "HUD Config",
  },
  {
    number: "02",
    title: "Deck Swipe Discovery",
    description:
      "Explore potential SST teammates ranked deterministically by complementary abilities (e.g. Frontend + ML/AI synergy).",
    tag: "Match Engine",
  },
  {
    number: "03",
    title: "Mutual Squad Match & Chat",
    description:
      "Trigger instant match celebrations with full compatibility breakdown, direct chat, and Discord/GitHub connectivity.",
    tag: "Deploy & Build",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Background glow flares */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-10 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]"
      />

      {/* Top Navigation */}
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-0.5 shadow-md shadow-cyan-500/20">
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-background font-mono text-xs font-black text-cyan-300">
              SST
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                HackMates
              </span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Scaler
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-opacity"
          >
            Join Squad
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-6">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Scaler School of Technology • Hackathon Matchmaking</span>
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl text-white">
          Build your dream hackathon squad{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            with complementary skills.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Connect with fellow SST developers, ML engineers, and designers. Match based on
          what your team actually needs, swipe through builders, and start shipping.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:opacity-95 active:scale-[0.98] sm:w-auto"
          >
            <span>Launch Squad Deck</span>
            <span>⚡</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex w-full items-center justify-center rounded-xl border border-hairline bg-surface-2 px-8 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white sm:w-auto"
          >
            How Algorithm Works
          </a>
        </div>

        {/* Stats Grid */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-hairline bg-surface/60 p-4 backdrop-blur-md"
            >
              <div className="text-2xl sm:text-3xl font-black font-mono bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / Protocol */}
      <section id="how-it-works" className="relative mx-auto max-w-5xl scroll-mt-20 px-4 pb-24 pt-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Matching Protocol
          </h2>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            Designed for Hackathon High-Performance
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative overflow-hidden rounded-2xl border border-hairline bg-surface p-6 transition-all hover:border-cyan-500/40 hover:bg-surface-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-black text-cyan-400">
                  {step.number}
                </span>
                <span className="rounded-md border border-hairline bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-muted">
                  {step.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline py-8 text-center text-xs text-slate-500">
        SST HackMates — Scaler School of Technology Team-Matching & Hackathon Platform.
      </footer>
    </main>
  );
}
