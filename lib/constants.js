export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "ML/AI Developer",
  "Data Scientist",
  "UI/UX Designer",
  "Mobile Developer",
  "DevOps",
  "Product/Business",
  "Beginner Developer",
];

export const SKILLS = [
  "Python",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "Figma",
  "UI/UX",
  "Branding",
  "Docker",
  "AWS",
  "Kubernetes",
];

export const INTERESTS = [
  "AI/ML",
  "Web Development",
  "Mobile",
  "Cybersecurity",
  "FinTech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "Open Source",
  "Gaming",
  "Climate",
  "Developer Tools",
];

export const LOOKING_FOR = [
  "Hackathon Teammate",
  "Coding Buddy",
  "Project Partner",
  "Frontend Developer",
  "Backend Developer",
  "ML Engineer",
  "Designer",
  "UI/UX",
  "DevOps",
];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const AVAILABILITY_OPTIONS = [
  "Weekday evenings",
  "Weekends",
  "Flexible",
  "Full-time during hackathons",
];

// Maps a role / looking-for option to the concrete skills that satisfy it.
// Used by the matching algorithm so complementarity works across vocabularies
// (e.g. B needs a "Frontend Developer" and A has React -> complementary).
// Keys are normalized via lib/utils.js norm(): lowercase, alphanumerics only.
export const ROLE_SKILL_MAP = {
  frontenddeveloper: ["React", "Next.js", "JavaScript"],
  frontend: ["React", "Next.js", "JavaScript"],
  backenddeveloper: ["Node.js", "PostgreSQL", "MongoDB", "SQL", "Java"],
  backend: ["Node.js", "PostgreSQL", "MongoDB", "SQL", "Java"],
  fullstackdeveloper: ["React", "Next.js", "Node.js", "PostgreSQL"],
  mlengineer: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Pandas"],
  mlaideveloper: ["Python", "Machine Learning", "TensorFlow", "PyTorch"],
  datascientist: ["Python", "SQL", "Machine Learning", "Pandas"],
  designer: ["Figma", "UI/UX", "Branding"],
  uiux: ["Figma", "UI/UX"],
  devops: ["Docker", "AWS", "Kubernetes"],
  mobiledeveloper: ["JavaScript", "React"],
  beginnerdeveloper: [],
};
