// Deterministic compatibility scoring (README sections 19-26).
// No ML. Weights: skills 40%, interests 25%, goals 20%, experience 10%, availability 5%.

import { intersect, norm, normalizeArray, expandToSkills, effectiveSkills } from "./utils.js";
import { ROLE_SKILL_MAP } from "./constants.js";

const WEIGHTS = {
  skill: 0.4,
  interest: 0.25,
  goal: 0.2,
  experience: 0.1,
  availability: 0.05,
};

// ---------------------------------------------------------------
// Skill complementarity (40%) - README sections 20/21
// Measures whether each side's NEEDS (looking_for) are satisfied by
// the other side's skills. Needs expand through ROLE_SKILL_MAP so
// "Frontend Developer" is satisfied by React/Next.js/JavaScript, etc.
// ---------------------------------------------------------------
// A need is skill-measurable only when ROLE_SKILL_MAP maps it to concrete
// skills. Generic goals ("Hackathon Teammate", "Coding Buddy") carry no
// skill signal and are excluded from coverage math entirely.
function isActionableNeed(need) {
  const mapped = ROLE_SKILL_MAP[norm(need)];
  return Array.isArray(mapped) && mapped.length > 0;
}

function needSatisfied(need, theirSkillLabels) {
  if (!isActionableNeed(need)) return false;
  const needExpanded = expandToSkills([need]);
  const theirSkills = expandToSkills(normalizeArray(theirSkillLabels));
  return intersect(needExpanded, theirSkills).length > 0;
}

// Fraction of one side's needs satisfied by the other's skills.
// A list with no measurable needs scores neutral (0.5) instead of
// dragging the score to zero.
function needCoverageRatio(needLabels, theirSkillLabels) {
  const actionable = normalizeArray(needLabels).filter(isActionableNeed);
  if (actionable.length === 0) return 0.5;
  const satisfied = actionable.filter((n) => needSatisfied(n, theirSkillLabels));
  return satisfied.length / actionable.length;
}

function skillComplementarity(a, b) {
  // GitHub-verified languages count as skills alongside self-reported ones
  const aSkillLabels = effectiveSkills(a);
  const bSkillLabels = effectiveSkills(b);

  // Which concrete skills does each side bring that cover the other's needs
  const aNeedsExpanded = expandToSkills(normalizeArray(a.looking_for));
  const bNeedsExpanded = expandToSkills(normalizeArray(b.looking_for));
  const bProvides = intersect(expandToSkills(bSkillLabels), aNeedsExpanded);
  const aProvides = intersect(expandToSkills(aSkillLabels), bNeedsExpanded);

  const ratioForA = needCoverageRatio(a.looking_for, bSkillLabels);
  const ratioForB = needCoverageRatio(b.looking_for, aSkillLabels);

  return {
    score: Math.round(((ratioForA + ratioForB) / 2) * 100),
    bProvides,
    aProvides,
  };
}

// Shared interests (25%) - README section 22
function sharedInterests(a, b) {
  const shared = intersect(a.interests, b.interests);
  const aInts = normalizeArray(a.interests);
  const bInts = normalizeArray(b.interests);
  const denom = Math.max(
    1,
    Math.min(aInts.length || 1, bInts.length || 1)
  );
  return { score: Math.round((shared.length / denom) * 100), shared };
}

// Goal matching (20%) - README section 23
// Overlap between what both are looking for + role/need fit in both directions.
function goalMatch(a, b) {
  const sharedGoals = intersect(a.looking_for, b.looking_for);
  const overlap =
    (sharedGoals.length /
      Math.max(1, Math.min(normalizeArray(a.looking_for).length || 1, normalizeArray(b.looking_for).length || 1))) *
    50;

  // Does B's role match something A is looking for? (and vice versa)
  const aNeedsExpanded = expandToSkills(a.looking_for);
  const bNeedsExpanded = expandToSkills(b.looking_for);
  const aRoleSkills = expandToSkills([a.role]);
  const bRoleSkills = expandToSkills([b.role]);

  const aRoleFitsB = norm(b.role) !== "" && intersect(bNeedsExpanded, aRoleSkills).length > 0;
  const bRoleFitsA = norm(a.role) !== "" && intersect(aNeedsExpanded, bRoleSkills).length > 0;
  const roleFit = ((aRoleFitsB ? 1 : 0) + (bRoleFitsA ? 1 : 0)) / 2 * 50;

  return {
    score: Math.min(100, Math.round(overlap + roleFit)),
    sharedGoals,
    aRoleFitsB,
    bRoleFitsA,
  };
}

