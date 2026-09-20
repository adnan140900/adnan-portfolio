import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import type { GraphEdgeId, GraphNodeId, GraphNodeKind } from "../types";

export interface ForceGraphNode extends SimulationNodeDatum {
  id: GraphNodeId;
  kind: GraphNodeKind;
  weight: number;
  isRoot: boolean;
  collisionRadius: number;
}

export interface ForceGraphLink extends SimulationLinkDatum<ForceGraphNode> {
  id: GraphEdgeId;
  source: GraphNodeId | ForceGraphNode;
  target: GraphNodeId | ForceGraphNode;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface ForceGraphController {
  readonly dragEnabled: boolean;
  beginDrag(nodeId: GraphNodeId, point: GraphPoint): boolean;
  drag(nodeId: GraphNodeId, point: GraphPoint): void;
  endDrag(nodeId: GraphNodeId): void;
  pause(): void;
  destroy(): void;
}
