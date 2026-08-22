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
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your profile</h1>
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="animate-fade-up space-y-6 rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <Avatar src={profile.avatar_url} name={profile.name} size={80} />
              <div>
                <h2 className="text-xl font-extrabold">{profile.name}</h2>
                <p className="text-sm font-medium text-violet-300">{profile.role}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {profile.experience_level}
                  {profile.availability ? ` · ${profile.availability}` : ""}
                </p>
              </div>
            </div>

            {profile.bio && (
              <section>
                <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Bio
                </h3>
                <p className="text-sm leading-relaxed text-muted">{profile.bio}</p>
              </section>
            )}

            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((skill) => (
                  <SkillBadge key={skill} skill={skill} />
                ))}
              </div>
            </section>

            {(profile.interests || []).length > 0 && (
              <section>
                <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <InterestBadge key={interest} interest={interest} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Looking for
              </h3>
              <p className="text-sm">
                {(profile.looking_for || []).join(" · ") || "Not specified"}
              </p>
            </section>

            {(profile.github_url || profile.linkedin_url || profile.discord_username) && (
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Links
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {profile.discord_username && (
                    <span className="text-muted">
                      Discord:{" "}
                      <strong className="text-foreground">{profile.discord_username}</strong>
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
