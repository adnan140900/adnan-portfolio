import type { GraphDocument, GraphNode } from "../graph/types";
import type { FilmScene } from "./film-model";

/** Presentation selection, never topology: every step follows a real public edge.
 * Undirected traversal supplies context; rendered relationships retain direction. */
export function semanticProjection(graph: GraphDocument, topicId: string, identity = false) {
  const root = identity ? graph.nodes.find(node => node.kind === "person") : graph.nodes.find(node => node.id === topicId);
  if (!root) throw new Error(`Missing public projection anchor: ${topicId}`);
  const categories = new Set(root.category ? [root.category] : []);
  if (root.id === "method-geospatial-analysis") categories.add("learning");
  const distances = new Map([[root.id, 0]]);
  const queue = [root.id];
  const limit = identity ? 7 : 8;
  for (let cursor = 0; cursor < queue.length && queue.length < limit; cursor++) {
    const id = queue[cursor], distance = distances.get(id)!;
    for (const edge of graph.edges) {
      if (identity && (edge.source !== root.id || edge.relation !== "has-theme")) continue;
      if (!identity && root.id === "research-flood-accessibility" && edge.source !== id) continue;
      const next = edge.source === id ? edge.target : edge.target === id ? edge.source : undefined;
      const node = graph.nodes.find(node => node.id === next);
      if (!node || distances.has(node.id) || node.kind === "person") continue;
      const flood = root.id === "research-flood-accessibility";
      if (!identity && !flood && !categories.has(node.category ?? "")) continue;
      if (queue.length >= limit) break;
      distances.set(node.id, distance + 1); queue.push(node.id);
    }
  }
  const nodes = queue.map(id => graph.nodes.find(node => node.id === id)!);
  const edges = graph.edges.filter(edge => distances.has(edge.source) && distances.has(edge.target));
  const positions = new Map(nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index - 1) * 2 * Math.PI / Math.max(1, nodes.length - 1);
    return [node.id, index === 0 ? { x: 520, y: 290 } : {
      x: Number((520 + Math.cos(angle) * 330).toFixed(4)),
      y: Number((290 + Math.sin(angle) * 205).toFixed(4)),
    }];
  }));
  return { anchorId: root.id, nodes, edges, distances, positions };
}

export function createProjectionSequence(graph: GraphDocument, scenes: FilmScene[], identity = false) {
  const frames = scenes.map(scene => semanticProjection(graph, scene.topicId, identity));
  const nodes = [...new Map(frames.flatMap(frame => frame.nodes).map(node => [node.id, node])).values()];
  const edges = [...new Map(frames.flatMap(frame => frame.edges).map(edge => [edge.id, edge])).values()];
  const base = new Map(nodes.map(node => [node.id, frames.find(frame => frame.positions.has(node.id))!.positions.get(node.id)!]));
  return { frames, nodes, edges, base };
}

export function projectionNodeEmphasis(node: GraphNode, frame: ReturnType<typeof semanticProjection>) {
  const distance = frame.distances.get(node.id);
  return distance === undefined ? 0 : distance === 0 ? 1 : distance === 1 ? 0.78 : 0.54;
}

export function projectionLabelLines(label: string) {
  const lines: string[] = [];
  for (const word of label.split(" ")) {
    if (!lines.length || `${lines.at(-1)} ${word}`.length > 23) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
}
