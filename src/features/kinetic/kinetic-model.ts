import type { GraphDocument } from "../graph/types";
import { publicRoutes } from "../../lib/public-content/routes";

/** Timing is reproducible; punctuation consumes more of the same duration budget. */
export function createRevealSchedule(text: string, mode: "character" | "word" = "character", duration = 2.25) {
  const tokens = mode === "word" ? text.match(/\S+\s*|\s+/g) ?? [] : Array.from(text);
  const weights = tokens.map((token, i) => /[.!?]\s*$/.test(token) ? 5 : /[,;:]\s*$/.test(token) ? 3 : 0.8 + (i * 17 % 9) / 10);
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  let elapsed = 0;
  return tokens.map((token, i) => {
    const at = elapsed / total * duration;
    elapsed += weights[i];
    return { token, at, until: elapsed / total * duration };
  });
}

export function worldPersonality(path: string) {
  if (path.startsWith("/research")) return { name: "structural", lifetime: 22, drift: 16 };
  if (path.startsWith("/projects")) return { name: "branching", lifetime: 20, drift: 26 };
  if (path === "/ai") return { name: "distributed", lifetime: 18, drift: 30 };
  if (path === "/learning") return { name: "evolving", lifetime: 16, drift: 24 };
  if (path === "/leadership") return { name: "conversational", lifetime: 30, drift: 12 };
  if (path === "/about") return { name: "quiet", lifetime: 36, drift: 10 };
  return { name: "universe", lifetime: 24, drift: 20 };
}

/** Adapter input only. No raw bundle, prose mining, inferred edges or metadata. */
export function createKnowledgeVocabulary(graph: GraphDocument, path: string) {
  const route = publicRoutes.find(item => item.path === path);
  const view = graph.views.find(item => item.id === route?.viewId);
  const ids = new Set(path === "/" ? graph.nodes.map(node => node.id) : path === "/about"
    ? graph.nodes.filter(node => node.kind === "cluster").map(node => node.id) : view?.nodeIds ?? []);
  if (path === "/research") {
    // Explicit public cluster identity, not text-to-topology inference.
    const engineering = graph.views.find(item => item.rootNodeId === "topic-engineering");
    engineering?.nodeIds.forEach(id => ids.add(id));
  }
  const nodes = graph.nodes.filter(node => ids.has(node.id));
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const relations = graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)).map(edge => ({
    text: `${byId.get(edge.source)!.label} → ${edge.relation} → ${byId.get(edge.target)!.label}`,
    edgeId: edge.id,
    source: byId.get(edge.source)!.label,
    relation: edge.relation,
    target: byId.get(edge.target)!.label,
  }));
  return { labels: nodes.map(node => node.label), relations };
}

export function publicPreview(graph: GraphDocument, id: string) {
  const seen = new Set([id]);
  const queue = [id];
  const labels: string[] = [];
  // A bounded outgoing walk includes real descendants when a cluster has one child.
  while (queue.length && labels.length < 3) {
    const source = queue.shift();
    for (const edge of graph.edges.filter(edge => edge.source === source)) {
      const node = graph.nodes.find(node => node.id === edge.target);
      if (!node || seen.has(node.id)) continue;
      seen.add(node.id); queue.push(node.id); labels.push(node.label);
      if (labels.length === 3) break;
    }
  }
  return labels;
}

/** Editorial index only. These are abstract drawing states, never graph mappings. */
export const floodMetaphors = ["question", "motivation", "method", "assumptions", "exploration", "limitations", "validation", "uncertainty"] as const;
