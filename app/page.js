import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Build your profile",
    description:
      "Show your skills, interests, experience and what you're looking for in a teammate.",
  },
  {
    number: "02",
    title: "Discover compatible builders",
    description:
      "Swipe through potential teammates ranked by how well you complement each other.",
  },
  {
    number: "03",
    title: "Match and start building",
    description:
      "Mutual likes create a match with a compatibility breakdown. Connect and ship together.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
      />

      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-black text-white">
            H
          </span>
          <span className="text-lg font-extrabold tracking-tight">HackMate</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
        >
          Log in
        </Link>
      </nav>

      <section className="relative mx-auto max-w-3xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Find people who{" "}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            build like you.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Discover compatible teammates for hackathons, coding projects, and everything
          you want to build.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-2 px-7 py-3.5 text-sm font-bold shadow-lg shadow-accent/25 transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
          >
            Find My Teammate
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex w-full items-center justify-center rounded-xl border border-hairline bg-surface-2 px-7 py-3.5 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:w-auto"
          >
            How It Works
          </a>
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-5xl scroll-mt-20 px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-hairline bg-surface p-6 transition-colors hover:bg-surface-2"
            >
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text font-mono text-2xl font-black text-transparent">
                {step.number}
              </span>
              <h2 className="mt-3 text-lg font-bold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-hairline py-6 text-center text-xs text-muted">
        HackMate — Find people who build like you.
      </footer>
    </main>
  );
}
