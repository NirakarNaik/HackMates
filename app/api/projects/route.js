// Projects & Collaboration API
// Manages completed and in-progress projects between matched teammates.

import { createServerClient } from "@supabase/ssr";

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

const localProjectsCache = [];

export async function GET(request) {
  const supabase = createClientForRequest(request);
  if (!supabase) {
    return Response.json({ projects: localProjectsCache }, { headers: CORS_HEADERS });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  let dbProjects = [];
  try {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (Array.isArray(data)) dbProjects = data;
  } catch {
    // Fall back to memory
  }

  const userLocal = localProjectsCache.filter(
    (p) => p.creator_id === user.id || p.partner_id === user.id
  );

  return Response.json(
    { projects: [...dbProjects, ...userLocal] },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request) {
  const supabase = createClientForRequest(request);
  if (!supabase) {
    return Response.json({ error: "Database not configured." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, description, partnerId, matchId } = body;

  if (!title || !partnerId) {
    return Response.json(
      { error: "Project title and partnerId are required." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (partnerId === user.id) {
    return Response.json(
      { error: "You cannot create a solo project collaboration with yourself." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const newProject = {
    id: `proj-${Date.now()}`,
    title: String(title).trim(),
    description: String(description || "").trim(),
    creator_id: user.id,
    partner_id: partnerId,
    match_id: matchId || null,
    status: "completed",
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("projects")
      .insert(newProject)
      .select("*")
      .single();

    if (!error && data) {
      return Response.json({ ok: true, project: data }, { status: 201, headers: CORS_HEADERS });
    }
  } catch {
    // Fall back to memory
  }

  localProjectsCache.unshift(newProject);
  return Response.json({ ok: true, project: newProject }, { status: 201, headers: CORS_HEADERS });
}
