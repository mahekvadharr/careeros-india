// Curated, hand-verified resource database.
// Rule: every URL here was manually checked. The AI is NEVER allowed to
// invent URLs — server code looks up skills in this map and only those
// validated entries reach the UI. If a skill is not found, the UI shows
// "Resource currently unavailable" instead of a broken link.

export type ResourceVideo = { title: string; url: string };
export type SkillResources = {
  roadmap?: string;              // roadmap.sh (official only)
  videos: ResourceVideo[];       // 2-3 stable YouTube channel / playlist URLs
  course?: string;               // canonical course root
  practice?: string;             // canonical practice site
  docs?: string;                 // official docs
};

// All YouTube URLs are channel or playlist URLs (extremely stable) or
// long-standing freeCodeCamp full-course IDs that have existed for years.
// Channel URLs are valid watch entry points and open in YouTube normally.
const DB: Record<string, SkillResources> = {
  frontend: {
    roadmap: "https://roadmap.sh/frontend",
    videos: [
      { title: "freeCodeCamp — Frontend tutorials", url: "https://www.youtube.com/@freecodecamp/search?query=frontend" },
      { title: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified" },
    ],
    course: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    docs: "https://developer.mozilla.org/en-US/docs/Learn",
    practice: "https://www.frontendmentor.io",
  },
  backend: {
    roadmap: "https://roadmap.sh/backend",
    videos: [
      { title: "freeCodeCamp — Backend tutorials", url: "https://www.youtube.com/@freecodecamp/search?query=backend" },
      { title: "Hussein Nasser — Backend Engineering", url: "https://www.youtube.com/@hnasr" },
    ],
    course: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    practice: "https://leetcode.com/problemset/",
  },
  "full-stack": {
    roadmap: "https://roadmap.sh/full-stack",
    videos: [
      { title: "freeCodeCamp — Full stack tutorials", url: "https://www.youtube.com/@freecodecamp/search?query=full+stack" },
      { title: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia" },
    ],
    course: "https://www.freecodecamp.org/learn/",
  },
  devops: {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "TechWorld with Nana — DevOps", url: "https://www.youtube.com/@TechWorldwithNana" },
      { title: "freeCodeCamp — DevOps tutorials", url: "https://www.youtube.com/@freecodecamp/search?query=devops" },
    ],
  },
  react: {
    roadmap: "https://roadmap.sh/react",
    videos: [
      { title: "React docs — official tutorials", url: "https://www.youtube.com/@reactjs" },
      { title: "Web Dev Simplified — React", url: "https://www.youtube.com/@WebDevSimplified" },
    ],
    docs: "https://react.dev/learn",
    practice: "https://www.frontendmentor.io",
  },
  javascript: {
    roadmap: "https://roadmap.sh/javascript",
    videos: [
      { title: "freeCodeCamp — JavaScript", url: "https://www.youtube.com/@freecodecamp/search?query=javascript" },
      { title: "Fireship — JS in 100 seconds and more", url: "https://www.youtube.com/@Fireship" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    course: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
  },
  typescript: {
    roadmap: "https://roadmap.sh/typescript",
    videos: [
      { title: "Matt Pocock — TypeScript", url: "https://www.youtube.com/@mattpocockuk" },
      { title: "Fireship — TS in 100 seconds", url: "https://www.youtube.com/@Fireship" },
    ],
    docs: "https://www.typescriptlang.org/docs/",
  },
  nodejs: {
    roadmap: "https://roadmap.sh/nodejs",
    videos: [
      { title: "freeCodeCamp — Node.js", url: "https://www.youtube.com/@freecodecamp/search?query=node.js" },
      { title: "Hussein Nasser — Node internals", url: "https://www.youtube.com/@hnasr" },
    ],
    docs: "https://nodejs.org/en/learn",
  },
  python: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — Python", url: "https://www.youtube.com/@freecodecamp/search?query=python" },
      { title: "Corey Schafer — Python", url: "https://www.youtube.com/@coreyms" },
    ],
    docs: "https://docs.python.org/3/tutorial/",
    practice: "https://www.hackerrank.com/domains/python",
  },
  sql: {
    roadmap: "https://roadmap.sh/sql",
    videos: [
      { title: "freeCodeCamp — SQL tutorials", url: "https://www.youtube.com/@freecodecamp/search?query=sql" },
    ],
    practice: "https://leetcode.com/problemset/database/",
  },
  "system-design": {
    roadmap: "https://roadmap.sh/system-design",
    videos: [
      { title: "ByteByteGo — System Design", url: "https://www.youtube.com/@ByteByteGo" },
      { title: "Hussein Nasser — Backend & SD", url: "https://www.youtube.com/@hnasr" },
    ],
    practice: "https://neetcode.io/practice",
  },
  "data-structures-and-algorithms": {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "NeetCode — DSA", url: "https://www.youtube.com/@NeetCode" },
      { title: "Abdul Bari — Algorithms", url: "https://www.youtube.com/@abdul_bari" },
    ],
    practice: "https://leetcode.com/problemset/",
  },
  "ai-data-scientist": {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "StatQuest — ML", url: "https://www.youtube.com/@statquest" },
      { title: "3Blue1Brown — Neural networks", url: "https://www.youtube.com/@3blue1brown" },
    ],
    practice: "https://www.kaggle.com/learn",
  },
  android: {
    roadmap: "https://roadmap.sh/android",
    videos: [{ title: "Philipp Lackner — Android", url: "https://www.youtube.com/@PhilippLackner" }],
    docs: "https://developer.android.com/courses",
  },
  ios: {
    roadmap: "https://roadmap.sh/ios",
    videos: [{ title: "Sean Allen — iOS", url: "https://www.youtube.com/@seanallen" }],
  },
  "ux-design": {
    roadmap: "https://roadmap.sh/ux-design",
    videos: [{ title: "Flux Academy — UX", url: "https://www.youtube.com/@FluxAcademy" }],
  },
  "product-manager": {
    roadmap: "https://roadmap.sh/product-manager",
    videos: [{ title: "Lenny's Podcast — PM", url: "https://www.youtube.com/@LennysPodcast" }],
  },
  qa: {
    roadmap: "https://roadmap.sh/qa",
    videos: [{ title: "Automation Step by Step", url: "https://www.youtube.com/@RaghavPal" }],
  },
  git: {
    videos: [
      { title: "freeCodeCamp — Git", url: "https://www.youtube.com/@freecodecamp/search?query=git" },
      { title: "Fireship — Git", url: "https://www.youtube.com/@Fireship" },
    ],
    docs: "https://git-scm.com/doc",
  },
  docker: {
    videos: [{ title: "TechWorld with Nana — Docker", url: "https://www.youtube.com/@TechWorldwithNana" }],
    docs: "https://docs.docker.com/get-started/",
  },
  kubernetes: {
    videos: [{ title: "TechWorld with Nana — K8s", url: "https://www.youtube.com/@TechWorldwithNana" }],
    docs: "https://kubernetes.io/docs/tutorials/",
  },
  aws: {
    videos: [{ title: "freeCodeCamp — AWS", url: "https://www.youtube.com/@freecodecamp/search?query=aws" }],
    docs: "https://aws.amazon.com/getting-started/",
  },
};

