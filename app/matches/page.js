"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import ProfileDetail from "@/components/ProfileDetail";
import ChatModal from "@/components/ChatModal";
import { EmptyState } from "@/components/EmptyState";
import Button from "@/components/Button";
import { useProtectedUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export default function MatchesPage() {
  const router = useRouter();
  const { loading: authLoading, user, profile } = useProtectedUser();

  const [matches, setMatches] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [chatting, setChatting] = useState(null);

  useEffect(() => {
    if (!authLoading && !profile && !error) {
      router.replace("/onboarding");
    }
  }, [authLoading, profile, error, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;

    (async () => {
      try {
        const supabase = getSupabase();

        // Matches sorted by compatibility (README section 30)
        const { data, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("compatibility_score", { ascending: false });

        if (matchesError) throw matchesError;

        const otherIds = (data || []).map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        let profilesByUser = {};
        if (otherIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("user_id", otherIds);
          if (profilesError) throw profilesError;
          profilesByUser = Object.fromEntries(
            (profilesData || []).map((p) => [p.user_id, p])
          );
        }

        const enriched = (data || []).map((match) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          return {
            ...profilesByUser[otherId],
            matchId: match.id,
            score: match.compatibility_score,
            reasons: match.compatibility_reasons,
            matchedAt: match.created_at,
          };
        });

        if (!active) return;
        setMatches(enriched);
        setPageLoading(false);
      } catch (err) {
        console.error("Matches load failed:", err.message);
        if (!active) return;
        setError("Could not load your matches. Please refresh to try again.");
        setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  function handleConnect(match) {
    setViewing(match);
  }

  if (pageLoading || authLoading) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your matches</h1>
          <p className="mt-1 text-sm text-muted">
            Sorted by compatibility — reach out and start building.
          </p>
        </div>

        {error ? (
          <EmptyState icon="⚠️" title="Something went wrong" description={error}>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </EmptyState>
        ) : matches.length === 0 ? (
          <EmptyState
            icon="💫"
            title="No matches yet"
            description="Keep discovering — your next teammate could be one swipe away."
          >
            <Button onClick={() => router.push("/discover")}>Go to Discover</Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <MatchCard
                key={`${match.user_id}-${match.matchedAt}`}
                match={match}
                onViewProfile={setViewing}
                onConnect={handleConnect}
                onChat={setChatting}
              />
            ))}
          </div>
        )}
      </main>

      {viewing && (
        <ProfileDetail
          profile={viewing}
          score={viewing.score}
          reasons={viewing.reasons}
          onClose={() => setViewing(null)}
        />
      )}

      {chatting && (
        <ChatModal
          match={chatting}
          matchId={chatting.matchId}
          myId={user.id}
          onClose={() => setChatting(null)}
        />
      )}
    </>
  );
}
