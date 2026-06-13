// Server-only utilities that strip fabricated or malformed external links.
// Keeps UI free of 404s when the model hallucinates a URL.

const ROADMAP_ALLOW = new Set([
  "frontend","backend","full-stack","devops","python","javascript","typescript",
  "react","nodejs","sql","system-design","ai-data-scientist","android","ios",
  "ux-design","design-system","product-manager","qa","computer-science",
  "datastructures-and-algorithms","java","golang","rust","cyber-security",
  "blockchain","game-developer","data-analyst","mlops","postgresql-dba",
  "software-architect","software-design-architecture","prompt-engineering",
]);

const SAFE_HOSTS = new Set([
  "www.freecodecamp.org","freecodecamp.org",
  "www.coursera.org","coursera.org",
  "www.udemy.com","udemy.com",
  "nptel.ac.in","onlinecourses.nptel.ac.in",
  "leetcode.com","www.leetcode.com",
  "www.hackerrank.com","hackerrank.com",
  "www.kaggle.com","kaggle.com",
  "www.frontendmentor.io","frontendmentor.io",
  "developer.mozilla.org",
  "react.dev","nodejs.org","www.python.org","docs.python.org",
  "github.com","www.github.com",
  "neetcode.io","excalidraw.com",
  "roadmap.sh","www.roadmap.sh",
]);

export function cleanYouTube(url: unknown): string {
  if (typeof url !== "string") return "";
  const m = url.match(/^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})(?:[&#].*)?$/);
  if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
  // Convert recognized variants → canonical
  const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([A-Za-z0-9_-]{11})/);
  if (id) return `https://www.youtube.com/watch?v=${id[1]}`;
  return "";
}

export function cleanRoadmap(url: unknown): string {
  if (typeof url !== "string") return "";
  try {
    const u = new URL(url);
    if (u.hostname !== "roadmap.sh" && u.hostname !== "www.roadmap.sh") return "";
    const slug = u.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
    return ROADMAP_ALLOW.has(slug) ? `https://roadmap.sh/${slug}` : "";
  } catch {
    return "";
  }
}

export function cleanGeneric(url: unknown): string {
  if (typeof url !== "string" || !url) return "";
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    return SAFE_HOSTS.has(u.hostname) ? u.toString() : "";
  } catch {
    return "";
  }
}

export function dedupeVideos<T extends { title?: string; url?: string }>(items: unknown): Array<{ title: string; url: string }> {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const out: Array<{ title: string; url: string }> = [];
  for (const v of items as T[]) {
    const url = cleanYouTube(v?.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title: String(v?.title ?? "Watch").slice(0, 140), url });
    if (out.length >= 3) break;
  }
  return out;
}
