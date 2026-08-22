// Server-side GitHub sync. The PAT (GITHUB_PAT env var) lives only on
// the server - browsers call this endpoint and never see the token.
//
// POST { username } ->
//   { login, avatarUrl, publicRepos, languages[], topics[], syncedAt }
//
// Derives verified skills from repo languages (repos pushed in the last
// year count double so current skills outweigh stale ones) and interests
// from repo topics.

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function topKeys(counts, n) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

function prettifyTopic(topic) {
  return topic
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function POST(request) {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    return Response.json(
      { error: "GitHub sync is not configured on the server." },
      { status: 500 }
    );
  }

  let username = "";
  try {
    const body = await request.json();
    username = String(body?.username || "").trim();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return Response.json({ error: "Enter a valid GitHub username first." }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "hackmates-app",
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
        { headers }
      ),
    ]);

    if (userRes.status === 404) {
      return Response.json({ error: "GitHub user not found." }, { status: 404 });
    }
    if (userRes.status === 401 || userRes.status === 403) {
      return Response.json(
        { error: "GitHub rejected the request - check the GITHUB_PAT or rate limit." },
        { status: 502 }
      );
    }
    if (!userRes.ok || !reposRes.ok) {
      return Response.json({ error: "GitHub API request failed." }, { status: 502 });
    }

    const user = await userRes.json();
    // Forks don't prove expertise; only count original repos
    const repos = (await reposRes.json()).filter((r) => r && r.fork === false);

    const langCount = {};
    const topicCount = {};
    const cutoff = Date.now() - YEAR_MS;
    for (const repo of repos) {
      const weight =
        repo.pushed_at && new Date(repo.pushed_at).getTime() > cutoff ? 2 : 1;
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + weight;
      }
      for (const topic of repo.topics || []) {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      }
    }

    return Response.json({
      login: user.login,
      avatarUrl: user.avatar_url,
      publicRepos: repos.length,
      languages: topKeys(langCount, 6),
      topics: topKeys(topicCount, 8).map(prettifyTopic),
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GitHub sync failed:", err.message);
    return Response.json({ error: "Could not reach GitHub right now." }, { status: 502 });
  }
}
