export type MotionPreference = "unresolved" | "full" | "reduced";
export type ExperienceViewport = "compact" | "wide";
export type ExperiencePointer = "coarse" | "fine";
export type ExperiencePerformance = "normal" | "constrained";
export type ExperienceVisibility = "visible" | "hidden";

export interface ExperienceProfile {
  motionPreference: MotionPreference;
  viewport: ExperienceViewport;
  pointer: ExperiencePointer;
  performance: ExperiencePerformance;
  visibility: ExperienceVisibility;
}

export const unresolvedExperienceProfile: ExperienceProfile = {
  motionPreference: "unresolved",
  viewport: "wide",
  pointer: "fine",
  performance: "normal",
  visibility: "hidden",
};

export function createExperienceProfile(input: {
  prefersReducedMotion: boolean;
  compactViewport: boolean;
  coarsePointer: boolean;
  constrainedPerformance: boolean;
  hidden: boolean;
}): ExperienceProfile {
  return {
    motionPreference: input.prefersReducedMotion ? "reduced" : "full",
    viewport: input.compactViewport ? "compact" : "wide",
    pointer: input.coarsePointer ? "coarse" : "fine",
    performance: input.constrainedPerformance ? "constrained" : "normal",
    visibility: input.hidden ? "hidden" : "visible",
  };
}

export function experienceCanAnimate(profile: Pick<ExperienceProfile, "motionPreference" | "visibility">) {
  return profile.motionPreference === "full" && profile.visibility === "visible";
}

export function experienceIsReduced(profile: Pick<ExperienceProfile, "motionPreference">) {
  return profile.motionPreference === "reduced";
}
