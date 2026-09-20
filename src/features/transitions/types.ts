import type {
  ClusterTransitionDirection,
  ClusterTransitionMode,
} from "./transition-state";

export interface ClusterTransitionRequest {
  href: string;
  label: string;
  nodeId: string;
}

export interface PortfolioTransitionContextValue {
  direction: ClusterTransitionDirection | null;
  enterCluster(request: ClusterTransitionRequest): boolean;
  exitCluster(request: ClusterTransitionRequest): boolean;
  enterSubject(request: ClusterTransitionRequest): boolean;
  exitSubject(request: ClusterTransitionRequest): boolean;
  isTargetPath(pathname: string): boolean;
  isTransitioning: boolean;
  mode: ClusterTransitionMode | null;
  phase: "idle" | "exiting" | "awaiting-route" | "entering";
  targetPath: string | null;
}
