// AI Teammate Recommendation Engine
// Prioritizes complementary skills over identical skills.
// Supports external LLM (Gemini API via GEMINI_API_KEY) with a fallback
// intelligent complementary matching engine for complete reliability.

import { effectiveSkills, normalizeArray, norm, intersect } from "./utils.js";

// Complementary skill cross-pairs
const COMPLEMENTARY_MAP = {
  react: ["Node.js", "Python", "PostgreSQL", "MongoDB", "SQL", "Java", "Docker"],
  "next.js": ["Node.js", "PostgreSQL", "Python", "Docker", "MongoDB", "AWS"],
  javascript: ["Python", "SQL", "PostgreSQL", "Java", "Docker"],
  "ui/ux": ["React", "Next.js", "Frontend", "Node.js", "Python"],
  figma: ["React", "Next.js", "Frontend", "Tailwind CSS", "Flutter"],
  branding: ["Full Stack Developer", "Frontend Developer"],
  python: ["React", "Next.js", "Figma", "UI/UX", "JavaScript"],
  "machine learning": ["React", "Next.js", "UI/UX", "Figma", "Frontend Developer"],
  tensorflow: ["React", "Next.js", "UI/UX", "JavaScript"],
  pytorch: ["React", "Next.js", "UI/UX", "JavaScript"],
  pandas: ["React", "Next.js", "SQL", "UI/UX"],
  "node.js": ["React", "Next.js", "Figma", "UI/UX", "Python"],
  postgresql: ["React", "Next.js", "UI/UX", "Figma", "Python"],
  mongodb: ["React", "Next.js", "UI/UX", "Figma"],
  sql: ["React", "Next.js", "UI/UX", "Python"],
  java: ["React", "Next.js", "UI/UX", "Figma"],
  "c++": ["Python", "React", "Machine Learning"],
  docker: ["React", "Next.js", "Python", "Frontend Developer"],
  aws: ["React", "Next.js", "Python", "Frontend Developer"],
  kubernetes: ["React", "Next.js", "Node.js", "Full Stack Developer"],
};

// Find concrete complementary skill pairs between two profiles
export function findComplementarySkillPairs(mySkills, theirSkills) {
  const pairs = [];
  const seen = new Set();

  const myNorm = mySkills.map((s) => ({ raw: s, n: norm(s) }));
  const theirNorm = theirSkills.map((s) => ({ raw: s, n: norm(s) }));

  for (const mine of myNorm) {
    const targets = COMPLEMENTARY_MAP[mine.n] || [];
    for (const target of targets) {
      const match = theirNorm.find((t) => t.n === norm(target));
      if (match) {
        const key = `${mine.raw}↔${match.raw}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({ mySkill: mine.raw, theirSkill: match.raw });
        }
      }
    }
  }

  // Also check reverse if pairs are sparse
  for (const theirs of theirNorm) {
    const targets = COMPLEMENTARY_MAP[theirs.n] || [];
    for (const target of targets) {
      const match = myNorm.find((m) => m.n === norm(target));
      if (match) {
        const key = `${match.raw}↔${theirs.raw}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({ mySkill: match.raw, theirSkill: theirs.raw });
        }
      }
    }
  }

  return pairs.slice(0, 5);
}

// Derive suggested team role
export function deriveSuggestedTeam(me, them) {
  const r1 = me.role || "Developer";
  const r2 = them.role || "Developer";

  const n1 = norm(r1);
  const n2 = norm(r2);

  if (
    (n1.includes("frontend") && n2.includes("backend")) ||
    (n1.includes("backend") && n2.includes("frontend"))
  ) {
    return "Frontend + Backend";
  }
  if (
    (n1.includes("ml") || n1.includes("data") || n1.includes("ai")) &&
    (n2.includes("frontend") || n2.includes("ui"))
  ) {
    return "AI/ML Engineer + Frontend UI";
  }
  if (
    (n2.includes("ml") || n2.includes("data") || n2.includes("ai")) &&
    (n1.includes("frontend") || n1.includes("ui"))
  ) {
    return "Frontend UI + AI/ML Engineer";
  }
  if (
    (n1.includes("designer") || n1.includes("ui")) &&
    (n2.includes("fullstack") || n2.includes("developer"))
  ) {
    return "Product Designer + Full Stack Engineer";
  }
  if (
    (n2.includes("designer") || n2.includes("ui")) &&
    (n1.includes("fullstack") || n1.includes("developer"))
  ) {
    return "Full Stack Engineer + Product Designer";
  }
  if (n1.includes("devops") || n2.includes("devops")) {
    return "Cloud/DevOps + Core Engineer";
  }

  return `${r1} + ${r2}`;
}

