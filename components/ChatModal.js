"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import { ScorePill } from "./CompatibilityScore";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";

const MAX_LEN = 2000;

// Canned replies used when the chat partner is a demo profile so the
// chat experience can be demonstrated end-to-end with a single account.
const DEMO_REPLIES = [
  "Hey! Great matching with you - what tech stack or track are you planning for the hackathon?",
  "Sounds awesome! I'm completely down to team up. Weekends and late night sprints work great for me.",
  "Nice! I have some experience with that. Want to sketch out the system design together?",
  "Let's do it! I can handle backend and API design if you cover the UI/frontend.",
  "Cool! Share the repo or idea doc whenever you're ready and let's start hacking.",
  "Agreed - let's connect on Discord or set up a quick sync this week!",
];

function randomReply() {
  return DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
}

// Realtime chat between matched users (Supabase postgres_changes).
export default function ChatModal({ match, matchId, myId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const seenIds = useRef(new Set());

  function appendMessage(message) {
    if (message.id == null || seenIds.current.has(message.id)) return;
    seenIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }

  // Load history once, then subscribe to new messages for this match
  useEffect(() => {
    let active = true;
    const supabase = getSupabase();

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true })
          .limit(500);
        if (fetchError) {
          if (
            fetchError.code === "PGRST205" ||
            fetchError.message?.includes("messages")
          ) {
            // Table not yet migrated on live Supabase instance - continue in local mode
            if (!active) return;
            setLoading(false);
            return;
          }
          throw fetchError;
        }
        if (!active) return;
        (data || []).forEach((m) => appendMessage(m));
        setLoading(false);
      } catch (err) {
        console.error("Chat load failed:", err.message);
        if (!active) return;
        setError("Chat is unavailable right now.");
        setLoading(false);
      }
    })();

    let channel;
    try {
      channel = supabase
        .channel(`chat-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => appendMessage(payload.new)
        )
        .subscribe();
    } catch {
      // Supabase realtime channel fallback
    }

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  async function insertMessage(senderId, body) {
    const supabase = getSupabase();
    try {
      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({ match_id: matchId, sender_id: senderId, body })
        .select()
        .single();
      if (insertError) throw insertError;
      appendMessage(data);
    } catch (err) {
      if (
        err.code === "PGRST205" ||
        err.message?.includes("messages")
      ) {
        const localMsg = {
          id: `local-${Date.now()}-${Math.random()}`,
          match_id: matchId,
          sender_id: senderId,
          body,
          created_at: new Date().toISOString(),
        };
        appendMessage(localMsg);
        return;
      }
      throw err;
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setDraft("");
    setSending(true);
    try {
      await insertMessage(myId, body);

      if (match.is_demo) {
        setTimeout(() => {
          insertMessage(match.user_id, randomReply()).catch((err) =>
            console.error("Demo reply failed:", err.message)
          );
        }, 900 + Math.random() * 1400);
      }
    } catch (err) {
      console.error("Send failed:", err.message);
      setError("Message could not be sent. Please try again.");
      setDraft(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in relative flex h-[82vh] max-h-[660px] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-surface/95 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
        {/* Mecha Corner Ticks */}
        <div className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-violet-400" />

        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-cyan-500/20 bg-surface-2/70 px-5 py-4">
          <div className="relative">
            <Avatar src={match.avatar_url} name={match.name} size={42} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-surface animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-bold text-white leading-tight">{match.name}</h3>
              <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1 py-0.2 font-mono text-[8px] font-bold text-cyan-300">
                SST
              </span>
            </div>
            <p className="truncate text-xs text-cyan-300 font-medium">{match.role}</p>
          </div>
          {typeof match.score === "number" && <ScorePill score={match.score} />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="ml-2 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex flex-1 flex-col justify-end space-y-3 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            </div>
          )}
          {!loading && error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          {!loading && !error && messages.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-cyan-300">⚡ Match Connection Established</p>
              <p>
                Say hi to {match.name?.split(" ")[0] || "your teammate"} to coordinate your hackathon project!
              </p>
            </div>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    mine
                      ? "bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 text-white font-medium"
                      : "border border-cyan-500/20 bg-surface-2/90 text-slate-200"
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-cyan-500/20 bg-surface-2/50 px-4 py-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${match.name || "teammate"}...`}
            maxLength={MAX_LEN}
            disabled={loading || Boolean(error)}
            className="flex-1 rounded-xl border border-hairline bg-surface-2 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            loading={sending}
            disabled={!draft.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 font-bold"
          >
            Send ⚡
          </Button>
        </form>
      </div>
    </div>
  );
}
