export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
] as const;

export function matchesKonami(buffer: string[]) {
  if (buffer.length < KONAMI.length) return false;
  const slice = buffer.slice(-KONAMI.length);
  return KONAMI.every((key, index) => slice[index] === key);
}
