"use client";

import Navbar from "@/components/Navbar";
import { useProtectedUser } from "@/lib/auth";
import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
  const { loading, user, profile, error } = useProtectedUser();

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

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl flex-1 px-4 py-10">
          <p className="rounded-xl border border-hairline bg-surface p-4 text-sm text-muted">
            {error}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        {user && (
          <OnboardingForm key={profile ? profile.updated_at : "new"} user={user} existingProfile={profile} />
        )}
      </main>
    </>
  );
}