// Built-in complementary reasoning engine
export function generateHeuristicRecommendation(me, them) {
  const mySkills = effectiveSkills(me);
  const theirSkills = effectiveSkills(them);

  const pairs = findComplementarySkillPairs(mySkills, theirSkills);
  const suggestedTeam = deriveSuggestedTeam(me, them);

  // Overlapping tracks/interests
  const sharedTracks = intersect(me.interests || [], them.interests || []);

  // Shared or complementary goals
  const myNeeds = normalizeArray(me.looking_for || []);
  const theirNeeds = normalizeArray(them.looking_for || []);

  // Compute complementary compatibility score
  let baseScore = 70;
  if (pairs.length >= 3) baseScore += 18;
  else if (pairs.length >= 1) baseScore += 12;

  if (sharedTracks.length > 0) baseScore += Math.min(8, sharedTracks.length * 3);
  if (me.availability && them.availability && me.availability === them.availability) {
    baseScore += 4;
  }

  const compatibilityScore = Math.min(98, Math.max(65, baseScore));

  // Construct personalized "Why this match?"
  let why = "";
  if (pairs.length > 0) {
    const pairSample = pairs.slice(0, 2).map((p) => `${p.mySkill} ↔ ${p.theirSkill}`).join(", ");
    why = `Your skills complement ${them.name}'s capabilities (${pairSample}). Together, you form a balanced squad ready to execute full-stack solutions.`;
  } else if (sharedTracks.length > 0) {
    why = `You and ${them.name} share focused interests in ${sharedTracks.join(" & ")}, making collaboration natural for hackathon tracks.`;
  } else {
    why = `Your background as ${me.role || "a developer"} aligns with ${them.name}'s focus as ${them.role || "a builder"}.`;
  }

  const synergyPoints = [];
  if (pairs.length > 0) {
    synergyPoints.push(`Complementary tech stack: ${pairs.map((p) => `${p.mySkill} ↔ ${p.theirSkill}`).join(", ")}`);
  }
  if (sharedTracks.length > 0) {
    synergyPoints.push(`Targeting shared hackathon tracks: ${sharedTracks.join(", ")}`);
  }
  if (myNeeds.length > 0 && theirSkills.some((s) => myNeeds.some((n) => norm(n).includes(norm(s))))) {
    synergyPoints.push(`${them.name} provides exact skills you are actively looking for`);
  }
  if (theirNeeds.length > 0 && mySkills.some((s) => theirNeeds.some((n) => norm(n).includes(norm(s))))) {
    synergyPoints.push(`You provide high-priority capabilities ${them.name} needs`);
  }
  if (synergyPoints.length === 0) {
    synergyPoints.push(`Compatible experience levels: ${me.experience_level || "Intermediate"} & ${them.experience_level || "Intermediate"}`);
  }

  return {
    compatibilityScore,
    why,
    complementarySkills: pairs.length > 0 ? pairs : [{ mySkill: mySkills[0] || me.role, theirSkill: theirSkills[0] || them.role }],
    suggestedTeam,
    synergyPoints: synergyPoints.slice(0, 3),
  };
}

// Main AI Recommendation function
export async function getAiRecommendation(me, them) {
  if (!me || !them) {
    throw new Error("Both user profiles are required for recommendation.");
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const mySkills = effectiveSkills(me).join(", ");
      const theirSkills = effectiveSkills(them).join(", ");
      const myInterests = (me.interests || []).join(", ");
      const theirInterests = (them.interests || []).join(", ");

      const prompt = `You are the AI teammate matching engine for HackMates, a developer hackathon platform.
Analyze these two developers and assess their COMPLEMENTARY skills and team synergy.

Developer 1 (Current User):
- Name: ${me.name}
- Role: ${me.role}
- Skills: ${mySkills}
- Interests: ${myInterests}
- Looking for: ${(me.looking_for || []).join(", ")}
- Experience: ${me.experience_level}
- Availability: ${me.availability}

Developer 2 (Potential Teammate):
- Name: ${them.name}
- Role: ${them.role}
- Skills: ${theirSkills}
- Interests: ${theirInterests}
- Looking for: ${(them.looking_for || []).join(", ")}
- Experience: ${them.experience_level}
- Availability: ${them.availability}

Output strictly valid JSON with no markdown and no backticks:
{
  "compatibilityScore": integer from 60 to 99,
  "why": "concise 2-sentence explanation emphasizing complementary skill synergies",
  "complementarySkills": [
    { "mySkill": "Developer 1 skill", "theirSkill": "Developer 2 skill" }
  ],
  "suggestedTeam": "e.g. Frontend + Backend or Product Designer + Full Stack",
  "synergyPoints": ["point 1", "point 2", "point 3"]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          if (parsed.compatibilityScore && parsed.why) {
            return {
              compatibilityScore: Math.round(parsed.compatibilityScore),
              why: parsed.why,
              complementarySkills: Array.isArray(parsed.complementarySkills) ? parsed.complementarySkills : [],
              suggestedTeam: parsed.suggestedTeam || deriveSuggestedTeam(me, them),
              synergyPoints: Array.isArray(parsed.synergyPoints) ? parsed.synergyPoints : [],
              source: "gemini",
            };
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API recommendation error, using heuristic fallback:", err.message);
    }
  }

  // Deterministic complementary engine fallback
  const result = generateHeuristicRecommendation(me, them);
  return {
    ...result,
    source: "heuristic-ai",
  };
}