// Aliases → canonical key
const ALIASES: Record<string, string> = {
  "frontend development": "frontend",
  "front-end": "frontend",
  "front end": "frontend",
  "html": "frontend", "css": "frontend", "html/css": "frontend", "tailwind": "frontend", "tailwindcss": "frontend",
  "backend development": "backend",
  "back-end": "backend",
  "back end": "backend",
  "rest api": "backend", "apis": "backend", "express": "nodejs", "expressjs": "nodejs", "express.js": "nodejs",
  "fullstack": "full-stack",
  "full stack": "full-stack",
  "mern": "full-stack", "mean": "full-stack",
  "react.js": "react", "reactjs": "react", "next.js": "react", "nextjs": "react",
  "js": "javascript", "es6": "javascript", "ecmascript": "javascript",
  "ts": "typescript",
  "node": "nodejs", "node.js": "nodejs",
  "py": "python", "django": "python", "flask": "python", "fastapi": "python",
  "postgres": "sql", "postgresql": "sql", "mysql": "sql", "databases": "sql", "database": "sql",
  "system design": "system-design", "distributed systems": "system-design",
  "dsa": "data-structures-and-algorithms",
  "data structures": "data-structures-and-algorithms",
  "algorithms": "data-structures-and-algorithms",
  "leetcode": "data-structures-and-algorithms",
  "ml": "ai-data-scientist", "machine learning": "ai-data-scientist", "ai": "ai-data-scientist",
  "deep learning": "ai-data-scientist", "data science": "ai-data-scientist",
  "ux": "ux-design", "ui/ux": "ux-design", "ui ux": "ux-design", "design": "ux-design", "figma": "ux-design",
  "product management": "product-manager", "pm": "product-manager",
  "testing": "qa", "qa testing": "qa", "automation testing": "qa",
  "ci/cd": "devops", "cicd": "devops", "github actions": "devops", "jenkins": "devops",
  "containers": "docker", "k8s": "kubernetes",
  "cloud": "aws",
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[._]+/g, " ").replace(/\s+/g, " ");
}

export function lookupSkill(name: string | undefined | null): SkillResources | null {
  if (!name) return null;
  const n = normalize(name);
  if (DB[n]) return DB[n];
  const alias = ALIASES[n];
  if (alias && DB[alias]) return DB[alias];
  // partial contains match — last resort
  for (const key of Object.keys(DB)) {
    if (n.includes(key) || key.includes(n)) return DB[key];
  }
  for (const [a, key] of Object.entries(ALIASES)) {
    if (n.includes(a)) return DB[key] ?? null;
  }
  return null;
}

// Returns at most 3 deduped, validated videos. Empty array if skill unknown.
export function videosForSkill(name: string | undefined | null): ResourceVideo[] {
  const r = lookupSkill(name);
  if (!r) return [];
  const seen = new Set<string>();
  const out: ResourceVideo[] = [];
  for (const v of r.videos) {
    if (seen.has(v.url)) continue;
    seen.add(v.url);
    out.push(v);
    if (out.length >= 3) break;
  }
  return out;
}
