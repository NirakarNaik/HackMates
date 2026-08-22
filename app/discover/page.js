"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import MatchModal from "@/components/MatchModal";
import { EmptyState, CardSkeleton } from "@/components/EmptyState";
import Button from "@/components/Button";
import { useProtectedUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { calculateCompatibility } from "@/lib/matching";
import { ensureDemoProfiles } from "@/lib/demoData";

// Demo profiles always like back, so every Like in a single-account demo
// triggers the full mutual-match flow (match modal + matches page entry).
// (Previously liked back only at score >= 65, which meant most Likes -
// everything below the first couple of highest-scoring cards - produced
// no visible response at all.)
const DEMO_LIKE_BACK_THRESHOLD = 0;

export default function DiscoverPage() {
  const router = useRouter();
  const { loading: authLoading, user, profile } = useProtectedUser();

  const [candidates, setCandidates] = useState([]);
  const [index, setCurrentIndex] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);

  // Redirect to onboarding until the profile is complete
  useEffect(() => {
    if (!authLoading && !profile && !error) {
      router.replace("/onboarding");
    }
  }, [authLoading, profile, error, router]);

  // Load discovery candidates (README section 18)
  useEffect(() => {
    if (authLoading || !user || !profile) return;

    let active = true;

    (async () => {
      try {
        const supabase = getSupabase();

        await ensureDemoProfiles();

        // Everyone already swiped on
        const { data: mySwipes, error: swipesError } = await supabase
          .from("swipes")
          .select("target_user_id")
          .eq("user_id", user.id);

        if (swipesError) throw swipesError;
        const excluded = new Set((mySwipes || []).map((s) => s.target_user_id));
        excluded.add(user.id);

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) throw profilesError;

        const pool = (profilesData || [])
          .filter((p) => !excluded.has(p.user_id))
          .map((p) => ({
            ...p,
            compat: calculateCompatibility(profile, p),
          }))
          .sort((a, b) => b.compat.score - a.compat.score);

        if (!active) return;
        setCandidates(pool);
        setCurrentIndex(0);
        setPageLoading(false);
      } catch (err) {
        console.error("Discovery load failed:", err.message);
        if (!active) return;
        setError("Could not load teammates. Please refresh to try again.");
        setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user, profile]);

  async function saveSwipe(targetUserId, action) {
    const supabase = getSupabase();
    const { error: swipeError } = await supabase
      .from("swipes")
      .upsert(
        { user_id: user.id, target_user_id: targetUserId, action },
        { onConflict: "user_id,target_user_id" }
      );
    if (swipeError) throw swipeError;
  }

  async function createMatchWith(otherProfile, compatibility) {
    const supabase = getSupabase();
    // Canonical pair order prevents duplicate rows (README section 13)
    const [firstId, secondId] =
      user.id < otherProfile.user_id
        ? [user.id, otherProfile.user_id]
        : [otherProfile.user_id, user.id];

    const { error: matchError } = await supabase
      .from("matches")
      .insert({
        user1_id: firstId,
        user2_id: secondId,
        compatibility_score: compatibility.score,
        compatibility_reasons: compatibility.reasons,
      });

    // Unique-violation = match already exists, safe to ignore
    if (matchError && matchError.code !== "23505") throw matchError;
  }

  async function handleLike() {
    const target = candidates[index];
    if (!target || swiping) return;

    setSwiping(true);
    try {
      await saveSwipe(target.user_id, "LIKE");

      // Reciprocal like check (README section 27)
      let isMutual = false;
      if (target.is_demo) {
        isMutual = target.compat.score >= DEMO_LIKE_BACK_THRESHOLD;
      } else {
        const supabase = getSupabase();
        const { data: reciprocal, error: recError } = await supabase
          .from("swipes")
          .select("id")
          .eq("user_id", target.user_id)
          .eq("target_user_id", user.id)
          .eq("action", "LIKE")
          .maybeSingle();
        if (recError) throw recError;
        isMutual = Boolean(reciprocal);
      }

      if (isMutual) {
        await createMatchWith(target, target.compat);
        setMatchInfo({
          profile: target,
          score: target.compat.score,
          reasons: target.compat.reasons,
        });
      }
    } catch (err) {
      console.error("Like failed:", err.message);
      setError("Could not save your like. Please try again.");
    } finally {
      setSwiping(false);
      setCurrentIndex((i) => i + 1);
    }
  }

  async function handlePass() {
    const target = candidates[index];
    if (!target || swiping) return;

    setSwiping(true);
    try {
      await saveSwipe(target.user_id, "PASS");
    } catch (err) {
      console.error("Pass failed:", err.message);
      setError("Could not save your pass. Please try again.");
    } finally {
      setSwiping(false);
      setCurrentIndex((i) => i + 1);
    }
  }

  const current = candidates[index];
  const remaining = candidates.length - index;

  // Keyboard shortcuts: ArrowLeft = pass, ArrowRight = like
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (matchInfo || swiping || pageLoading || authLoading || error) return;
      if (!candidates[index]) return;
      if (e.key === "ArrowLeft") handlePass();
      else handleLike();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchInfo, swiping, pageLoading, authLoading, error, candidates, index]);

  const content = useMemo(() => {
    if (authLoading || pageLoading) {
      return <CardSkeleton />;
    }
    if (error) {
      return (
        <EmptyState icon="⚠️" title="Something went wrong" description={error}>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </EmptyState>
      );
    }
    if (current) {
      return (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">Discover</h1>
            <p className="mt-1 text-sm text-muted">
              Swipe through builders ranked by how well you complement each other.
            </p>
          </div>
          <ProfileCard
            key={current.user_id}
            profile={current}
            compatibility={current.compat}
            onLike={handleLike}
            onPass={handlePass}
            disabled={swiping}
          />
          <p className="mt-5 text-center text-xs text-muted">
            {remaining} builder{remaining === 1 ? "" : "s"} remaining
          </p>
        </>
      );
    }
    return (
      <EmptyState
        icon="🎉"
        title="No more teammates"
        description="You've seen everyone nearby. Check back later for new builders."
      >
        <Button variant="secondary" onClick={() => router.push("/matches")}>
          View your matches
        </Button>
      </EmptyState>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, pageLoading, error, current, remaining, swiping]);

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        {content}
      </main>
      {matchInfo && (
        <MatchModal
          matchedProfile={matchInfo.profile}
          score={matchInfo.score}
          reasons={matchInfo.reasons}
          onClose={() => setMatchInfo(null)}
        />
      )}
    </>
  );
}
