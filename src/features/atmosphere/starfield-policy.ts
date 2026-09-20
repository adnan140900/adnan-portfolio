import { motionTokens } from "../motion/motion-tokens";

export interface StarfieldProfileInput {
  height: number;
  isLowPower: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
  width: number;
}

export interface StarfieldProfile {
  farStarCount: number;
  midStarCount: number;
  parallaxEnabled: boolean;
  animate: boolean;
  fps: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getStarfieldProfile({
  height,
  isLowPower,
  isMobile,
  prefersReducedMotion,
  width,
}: StarfieldProfileInput): StarfieldProfile {
  const area = Math.max(width * height, 1);
  const baseCount = isMobile
    ? clamp(Math.round(area / 3_600), 80, 140)
    : clamp(Math.round(area / 1_350), 440, 900);
  const total = Math.round(baseCount * (isLowPower ? 0.62 : 1));

  return {
    farStarCount: Math.round(total * 0.78),
    midStarCount: Math.max(total - Math.round(total * 0.78), 1),
    parallaxEnabled:
      !isMobile && !isLowPower && prefersReducedMotion === false,
    animate: prefersReducedMotion === false && !isLowPower && !isMobile,
    fps: isMobile ? motionTokens.ambient.mobileFps : motionTokens.ambient.desktopFps,
  };
}
