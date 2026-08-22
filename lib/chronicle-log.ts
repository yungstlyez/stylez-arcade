import { getChronicles } from "@/lib/content";
import type { Chronicle, ChronicleMedia } from "@/types";

export const LOG_KEY = "stylez-chronicle-logs-v1";

export type ChronicleDraft = {
  id?: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  still?: string;
};

function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `log-${Date.now().toString(36)}`;
}

export function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function loadAuthoredChronicles(): Chronicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chronicle[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.slug && item?.title);
  } catch {
    return [];
  }
}

export function persistAuthoredChronicles(logs: Chronicle[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function mergeChronicles(authored: Chronicle[]): Chronicle[] {
  const catalog = getChronicles();
  const authoredIds = new Set(authored.map((item) => item.id));
  const authoredSlugs = new Set(authored.map((item) => item.slug));
  const rest = catalog.filter((item) => !authoredIds.has(item.id) && !authoredSlugs.has(item.slug));
  return [...authored, ...rest].sort((a, b) => b.number - a.number || b.date.localeCompare(a.date));
}

export function nextChronicleNumber(existing: Chronicle[]) {
  return existing.reduce((max, item) => Math.max(max, item.number), 0) + 1;
}

export function uniqueSlug(title: string, existing: Chronicle[], keepId?: string) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (existing.some((item) => item.slug === slug && item.id !== keepId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function draftToChronicle(draft: ChronicleDraft, existing: Chronicle[]): Chronicle {
  const current = draft.id ? existing.find((item) => item.id === draft.id) : undefined;
  const number = current?.number ?? nextChronicleNumber(existing);
  const media: ChronicleMedia[] = draft.still
    ? [
        {
          type: "screenshot",
          src: draft.still,
          alt: draft.title,
        },
      ]
    : current?.media ?? [];
  return {
    id: current?.id ?? `chr-log-${Date.now().toString(36)}`,
    number,
    slug: uniqueSlug(draft.title, existing, current?.id),
    title: draft.title.trim(),
    date: draft.date || todayStamp(),
    excerpt: draft.excerpt.trim(),
    content: draft.content.trim(),
    media,
    relatedSongs: current?.relatedSongs ?? [],
    relatedCharacters: current?.relatedCharacters ?? ["stylez"],
    relatedLocations: current?.relatedLocations ?? ["southside"],
    authored: true,
  };
}