// Experience matching (10%) - README section 24
// Same level or adjacent levels = high, two levels apart = moderate.
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
function experienceMatch(a, b) {
  const ia = LEVELS.indexOf(a.experience_level);
  const ib = LEVELS.indexOf(b.experience_level);
  if (ia === -1 || ib === -1) return 60; // missing data -> neutral
  const gap = Math.abs(ia - ib);
  if (gap === 0) return 100;
  if (gap === 1) return 90;
  return 50;
}

// Availability matching (5%) - README section 25
// Identical = high, either Flexible = compatible with most, otherwise low.
function availabilityMatch(a, b) {
  const avA = (a.availability || "").trim();
  const avB = (b.availability || "").trim();
  if (!avA || !avB) return 40; // missing data -> neutral
  if (norm(avA) === norm(avB)) return 100;
  if (norm(avA) === "flexible" || norm(avB) === "flexible") return 80;
  return 30;
}

// Generates deterministic human-readable reasons (README section 26)
function buildReasons({ me, them, skills, goals }) {
  const reasons = [];

  if (skills.bProvides.length > 0) {
    reasons.push(
      `${them.name} has the ${skills.bProvides.join(", ")} skills you're looking for`
    );
  }
  if (skills.aProvides.length > 0) {
    reasons.push(
      `You have the ${skills.aProvides.join(", ")} skills ${them.name} needs`
    );
  }
  if (goals.sharedGoals.length > 0) {
    reasons.push(`You're both looking for: ${goals.sharedGoals.join(", ")}`);
  }
  if (goals.aRoleFitsB && goals.bRoleFitsA) {
    reasons.push(`Your roles complement each other perfectly (${me.role} + ${them.role})`);
  } else if (goals.aRoleFitsB) {
    reasons.push(`${them.name} fits the ${me.role.toLowerCase()} gap on your team`);
  } else if (goals.bRoleFitsA) {
    reasons.push(`You fit what ${them.name} is looking for`);
  }

  const interestRes = sharedInterests(me, them);
  if (interestRes.shared.length > 0) {
    reasons.push(`You share an interest in ${interestRes.shared.join(", ")}`);
  }

  if (me.availability && me.availability === them.availability) {
    reasons.push(`You're both available ${me.availability.toLowerCase()}`);
  } else if (
    norm(me.availability) === "flexible" ||
    norm(them.availability) === "flexible"
  ) {
    reasons.push("Your schedules are compatible");
  }

  return reasons.slice(0, 4);
}

// Main entry point.
// Returns { score: int 0-100, reasons: string[], breakdown: {...} }
export function calculateCompatibility(me, them) {
  const skills = skillComplementarity(me, them);
  const interests = sharedInterests(me, them);
  const goals = goalMatch(me, them);
  const experience = experienceMatch(me, them);
  const availability = availabilityMatch(me, them);

  const raw =
    skills.score * WEIGHTS.skill +
    interests.score * WEIGHTS.interest +
    goals.score * WEIGHTS.goal +
    experience * WEIGHTS.experience +
    availability * WEIGHTS.availability;

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const reasons = buildReasons({ me, them, skills, goals });

  return {
    score,
    reasons,
    breakdown: {
      skills: skills.score,
      interests: interests.score,
      goals: goals.score,
      experience,
      availability,
    },
  };
}
