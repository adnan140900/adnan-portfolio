import type { GraphDocument, GraphNode } from "../graph/types";
import type { FilmScene } from "./film-model";

// Presentation-only associations explicitly requested in Phase 9Y. They do NOT
// alter exported section mappings, claims, categories, edges or route ownership.
const floodEmphasis: Record<string, string[]> = {
  Question: ["research-flood-accessibility", "concept-road-disruption-restoration", "concept-critical-health-service-access"],
  Motivation: ["concept-critical-health-service-access", "concept-road-disruption-restoration"],
  Method: ["method-geospatial-analysis", "method-road-networks"],
  "Data and assumptions": ["method-flood-exposure"],
  "Exploratory work": ["research-flood-accessibility", "method-geospatial-analysis"],
  Limitations: ["method-flood-exposure", "method-validation-uncertainty"],
  Validation: ["method-validation-uncertainty"],
  Uncertainty: ["method-validation-uncertainty", "method-flood-exposure"],
};

export function stageEmphasis(graph: GraphDocument, scene: FilmScene, kind: string, nodes: GraphNode[]) {
  // Exact approved labels may identify a visible topic for presentation. This
  // leaves the source item's topicId intact (no inferred section mapping).
  const titleNode = nodes.find(node => node.label === scene.title);
  const requested = kind === "flood" ? floodEmphasis[scene.title] ?? [scene.topicId] : [titleNode?.id ?? scene.topicId];
  const ids = new Set(nodes.map(node => node.id));
  const focus = new Set(requested.filter(id => ids.has(id)));
  const incident = graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target) && (focus.has(edge.source) || focus.has(edge.target)));
  const neighbors = new Set(incident.flatMap(edge => [edge.source, edge.target]));
  return { focus, neighbors, edges: new Set(incident.map(edge => edge.id)), conditional: kind === "flood" && ["Data and assumptions", "Limitations", "Uncertainty"].includes(scene.title), limited: kind === "flood" && scene.title === "Limitations" };
}

/** Composition displacement in graph units; the base remains D3-owned. */
export function stageOffset(node: GraphNode, index: number, sceneIndex: number, kind: string, focused: boolean) {
  const phase = sceneIndex * 0.83;
  const sign = index % 2 ? 1 : -1;
  if (kind === "leadership") return { x: Math.sin(phase) * (focused ? 12 : 24), y: Math.cos(phase) * sign * 12 };
  if (kind === "projects") return { x: Math.sin(phase) * sign * (focused ? 22 : 65), y: Math.cos(phase) * (index % 3 - 1) * 26 };
  if (kind === "ai") return { x: Math.sin(phase + index) * 55, y: Math.cos(phase * 0.8 + index) * 35 };
  if (kind === "learning") return { x: Math.sin(phase + index * 0.7) * 52, y: Math.cos(phase + index * 0.7) * 35 };
  if (kind === "flood") {
    const method = node.category === "engineering";
    const expansion = sceneIndex === 7 ? 1 : sceneIndex === 5 ? -0.35 : 0.55;
    return { x: (method ? -1 : 1) * (focused ? 12 : 45) * expansion + Math.sin(phase) * 20, y: sign * (focused ? 12 : 35) * expansion };
  }
  return { x: Math.sin(phase) * sign * 45, y: Math.cos(phase) * (index % 3 - 1) * 25 };
}
