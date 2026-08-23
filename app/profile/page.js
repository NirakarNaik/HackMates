"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { SkillBadge, InterestBadge } from "@/components/SkillBadge";
import { useProtectedUser } from "@/lib/auth";
import ProfileEditForm from "./ProfileEditForm";

export default function ProfilePage() {
  const router = useRouter();
  const { loading, user, profile, error: authError } = useProtectedUser();
  const [editing, setEditing] = useState(false);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </main>
      </>
    );
  }

  if (authError) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl flex-1 px-4 py-10">
          <p className="rounded-xl border border-hairline bg-surface p-4 text-sm text-muted">
            {authError}
          </p>
        </main>
      </>
    );
  }

  // No profile yet -> onboarding first
  if (!profile && user && !loading) {
    router.replace("/onboarding");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>SST Builder Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Builder HUD
            </h1>
          </div>
          {!editing && (
            <Button
              variant="secondary"
              className="border-cyan-500/30 hover:border-cyan-500/60"
              onClick={() => setEditing(true)}
            >
              Edit Profile ⚡
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="animate-fade-up relative space-y-6 overflow-hidden rounded-3xl border border-cyan-500/30 bg-surface/90 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
            {/* Corner Ticks */}
            <div className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t-2 border-l-2 border-cyan-400" />
            <div className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 border-t-2 border-r-2 border-violet-400" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-pink-400" />

            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar src={profile.avatar_url} name={profile.name} size={84} />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black ring-2 ring-surface">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h2>
                  <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                    SST
                  </span>
                </div>
                <p className="text-sm font-semibold text-cyan-300">{profile.role}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {profile.experience_level}
                  {profile.availability ? ` • ${profile.availability}` : ""}
                </p>
              </div>
            </div>

            {profile.bio && (
              <section className="rounded-2xl border border-white/5 bg-surface-2/60 p-4">
                <h3 className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Builder Bio
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">{profile.bio}</p>
              </section>
            )}

            <section>
              <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Skills & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((skill) => (
                  <SkillBadge
                    key={skill}
                    skill={skill}
                    verified={(profile.github_skills || []).some(
                      (g) => g.toLowerCase() === skill.toLowerCase()
                    )}
                  />
                ))}
              </div>
            </section>

            {(profile.interests || []).length > 0 && (
              <section>
                <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Interests & Tracks
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <InterestBadge key={interest} interest={interest} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Squad Looking For
              </h3>
              <p className="text-sm text-cyan-200">
                {(profile.looking_for || []).join(" • ") || "Not specified"}
              </p>
            </section>

            {(profile.github_url || profile.discord_username) && (
              <section>
                <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verified Builder Links
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 border border-cyan-500/30 rounded-lg px-2.5 py-1 bg-cyan-950/30"
                    >
                      <span>GitHub: {profile.github_url.split("/").pop()}</span>
                      <span>↗</span>
                    </a>
                  )}
                  {profile.discord_username && (
                    <span className="font-mono text-xs text-slate-300 border border-violet-500/30 rounded-lg px-2.5 py-1 bg-violet-950/30">
                      Discord: <strong className="text-white">{profile.discord_username}</strong>
                    </span>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : (
          <ProfileEditForm
            key={profile.updated_at}
            user={user}
            initial={profile}
            onCancel={() => setEditing(false)}
          />
        )}
      </main>
    </>
  );
}
