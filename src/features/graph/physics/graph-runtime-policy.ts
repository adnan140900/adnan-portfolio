export interface GraphRuntimePolicyInput {
  isDesktop: boolean;
  hasFinePointer: boolean;
  prefersReducedMotion: boolean | null;
}

export interface GraphRuntimePolicy {
  shouldCreateController: boolean;
  shouldAnimate: boolean;
  dragEnabled: boolean;
}

export function getGraphRuntimePolicy({
  isDesktop,
  hasFinePointer,
  prefersReducedMotion,
}: GraphRuntimePolicyInput): GraphRuntimePolicy {
  const motionAllowed = prefersReducedMotion === false;

  return {
    shouldCreateController: isDesktop,
    shouldAnimate: isDesktop && motionAllowed,
    dragEnabled: isDesktop && hasFinePointer && motionAllowed,
  };
}
