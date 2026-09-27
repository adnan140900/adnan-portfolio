"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import type { GraphNode } from "../graph/types";
import type { ExperienceProfile } from "../experience/experience-profile";
import { createUniverseMotion } from "./universe-motion-controller";

// Document lifetime, not storage: reload plays Genesis; internal return does not.
let genesisComplete = false;
const startedOnHome = typeof window !== "undefined" && window.location.pathname === "/";

export function useUniverseMotion(rootRef: RefObject<HTMLElement | null>, svgRef: RefObject<SVGSVGElement | null>, nodes: GraphNode[], routePath: string, profile: ExperienceProfile, transitioning: boolean) {
  const played = useRef(false);
  useLayoutEffect(() => {
    if (routePath !== "/" || profile.motionPreference !== "full" || transitioning || !rootRef.current || !svgRef.current) return;
    return createUniverseMotion(rootRef.current, svgRef.current, nodes, profile.viewport, startedOnHome && !played.current && !genesisComplete, () => { played.current = true; genesisComplete = true; });
  }, [rootRef, svgRef, nodes, routePath, profile.motionPreference, profile.viewport, transitioning]);
}
