import type { GraphDocument, GraphNode, GraphView } from "../../features/graph/types";
import { parseGraphDocument } from "../graph/parse-graph-document";
import type { PublicGraph } from "./schema";
import { publicRoutes } from "./routes";

/** Views project only outgoing approved edges. They never infer edges from prose. */
export function adaptPublicGraph(source: PublicGraph): GraphDocument {
  const nodes: GraphNode[] = source.nodes.map(node => {
    const parent = source.edges.find(edge => edge.target === node.id && (edge.relationship === "includes" || edge.relationship === "has-theme"));
    const route = node.id === source.rootId ? "/about" : publicRoutes.find(route => route.nodeId === node.id)?.path;
    return { ...node, kind: node.depth === 0 ? "person" : node.depth === 1 ? "cluster" : route ? "subject" : "concept", route, parentId: parent?.source, weight: node.importance === "primary" ? 1 : node.importance === "featured" ? 0.82 : 0.55 };
  });
  const byId = new Map(nodes.map(node => [node.id, node]));
  const edges = source.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, relation: edge.relationship }));
  const rootIds = [source.rootId, ...source.edges.filter(edge => edge.source === source.rootId).map(edge => edge.target)];
  const view = (id: string, rootNodeId: string, nodeIds: string[], level: GraphView["level"], parentNodeId?: string): GraphView => ({
    id, rootNodeId, nodeIds, level, parentNodeId, label: byId.get(rootNodeId)!.label,
    edgeIds: edges.filter(edge => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)).map(edge => edge.id),
  });
  const views: GraphView[] = [view("portfolio-universe", source.rootId, rootIds, "universe")];
  for (const node of nodes.filter(node => node.kind === "cluster" || node.kind === "subject")) {
    const members = new Set([node.id]);
    const queue = [node.id];
    while (queue.length) {
      const current = queue.shift()!;
      for (const edge of edges.filter(edge => edge.source === current)) {
        if (!members.has(edge.target) && (byId.get(edge.target)?.depth ?? 0) > 1) { members.add(edge.target); queue.push(edge.target); }
      }
    }
    views.push(view(`world-${node.id}`, node.id, [...members], node.kind === "cluster" ? "cluster" : "subject", node.parentId));
  }
  return parseGraphDocument({ schemaVersion: source.schemaVersion, source: "sanitized-public-export", exportedAt: null, entryViewId: "portfolio-universe", nodes, edges, views });
}
