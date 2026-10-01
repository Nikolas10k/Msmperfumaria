import { RoseAurora } from "./rose-aurora";

export function CinematicHeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bg" aria-hidden="true">
      <RoseAurora />
      <div className="cinematic-beam" />
      <div className="cinematic-grain" />
    </div>
  );
}
