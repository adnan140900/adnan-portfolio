import type { ClusterTransitionMode } from "./transition-state";
import type { ExperienceProfile } from "../experience/experience-profile";

interface TransitionPolicyInput {
  profile: Pick<ExperienceProfile, "motionPreference" | "viewport">;
}

export function selectClusterTransitionMode({
  profile,
}: TransitionPolicyInput): ClusterTransitionMode {
  if (profile.motionPreference !== "full") return "reduced";
  return profile.viewport === "wide" ? "cinematic" : "mobile-cinematic";
}
