import { ROLE_SKILL_MAP } from "./constants.js";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Lowercase, alphanumeric-only key used for case/spacing-insensitive matching
export function norm(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((v) => typeof v === "string" && v.trim() !== "");
}

// Set intersection of two arrays, compared case-insensitively.
// Returns the canonical (original casing from a) values found in both.
export function intersect(a, b) {
  const bKeys = new Set(normalizeArray(b).map(norm));
  return normalizeArray(a).filter((v) => bKeys.has(norm(v)));
}

export function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic pastel hue from a string, for avatar backgrounds
export function hueFromString(str) {
  let hash = 0;
  const s = str || "";
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Expands a role / looking-for label into the set of skill keys that satisfy it
export function expandToSkills(labels) {
  const expanded = new Set();
  for (const label of normalizeArray(labels)) {
    const mapped = ROLE_SKILL_MAP[norm(label)];
    if (mapped) {
      mapped.forEach((s) => expanded.add(s));
    } else {
      // Unknown free-text entry: match it directly as a skill token
      expanded.add(label);
    }
  }
  return [...expanded];
}

// ---------------------------------------------------------------
// GitHub sync helpers (profile.github_* filled by /api/github/sync)
// ---------------------------------------------------------------
// Extracts the username from a GitHub URL ("https://github.com/octo")
// or accepts a bare username. Returns null when nothing usable.
export function extractGithubUsername(url) {
  const value = (url || "").trim();
  if (!value) return null;
  const fromUrl = value.match(/github\.com\/([A-Za-z0-9-]{1,39})/i);
  if (fromUrl) return fromUrl[1];
  if (/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value)) return value;
  return null;
}

export function githubSkillsOf(profile) {
  return normalizeArray(profile?.github_skills);
}

// True when the claimed skill is backed by the profile's GitHub languages
export function hasGithubSkill(profile, skill) {
  return githubSkillsOf(profile).some((s) => norm(s) === norm(skill));
}

// Self-reported skills merged with GitHub-verified languages, deduped.
// Used by the matcher so real-world evidence counts alongside claims.
export function effectiveSkills(profile) {
  const seen = new Set();
  const out = [];
  for (const s of [...normalizeArray(profile?.skills), ...githubSkillsOf(profile)]) {
    const key = norm(s);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}
