// Server-side AI Teammate Recommendations endpoint.
// Generates deep complementary skill analysis, "Why this match?" reasoning,
// and team composition advice.

import { createServerClient } from "@supabase/ssr";
import { getAiRecommendation } from "@/lib/aiRecommendation.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function createClientForRequest(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { targetUserId, meProfile: providedMe, themProfile: providedThem } = body;

  let me = providedMe;
  let them = providedThem;

  const supabase = createClientForRequest(request);

  if ((!me || !them) && supabase) {
    // If profiles aren't directly provided, load from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !me) {
      return Response.json(
        { error: "Unauthorized. Please sign in to request AI recommendations." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (!me && user) {
      const { data: myProf, error: myErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (myErr || !myProf) {
        return Response.json(
          { error: "Current user profile not found or incomplete." },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      me = myProf;
    }

    if (!them && targetUserId) {
      const { data: theirProf, error: theirErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (theirErr || !theirProf) {
        return Response.json(
          { error: "Target profile not found." },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      them = theirProf;
    }
  }

  if (!me || !them) {
    return Response.json(
      { error: "Both user profile and target profile are required." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const recommendation = await getAiRecommendation(me, them);
    return Response.json(
      {
        ok: true,
        targetUserId: them.user_id,
        targetName: them.name,
        recommendation,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Recommendation calculation failed:", err.message);
    return Response.json(
      { error: "Failed to generate recommendation." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
