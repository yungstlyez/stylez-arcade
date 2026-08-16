export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function statusLabel(status: string) {
  if (status === "locked") return "LOCKED";
  if (status === "live") return "LIVE";
  if (status === "beta") return "BETA";
  if (status === "recovered") return "RECOVERED";
  if (status === "damaged") return "DAMAGED";
  return status.toUpperCase();
}
