import type { GraphDocument, GraphNode } from "../graph/types";
import type { FilmScene } from "./film-model";
import { stageEmphasis } from "./semantic-stage-model";

/** Exact public label or existing editorial topic only; never infer from prose. */
export function branchFocus(graph: GraphDocument, scene: FilmScene, kind: string, nodes: GraphNode[]) {
  const plan = stageEmphasis(graph, scene, kind, nodes);
  const exact = nodes.find(node => node.label === scene.title)?.id;
  const target = exact ?? [...plan.focus][0] ?? null;
  const ids = new Set(nodes.map(node => node.id));
  const edges = graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target) && (edge.source === target || edge.target === target));
  return { target, neighbors: new Set(edges.flatMap(edge => [edge.source, edge.target])), edges: new Set(edges.map(edge => edge.id)) };
}

/** Absolute bounded camera offsets. Repeated visits cannot accumulate coordinates. */
export function branchCamera(point: { x: number; y: number } | undefined, width: number, height: number, reduced: boolean) {
  if (!point || reduced) return { x: 0, y: 0 };
  return { x: Math.max(-width * 0.055, Math.min(width * 0.055, (width / 2 - point.x) * 0.2)),
    y: Math.max(-height * 0.055, Math.min(height * 0.055, (height / 2 - point.y) * 0.2)) };
}
