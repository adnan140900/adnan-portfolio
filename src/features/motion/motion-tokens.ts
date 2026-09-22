/** Seconds and CSS-pixel amplitudes shared by atmosphere, interaction and cinema. */
export const motionTokens = {
  ambient: { desktopFps: 24, mobileFps: 24, constrainedFps: 12, drift: 0.32, twinkle: 0.08, breathingSeconds: 12, scale: 0.012, edgeInterval: 18, edgeDuration: 2.2 },
  pointer: { far: 3, mid: 8, semantic: 2, proximity: 115, response: 0.38 },
  transition: { travel: 0.42, resolve: 0.3, fade: 0.14, compact: 0.18, branch: 0.32, star: 0.2, label: 0.2, stagger: 0.12 },
  scroll: { scrub: 0.55, step: 1, depth: 28, scale: 1.045, maxVelocity: 1800, velocityDisplacement: 5 },
  ease: { travel: "power3.inOut", reveal: "power2.out", quiet: "power1.out" },
} as const;

export function clampMotion(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : 0));
}

export function motionCanRun(motionPreference: "unresolved" | "full" | "reduced", visible: boolean, intersecting: boolean) {
  return motionPreference === "full" && visible && intersecting;
}
