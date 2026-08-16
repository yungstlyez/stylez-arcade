/**
 * Shared arcade-stage placeholders for tabs, windows, and screens
 * that do not yet have dedicated artwork.
 * Replace a specific usage by passing a dedicated `art` / `src` path.
 *
 * Scene files are GIFs so looping animation is preserved.
 */
export const PLACEHOLDER_STAGES = [
  "/art/placeholders/stage-shrine.gif",
  "/art/placeholders/stage-wreck.gif",
  "/art/placeholders/stage-throne.gif",
  "/art/placeholders/stage-mansion.gif",
  "/art/placeholders/stage-skyline.gif",
  "/art/placeholders/stage-el-train.gif",
] as const;

/** Locked, unreleased, secret, paid, or otherwise deliberately ambiguous screens. */
export const STAGE_THRONE = "/art/placeholders/stage-throne.gif";

/** Title-screen / under-the-EL Southside scene. Fallback for generated city imagery. */
export const STAGE_EL_TRAIN = "/art/placeholders/stage-el-train.gif";
export const CITY_SCENE = STAGE_EL_TRAIN;

export function placeholderStage(seed = "stylez"): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_STAGES[Math.abs(hash) % PLACEHOLDER_STAGES.length];
}
