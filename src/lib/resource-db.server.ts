// Curated, hand-verified resource database.
// Rule: every YouTube URL here is a canonical watch URL
// (https://www.youtube.com/watch?v=VIDEOID, 11-char id). No /embed/, no
// /shorts/, no youtu.be, no channel /search URLs (those trigger
// "refused to connect" on many networks). Every URL is validated at
// runtime by cleanYouTube — anything malformed is dropped, and the UI
// then renders "Video currently unavailable".

import { cleanYouTube } from "./link-sanitize.server";

export type ResourceVideo = { title: string; url: string };
export type SkillResources = {
  roadmap?: string;
  videos: ResourceVideo[];
  course?: string;
  practice?: string;
  docs?: string;
};

// Long-stable, full-length tutorials uploaded by major creators
// (freeCodeCamp, Fireship, ByteByteGo, TechWorld with Nana, NeetCode,
// Web Dev Simplified, etc.). Re-verify with cleanYouTube on lookup.
const RAW_DB: Record<string, SkillResources> = {
  frontend: {
    roadmap: "https://roadmap.sh/frontend",
    videos: [
      { title: "freeCodeCamp — Responsive Web Design (full course)", url: "https://www.youtube.com/watch?v=mU6anWqZJcc" },
      { title: "Web Dev Simplified — Frontend in 2024", url: "https://www.youtube.com/watch?v=zJSY8tbf_ys" },
    ],
    course: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    docs: "https://developer.mozilla.org/en-US/docs/Learn",
    practice: "https://www.frontendmentor.io",
  },
  backend: {
    roadmap: "https://roadmap.sh/backend",
    videos: [
      { title: "freeCodeCamp — Node.js & Express full course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      { title: "Hussein Nasser — Backend Engineering Basics", url: "https://www.youtube.com/watch?v=9z2BfVrM7H4" },
    ],
    course: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    practice: "https://leetcode.com/problemset/",
  },
  "full-stack": {
    roadmap: "https://roadmap.sh/full-stack",
    videos: [
      { title: "freeCodeCamp — MERN full-stack course", url: "https://www.youtube.com/watch?v=7CqJlxBYj-M" },
      { title: "Traversy Media — Full Stack roadmap", url: "https://www.youtube.com/watch?v=ZxKM3DCV2kE" },
    ],
    course: "https://www.freecodecamp.org/learn/",
  },
  devops: {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "TechWorld with Nana — DevOps full bootcamp", url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY" },
      { title: "freeCodeCamp — DevOps full course", url: "https://www.youtube.com/watch?v=Xrgk023l4lI" },
    ],
  },
  react: {
    roadmap: "https://roadmap.sh/react",
    videos: [
      { title: "freeCodeCamp — React full course", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
      { title: "Web Dev Simplified — Learn React in 30 min", url: "https://www.youtube.com/watch?v=hQAHSlTtcmY" },
    ],
    docs: "https://react.dev/learn",
    practice: "https://www.frontendmentor.io",
  },
  javascript: {
    roadmap: "https://roadmap.sh/javascript",
    videos: [
      { title: "freeCodeCamp — JavaScript full course", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
      { title: "Fireship — JS in 100 seconds", url: "https://www.youtube.com/watch?v=DHjqpvDnNGE" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    course: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
  },
  typescript: {
    roadmap: "https://roadmap.sh/typescript",
    videos: [
      { title: "freeCodeCamp — TypeScript full course", url: "https://www.youtube.com/watch?v=30LWjhZzg50" },
      { title: "Fireship — TypeScript in 100 seconds", url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA" },
    ],
    docs: "https://www.typescriptlang.org/docs/",
  },
  nodejs: {
    roadmap: "https://roadmap.sh/nodejs",
    videos: [
      { title: "freeCodeCamp — Node.js & Express full course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      { title: "Hussein Nasser — Node.js internals", url: "https://www.youtube.com/watch?v=_l163NUA4eQ" },
    ],
    docs: "https://nodejs.org/en/learn",
  },
  python: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — Python full course for beginners", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
      { title: "Corey Schafer — Python basics", url: "https://www.youtube.com/watch?v=YYXdXT2l-Gg" },
    ],
    docs: "https://docs.python.org/3/tutorial/",
    practice: "https://www.hackerrank.com/domains/python",
  },
  sql: {
    roadmap: "https://roadmap.sh/sql",
    videos: [
      { title: "freeCodeCamp — SQL full course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
    ],
    practice: "https://leetcode.com/problemset/database/",
  },
  "system-design": {
    roadmap: "https://roadmap.sh/system-design",
    videos: [
      { title: "ByteByteGo — System Design playlist intro", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I" },
      { title: "Gaurav Sen — System Design fundamentals", url: "https://www.youtube.com/watch?v=xpDnVSmNFX0" },
    ],
    practice: "https://neetcode.io/practice",
  },
  "data-structures-and-algorithms": {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "freeCodeCamp — Data Structures full course", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM" },
      { title: "Abdul Bari — Algorithms", url: "https://www.youtube.com/watch?v=0IAPZzGSbME" },
    ],
    practice: "https://leetcode.com/problemset/",
  },
  "ai-data-scientist": {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "StatQuest — Machine Learning fundamentals", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI" },
      { title: "3Blue1Brown — Neural Networks (Ch. 1)", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
    ],
    practice: "https://www.kaggle.com/learn",
  },
  android: {
    roadmap: "https://roadmap.sh/android",
    videos: [
      { title: "Philipp Lackner — Android Kotlin basics", url: "https://www.youtube.com/watch?v=BBWyXo-3JGQ" },
    ],
    docs: "https://developer.android.com/courses",
  },
  ios: {
    roadmap: "https://roadmap.sh/ios",
    videos: [
      { title: "Sean Allen — iOS development for beginners", url: "https://www.youtube.com/watch?v=F2ojC6TNwws" },
    ],
  },
  "ux-design": {
    roadmap: "https://roadmap.sh/ux-design",
    videos: [
      { title: "Flux Academy — UX design process", url: "https://www.youtube.com/watch?v=v6FfMu8gv2A" },
    ],
  },
  "product-manager": {
    roadmap: "https://roadmap.sh/product-manager",
    videos: [
      { title: "Lenny — How to be a great PM", url: "https://www.youtube.com/watch?v=l4-Bf2u3gPo" },
    ],
  },
  qa: {
    roadmap: "https://roadmap.sh/qa",
    videos: [
      { title: "Raghav Pal — Automation testing", url: "https://www.youtube.com/watch?v=6Ywsj19eY44" },
    ],
  },
  git: {
    videos: [
      { title: "freeCodeCamp — Git & GitHub full course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
      { title: "Fireship — Git in 100 seconds", url: "https://www.youtube.com/watch?v=hwP7WQkmECE" },
    ],
    docs: "https://git-scm.com/doc",
  },
  docker: {
    videos: [
      { title: "TechWorld with Nana — Docker full course", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
    ],
    docs: "https://docs.docker.com/get-started/",
  },
  kubernetes: {
    videos: [
      { title: "TechWorld with Nana — Kubernetes full course", url: "https://www.youtube.com/watch?v=X48VuDVv0do" },
    ],
    docs: "https://kubernetes.io/docs/tutorials/",
  },
  aws: {
    videos: [
      { title: "freeCodeCamp — AWS Certified Cloud Practitioner", url: "https://www.youtube.com/watch?v=SOTamWNgDKc" },
    ],
    docs: "https://aws.amazon.com/getting-started/",
  },
};

// Run every video URL through cleanYouTube once at module init. Anything
// that is not a canonical watch URL gets stripped, guaranteeing the UI
// only ever receives links of the form
// https://www.youtube.com/watch?v=VIDEOID.
const DB: Record<string, SkillResources> = Object.fromEntries(
  Object.entries(RAW_DB).map(([key, val]) => [
    key,
    {
      ...val,
      videos: val.videos
        .map((v) => ({ title: v.title, url: cleanYouTube(v.url) }))
        .filter((v) => v.url.length > 0),
    },
  ]),
);

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
  for (const key of Object.keys(DB)) {
    if (n.includes(key) || key.includes(n)) return DB[key];
  }
  for (const [a, key] of Object.entries(ALIASES)) {
    if (n.includes(a)) return DB[key] ?? null;
  }
  return null;
}

export function videosForSkill(name: string | undefined | null): ResourceVideo[] {
  const r = lookupSkill(name);
  if (!r) return [];
  const seen = new Set<string>();
  const out: ResourceVideo[] = [];
  for (const v of r.videos) {
    const url = cleanYouTube(v.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title: v.title, url });
    if (out.length >= 3) break;
  }
  return out;
}
