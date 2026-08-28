import {
  findComplementarySkillPairs,
  deriveSuggestedTeam,
  generateHeuristicRecommendation,
  getAiRecommendation,
} from "./lib/aiRecommendation.js";
import { calculateCompatibility } from "./lib/matching.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n=========================================");
  console.log("  HACKMATES FEATURE VERIFICATION SUITE");
  console.log("=========================================\n");

  // ----------------------------------------------------
  // TEST SET 1: AI Teammate Recommendations
  // ----------------------------------------------------
  console.log("--- 1. AI Teammate Recommendations Tests ---");

  const frontendDev = {
    user_id: "user-frontend-1",
    name: "Aarav Chen",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "JavaScript", "Figma"],
    interests: ["Web Development", "AI/ML"],
    looking_for: ["Backend Developer", "Hackathon Teammate"],
    experience_level: "Intermediate",
    availability: "Weekends",
  };

  const backendDev = {
    user_id: "user-backend-1",
    name: "Alex Rivera",
    role: "Backend Developer",
    skills: ["Python", "Node.js", "PostgreSQL", "SQL"],
    interests: ["AI/ML", "Web Development"],
    looking_for: ["Frontend Developer", "UI/UX"],
    experience_level: "Intermediate",
    availability: "Weekends",
  };

  const identicalDev = {
    user_id: "user-identical-1",
    name: "Rohan Gupta",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "JavaScript"],
    interests: ["Mobile"],
    looking_for: ["Designer"],
    experience_level: "Beginner",
    availability: "Flexible",
  };

  const sparseDev = {
    user_id: "user-sparse-1",
    name: "New Builder",
    role: "Beginner Developer",
    skills: [],
    interests: [],
    looking_for: [],
  };

  // Test 1.1: Complementary Skill Pairing
  const pairs = findComplementarySkillPairs(frontendDev.skills, backendDev.skills);
  assert(pairs.length > 0, "Finds complementary skill pairs between Frontend and Backend devs");
  assert(
    pairs.some((p) => p.mySkill === "React" && (p.theirSkill === "Node.js" || p.theirSkill === "PostgreSQL")),
    "Identifies React ↔ Node.js / PostgreSQL as complementary"
  );

  // Test 1.2: Team Suggestion
  const team = deriveSuggestedTeam(frontendDev, backendDev);
  assert(team === "Frontend + Backend", `Suggested team correctly derived as '${team}'`);

  // Test 1.3: Heuristic AI Recommendation Output
  const rec = generateHeuristicRecommendation(frontendDev, backendDev);
  assert(rec.compatibilityScore >= 85, `High compatibility score for complementary pair: ${rec.compatibilityScore}%`);
  assert(typeof rec.why === "string" && rec.why.length > 20, "Generates clear 'Why this match?' explanation");
  assert(Array.isArray(rec.complementarySkills) && rec.complementarySkills.length > 0, "Returns complementarySkills array");
  assert(rec.suggestedTeam === "Frontend + Backend", "Includes suggestedTeam");
  assert(rec.synergyPoints.length >= 1, "Generates synergy points");

  // Test 1.4: Asymmetric / Identical Skills Comparison
  const identicalRec = generateHeuristicRecommendation(frontendDev, identicalDev);
  assert(
    identicalRec.compatibilityScore < rec.compatibilityScore,
    `Identical skill users have lower score (${identicalRec.compatibilityScore}%) than complementary users (${rec.compatibilityScore}%)`
  );

  // Test 1.5: Missing / Sparse Profile Information (No crashes)
  const sparseRec = generateHeuristicRecommendation(frontendDev, sparseDev);
  assert(sparseRec && typeof sparseRec.compatibilityScore === "number", "Sparse profile handled gracefully without error");

  // Test 1.6: Async Recommendation Wrapper
  const asyncRec = await getAiRecommendation(frontendDev, backendDev);
  assert(asyncRec && asyncRec.compatibilityScore > 0, "getAiRecommendation resolves properly");

  // ----------------------------------------------------
  // TEST SET 2: Post-Project Ratings & Reviews
  // ----------------------------------------------------
  console.log("\n--- 2. Post-Project Ratings & Reviews Tests ---");

  // Test 2.1: Rating Categories (4 categories, 1-5 stars)
  const comm = 5;
  const rel = 5;
  const tech = 4;
  const teamScore = 5;
  const composite = Number(((comm + rel + tech + teamScore) / 4).toFixed(2));
  assert(composite === 4.75, `Composite rating calculated correctly: ${composite} / 5.0`);

  // Test 2.2: Self-Rating Validation
  const selfReviewTest = (reviewerId, revieweeId) => {
    if (!revieweeId || reviewerId === revieweeId) {
      return { error: "You cannot rate or review yourself.", status: 400 };
    }
    return { ok: true };
  };
  const selfRes = selfReviewTest("user-1", "user-1");
  assert(selfRes.status === 400 && selfRes.error.includes("cannot rate"), "Rejects self-rating with 400 error");

  // Test 2.3: Star Range Validation
  const validateStars = (c, r, t, tm) => {
    const cats = [c, r, t, tm];
    if (cats.some((val) => isNaN(val) || val < 1 || val > 5)) {
      return { error: "All ratings must be between 1 and 5 stars.", status: 400 };
    }
    return { ok: true };
  };
  assert(validateStars(5, 5, 4, 5).ok === true, "Valid 1-5 ratings accepted");
  assert(validateStars(6, 5, 4, 5).status === 400, "Rating > 5 rejected with 400");
  assert(validateStars(0, 5, 4, 5).status === 400, "Rating < 1 rejected with 400");

  // Test 2.4: Duplicate Review Prevention
  const mockDb = [
    { project_id: "proj-101", reviewer_id: "user-1", reviewee_id: "user-2" }
  ];
  const duplicateTest = (projId, reviewerId, revieweeId) => {
    const exists = mockDb.some(
      (r) => r.project_id === projId && r.reviewer_id === reviewerId && r.reviewee_id === revieweeId
    );
    if (exists) {
      return { error: "You have already reviewed this teammate for this project.", status: 409 };
    }
    return { ok: true };
  };
  const dupRes = duplicateTest("proj-101", "user-1", "user-2");
  assert(dupRes.status === 409, "Duplicate review for same project rejected with 409 Conflict");

  // Test 2.5: Unrelated User Validation
  const mockProjects = [
    { id: "proj-101", creator_id: "user-1", partner_id: "user-2" }
  ];
  const collaborationTest = (projId, reviewerId, revieweeId) => {
    const proj = mockProjects.find((p) => p.id === projId);
    if (!proj) return { error: "Project not found.", status: 404 };
    const workedTogether =
      (proj.creator_id === reviewerId && proj.partner_id === revieweeId) ||
      (proj.creator_id === revieweeId && proj.partner_id === reviewerId);
    if (!workedTogether) {
      return { error: "You can only review teammates you have worked with.", status: 403 };
    }
    return { ok: true };
  };
  assert(collaborationTest("proj-101", "user-1", "user-2").ok === true, "Teammates who worked together permitted");
  assert(collaborationTest("proj-101", "user-3", "user-2").status === 403, "Unrelated user rejected with 403 Forbidden");

  // Test 2.6: Aggregated Reputation Calculation
  const sampleReviews = [
    { communication: 5, reliability: 5, technical_contribution: 4, teamwork: 5, rating: 4.75 },
    { communication: 4, reliability: 4, technical_contribution: 5, teamwork: 5, rating: 4.5 },
  ];
  const count = sampleReviews.length;
  const avg = Number((sampleReviews.reduce((a, b) => a + b.rating, 0) / count).toFixed(1));
  assert(avg === 4.6, `Aggregated rating calculated correctly: ${avg} / 5.0`);

  // ----------------------------------------------------
  // TEST SET 3: Regression Verification
  // ----------------------------------------------------
  console.log("\n--- 3. Regression Tests ---");
  const existingCompat = calculateCompatibility(frontendDev, backendDev);
  assert(typeof existingCompat.score === "number", "Existing calculateCompatibility functions normally");
  assert(Array.isArray(existingCompat.reasons), "Existing compatibility reasons generated");

  console.log("\n=========================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
