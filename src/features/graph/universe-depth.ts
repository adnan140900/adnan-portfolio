import type { GraphDocument } from "./types";
import type { GraphPoint } from "./physics/types";
import { GRAPH_CENTER } from "./physics/graph-geometry";

/** Outgoing approved relationships, excluding other primary themes. */
export function semanticNeighborhood(graph: GraphDocument, id: string) {
  const ids = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of graph.edges.filter(edge => edge.source === current)) {
      if (!ids.has(edge.target) && (graph.nodes.find(node => node.id === edge.target)?.depth ?? 0) > 1) {
        ids.add(edge.target); queue.push(edge.target);
      }
    }
  }
  return ids;
}

/** Visual projection only: navigation views and public topology remain unchanged. */
export function createUniverseDepth(graph: GraphDocument, primary: Map<string, GraphPoint>) {
  const themes = graph.nodes.filter(node => node.depth === 1 && primary.has(node.id));
  const neighborhoods = new Map(themes.map(theme => [theme.id, semanticNeighborhood(graph, theme.id)]));
  const placed: (GraphPoint & { width: number })[] = [];
  const nodes = graph.nodes.filter(node => (node.depth ?? 0) > 1).sort((a, b) => (a.depth ?? 0) - (b.depth ?? 0) || a.id.localeCompare(b.id)).map(node => {
    const owners = themes.filter(theme => neighborhoods.get(theme.id)!.has(node.id));
    const owner = owners.find(theme => theme.category === node.category) ?? owners[0];
    if (!owner) throw new Error(`Public node has no reachable theme: ${node.id}`);
    const anchor = primary.get(owner.id)!;
    const angle = Math.atan2((anchor.y - GRAPH_CENTER.y) / 155, (anchor.x - GRAPH_CENTER.x) / 270);
    const region = { x: GRAPH_CENTER.x + Math.cos(angle) * 392, y: GRAPH_CENTER.y + Math.sin(angle) * 218 };
    const width = Math.min(190, node.label.length * 4.2);
    const candidates = Array.from({ length: 63 }, (_, i) => ({ x: Math.max(105, Math.min(935, region.x + (i % 7 - 3) * 38)), y: Math.max(38, Math.min(542, region.y + (Math.floor(i / 7) - 4) * 30)) }));
    const score = (point: GraphPoint) => {
      const clearance = Math.min(...[...primary.values()].map(p => Math.hypot((point.x - p.x) / 115, (point.y - p.y - 10) / 54)), ...placed.map(p => Math.hypot((point.x - p.x) / ((p.width + width) / 2 + 12), (point.y - p.y) / 31)));
      return Math.min(clearance, 1.7) - Math.hypot((point.x - region.x) / 240, (point.y - region.y) / 155) * 0.48;
    };
    const point = candidates.reduce((best, candidate) => score(candidate) > score(best) ? candidate : best);
    const position = { x: Number(point.x.toFixed(4)), y: Number(point.y.toFixed(4)) };
    placed.push({ ...position, width });
    return { ...node, ...position, regionId: owner.id };
  });
  const ids = new Set(nodes.map(node => node.id));
  const visible = new Set([...primary.keys(), ...ids]);
  const edges = graph.edges.filter(edge => visible.has(edge.source) && visible.has(edge.target) && (ids.has(edge.source) || ids.has(edge.target)));
  return { nodes, edges, neighborhoods };
}

export type UniverseDepth = ReturnType<typeof createUniverseDepth>;
