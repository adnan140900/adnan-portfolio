"use client";

import { useExperienceProfile } from "@/features/experience/experience-profile-provider";

/** Compatibility adapter. New motion code should consume the full experience profile. */
export function usePrefersReducedMotion() {
  const { motionPreference } = useExperienceProfile();
  return motionPreference === "unresolved" ? null : motionPreference === "reduced";
}
