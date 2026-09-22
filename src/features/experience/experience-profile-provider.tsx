"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createExperienceProfile,
  unresolvedExperienceProfile,
  type ExperienceProfile,
} from "./experience-profile";

const ExperienceProfileContext = createContext<ExperienceProfile>(unresolvedExperienceProfile);

function isConstrainedPerformance() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  return (
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
    (navigatorWithMemory.deviceMemory !== undefined && navigatorWithMemory.deviceMemory <= 4)
  );
}

export function ExperienceProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ExperienceProfile>(unresolvedExperienceProfile);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 47.999rem)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const constrainedPerformance = isConstrainedPerformance();
    const synchronize = () => setProfile(createExperienceProfile({
      prefersReducedMotion: reduced.matches,
      compactViewport: compact.matches,
      coarsePointer: coarse.matches,
      constrainedPerformance,
      hidden: document.hidden,
    }));

    synchronize();
    reduced.addEventListener("change", synchronize);
    compact.addEventListener("change", synchronize);
    coarse.addEventListener("change", synchronize);
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      reduced.removeEventListener("change", synchronize);
      compact.removeEventListener("change", synchronize);
      coarse.removeEventListener("change", synchronize);
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, []);

  return <ExperienceProfileContext.Provider value={profile}>{children}</ExperienceProfileContext.Provider>;
}

export function useExperienceProfile() {
  return useContext(ExperienceProfileContext);
}
