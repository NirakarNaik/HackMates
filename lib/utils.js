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
