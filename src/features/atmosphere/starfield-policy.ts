import { motionTokens } from "../motion/motion-tokens";
import type { ExperienceProfile } from "../experience/experience-profile";

export interface StarfieldProfileInput {
  height: number;
  profile: Pick<ExperienceProfile, "motionPreference" | "performance" | "pointer" | "viewport">;
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
  profile,
  width,
}: StarfieldProfileInput): StarfieldProfile {
  const area = Math.max(width * height, 1);
  const isMobile = profile.viewport === "compact";
  const isLowPower = profile.performance === "constrained";
  const baseCount = isMobile
    ? clamp(Math.round(area / 3_600), 80, 140)
    : clamp(Math.round(area / 1_350), 440, 900);
  const total = Math.round(baseCount * (isLowPower ? 0.62 : 1));

  return {
    farStarCount: Math.round(total * 0.78),
    midStarCount: Math.max(total - Math.round(total * 0.78), 1),
    parallaxEnabled:
      !isMobile && !isLowPower && profile.pointer === "fine" && profile.motionPreference === "full",
    animate: profile.motionPreference === "full",
    fps: isLowPower ? motionTokens.ambient.constrainedFps : isMobile ? motionTokens.ambient.mobileFps : motionTokens.ambient.desktopFps,
  };
}
