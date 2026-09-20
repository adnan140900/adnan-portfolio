export type ClusterTransitionDirection = "enter-cluster" | "exit-cluster" | "enter-subject" | "exit-subject";
export type ClusterTransitionMode = "cinematic" | "compact" | "reduced";

export type ClusterTransitionState =
  | { phase: "idle" }
  | {
      phase: "exiting" | "awaiting-route" | "entering";
      direction: ClusterTransitionDirection;
      mode: ClusterTransitionMode;
      nodeId: string;
      originPath: string;
      targetPath: string;
    };

export type ClusterTransitionEvent =
  | {
      type: "start";
      direction: ClusterTransitionDirection;
      mode: ClusterTransitionMode;
      nodeId: string;
      originPath: string;
      targetPath: string;
    }
  | { type: "route-requested" }
  | { type: "route-ready" }
  | { type: "complete" }
  | { type: "cancel" };

export const idleClusterTransition: ClusterTransitionState = { phase: "idle" };

export function clusterTransitionReducer(
  state: ClusterTransitionState,
  event: ClusterTransitionEvent,
): ClusterTransitionState {
  switch (event.type) {
    case "start":
      if (state.phase !== "idle") return state;
      return {
        phase: "exiting",
        direction: event.direction,
        mode: event.mode,
        nodeId: event.nodeId,
        originPath: event.originPath,
        targetPath: event.targetPath,
      };
    case "route-requested":
      return state.phase === "exiting" ? { ...state, phase: "awaiting-route" } : state;
    case "route-ready":
      return state.phase === "awaiting-route" ? { ...state, phase: "entering" } : state;
    case "complete":
    case "cancel":
      return idleClusterTransition;
  }
}

export function isClusterTransitionActive(state: ClusterTransitionState) {
  return state.phase !== "idle";
}
