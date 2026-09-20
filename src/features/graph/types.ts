export type GraphNodeId = string;
export type GraphEdgeId = string;
export type GraphViewId = string;

export type GraphLevel = "universe" | "cluster" | "subject";
export type GraphNodeKind = "person" | "cluster" | "subject" | "concept";

export interface GraphNode {
  id: GraphNodeId;
  label: string;
  kind: GraphNodeKind;
  summary: string;
  route?: string;
  parentId?: GraphNodeId;
  /** Relative visual importance; the physics layer derives size and force from it. */
  weight: number;
  category?: string;
  depth?: number;
  importance?: "primary" | "featured" | "supporting";
  displayStatus?: string;
}

export interface GraphEdge {
  id: GraphEdgeId;
  source: GraphNodeId;
  target: GraphNodeId;
  relation: string;
}

export interface GraphView {
  id: GraphViewId;
  label: string;
  level: GraphLevel;
  rootNodeId: GraphNodeId;
  parentNodeId?: GraphNodeId;
  nodeIds: GraphNodeId[];
  edgeIds: GraphEdgeId[];
}

export interface GraphDocument {
  schemaVersion: string;
  source: "phase-2-placeholder" | "sanitized-public-export";
  exportedAt: string | null;
  entryViewId: GraphViewId;
  nodes: GraphNode[];
  edges: GraphEdge[];
  views: GraphView[];
}
