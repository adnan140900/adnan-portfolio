import type { ExperienceProfile } from "../../experience/experience-profile";

export interface GraphRuntimePolicyInput {
  profile: Pick<ExperienceProfile, "motionPreference" | "pointer" | "viewport">;
}

export interface GraphRuntimePolicy {
  shouldCreateController: boolean;
  shouldAnimate: boolean;
  dragEnabled: boolean;
}

export function getGraphRuntimePolicy({
  profile,
}: GraphRuntimePolicyInput): GraphRuntimePolicy {
  const motionAllowed = profile.motionPreference === "full";
  const rendererSupportsController = true;

  return {
    shouldCreateController: rendererSupportsController,
    shouldAnimate: rendererSupportsController && motionAllowed,
    dragEnabled: profile.viewport === "wide" && profile.pointer === "fine" && motionAllowed,
  };
}
