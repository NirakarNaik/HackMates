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
  "Hey! Good to match - what are you thinking of building?",
  "Sounds good! Weekends work best for me.",
  "Nice, I had a similar idea in mind. Want to sketch it out together?",
  "Let's do it. I can take the backend if you cover the UI.",
  "Cool! Share the repo or idea doc whenever you are ready.",
  "Agreed - shall we set up a quick call this weekend?",
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
        if (fetchError) throw fetchError;
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

    const channel = supabase
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

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  async function insertMessage(senderId, body) {
    const supabase = getSupabase();
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({ match_id: matchId, sender_id: senderId, body })
      .select()
      .single();
    if (insertError) throw insertError;
    appendMessage(data);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop-in flex h-[80vh] max-h-[640px] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-hairline bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
          <Avatar src={match.avatar_url} name={match.name} size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold leading-tight">{match.name}</h3>
            <p className="truncate text-xs text-violet-300">{match.role}</p>
          </div>
          {typeof match.score === "number" && <ScorePill score={match.score} />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="ml-1 cursor-pointer rounded-lg px-2 py-1 text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-end space-y-2 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}
          {!loading && error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          {!loading && !error && messages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              Say hi to {match.name?.split(" ")[0] || "your teammate"} - this is the start of your
              conversation.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                    mine ? "bg-gradient-to-r from-accent to-accent-2 text-white" : "border border-hairline bg-surface-2"
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-hairline px-4 py-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${match.name || "your teammate"}`}
            maxLength={MAX_LEN}
            disabled={loading || Boolean(error)}
            className="flex-1 rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" variant="primary" loading={sending} disabled={!draft.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
