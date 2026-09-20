import type { GraphEdge, GraphNode } from "../types";
import type { ForceGraphLink, ForceGraphNode, GraphPoint } from "./types";

export const GRAPH_WIDTH = 1040;
export const GRAPH_HEIGHT = 580;
export const GRAPH_CENTER: GraphPoint = {
  x: GRAPH_WIDTH / 2,
  y: GRAPH_HEIGHT / 2,
};

export const NODE_BOX = {
  width: 200,
  height: 112,
} as const;

// Math.sin/cos can differ in their last binary digit between Node and Chromium.
// Serialize the initial layout at subpixel precision so hydration sees identical SVG.
function initialCoordinate(value: number) {
  return Number(value.toFixed(4));
}

function collisionRadiusFor(node: GraphNode, isRoot: boolean) {
  // Include the wrapped label footprint, not just the luminous point.
  const labelRadius = node.label.length > 26 ? 110 : 100;
  return Math.max(labelRadius, isRoot ? 116 : 96 + node.weight * 8);
}

function hashValue(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function rootAnchorFor(rootNodeId: string): GraphPoint {
  return {
    x: GRAPH_CENTER.x + (hashValue(`${rootNodeId}:x`) - 0.5) * 42,
    y: GRAPH_CENTER.y + (hashValue(`${rootNodeId}:y`) - 0.5) * 28,
  };
}

/** Deterministic first frame and reduced-motion layout; not a final physics position. */
export function createStableGraphNodes(
  nodes: GraphNode[],
  rootNodeId: string,
): ForceGraphNode[] {
  const orbitNodes = nodes.filter((node) => node.id !== rootNodeId);
  const rootAnchor = nodes.find(node => node.id === rootNodeId)?.kind === "person" ? GRAPH_CENTER : rootAnchorFor(rootNodeId);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const universe = nodes.find(node => node.id === rootNodeId)?.kind === "person";
  const flood = rootNodeId === "research-flood-accessibility";

  return nodes.map((node) => {
    const isRoot = node.id === rootNodeId;
    const orbitIndex = orbitNodes.findIndex((candidate) => candidate.id === node.id);
    const angle = orbitIndex * goldenAngle + (hashValue(`${node.id}:angle`) - 0.5) * 0.72;
    const radius =
      Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) *
      (0.23 + hashValue(`${node.id}:radius`) * 0.17);
    let x = rootAnchor.x + Math.cos(angle) * radius * 1.34;
    let y = rootAnchor.y + Math.sin(angle) * radius * 0.86;
    if (universe) {
      const ringAngle = -Math.PI * 5 / 6 + orbitIndex * Math.PI / 3;
      x = GRAPH_CENTER.x + Math.cos(ringAngle) * 270;
      y = GRAPH_CENTER.y + Math.sin(ringAngle) * 155;
    }
    if (flood && !isRoot) {
      // Approved categories separate methods from research questions.
      const categoryNodes = orbitNodes.filter(candidate => candidate.category === node.category);
      const index = categoryNodes.findIndex(candidate => candidate.id === node.id);
      if (node.category === "engineering") { x = 205; y = 170 + index * 230; }
      else { x = 780 + (index % 2) * 90; y = 90 + index * 125; }
    }

    return {
      id: node.id,
      kind: node.kind,
      weight: node.weight,
      isRoot,
      collisionRadius: collisionRadiusFor(node, isRoot),
      x: initialCoordinate(isRoot ? rootAnchor.x : Math.min(Math.max(x, 110), GRAPH_WIDTH - 110)),
      y: initialCoordinate(isRoot ? rootAnchor.y : Math.min(Math.max(y, 80), GRAPH_HEIGHT - 80)),
      vx: 0,
      vy: 0,
    };
  });
}

export function createConstellationPath(
  source: GraphPoint,
  target: GraphPoint,
  edgeId: string,
) {
  // Stable IDs remain part of the adapter contract for future segmented routing.
  void edgeId;
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

export function createForceGraphLinks(edges: GraphEdge[]): ForceGraphLink[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));
}

export function resolveForcePoint(
  endpoint: string | ForceGraphNode,
  nodesById: Map<string, ForceGraphNode>,
) {
  return typeof endpoint === "string" ? nodesById.get(endpoint) : endpoint;
}
