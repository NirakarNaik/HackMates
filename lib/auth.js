"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "./supabase";

// Fetches the current user + their profile for protected pages.
// Redirects to /login when unauthenticated.
// Returns { loading, user, profile } - profile is null when onboarding is incomplete.
export function useProtectedUser() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, user: null, profile: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!active) return;
        setState({ loading: false, user, profile });
      } catch (err) {
        console.error("Auth load failed:", err.message);
        if (!active) return;
        setError("Something went wrong while loading your session. Please try again.");
        setState((s) => ({ ...s, loading: false }));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  return { ...state, error };
}

export function fetchProfileById(userId) {
  const supabase = getSupabase();
  return supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function signOut(router) {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  router.replace("/");
}
