// Client-safe canonical-watch-URL validator. Keeps broken/embed/shorts/
// channel-search URLs from ever reaching the DOM, even if old plans
// generated before the resource-db fix are still cached in the database.
export function canonicalYouTubeWatch(url: unknown): string {
  if (typeof url !== "string" || !url) return "";
  const m = url.match(/^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})(?:[&#].*)?$/);
  if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
  const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([A-Za-z0-9_-]{11})/);
  if (id) return `https://www.youtube.com/watch?v=${id[1]}`;
  return "";
}
