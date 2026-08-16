import { StageArt } from "@/components/game-ui/StageArt";

/**
 * Stable mount point for future Phaser (or other) browser games.
 * TODO: initialize the engine against #game-root-{gameId} without rewriting site chrome.
 */
export function GameViewport({
  gameId,
  locked = true,
  label = "CABINET OFFLINE",
  art,
}: {
  gameId: string;
  locked?: boolean;
  label?: string;
  art?: string;
}) {
  return (
    <div
      id={`game-root-${gameId}`}
      className="relative flex aspect-video items-center justify-center overflow-hidden border border-cyan/30 bg-black"
    >
      <StageArt src={art} seed={gameId} className="absolute inset-0" />
      <div className="absolute inset-0 bg-void/55" />
      {locked ? (
        <p className="relative font-pixel text-[10px] tracking-[0.18em] text-lime">{label}</p>
      ) : (
        <p className="relative font-hud text-[10px] text-muted">Engine slot ready.</p>
      )}
    </div>
  );
}
