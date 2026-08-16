export type UiSoundId = "hover" | "select" | "press" | "unlock";

/**
 * UI SFX hook. Wire files later.
 * Do not autoplay. Call only from explicit user gestures when enabled.
 */
export function cueUiSound(_id: UiSoundId) {
  void _id;
}
