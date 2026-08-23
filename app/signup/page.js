"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError("Please enter an email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message.includes("already registered")
            ? "An account with this email already exists. Try logging in."
            : authError.message.includes("rate limit")
              ? "Too many signup attempts. Please wait a moment and try again."
              : authError.message || "Could not create your account. Please try again."
        );
        return;
      }

      // Email confirmation disabled -> session is returned immediately.
      if (data?.session) {
        router.replace("/onboarding");
        return;
      }

      // Email confirmation enabled -> user must verify first.
      setInfo("Account created! Check your email to confirm your address, then log in.");
    } catch (err) {
      console.error("Signup exception:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="animate-fade-up w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-background font-mono text-xs font-black text-cyan-300">
              SST
            </span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            HackMates
          </span>
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-surface/90 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          {/* Mecha Corner Ticks */}
          <div className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t-2 border-l-2 border-cyan-400" />
          <div className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 border-t-2 border-r-2 border-violet-400" />

          <h1 className="text-2xl font-black text-white">Create Builder Profile</h1>
          <p className="mt-1 text-xs text-slate-400">
            Join the Scaler School of Technology hackathon community.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SST Student Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@scaler.com"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {info}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white font-bold shadow-lg shadow-cyan-500/25"
            >
              Initialize Profile ⚡
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
