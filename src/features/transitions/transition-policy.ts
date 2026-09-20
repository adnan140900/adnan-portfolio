import type { ClusterTransitionMode } from "./transition-state";

interface TransitionPolicyInput {
  isDesktop: boolean;
  prefersReducedMotion: boolean | null;
}

export function selectClusterTransitionMode({
  isDesktop,
  prefersReducedMotion,
}: TransitionPolicyInput): ClusterTransitionMode {
  if (prefersReducedMotion !== false) return "reduced";
  return isDesktop ? "cinematic" : "compact";
}
