import type { GraphDocument, GraphView } from "../graph/types";
import type { StoryMoment } from "./story-scenes";

export function getStoryNodePresentation(moment: StoryMoment, id: string, index: number) {
  const active = moment.nodeId === id;
  const supporting = moment.supportingNodeIds?.includes(id) ?? false;
  return { opacity: active ? 1 : supporting ? 0.8 : index || moment.id ? 0.3 : 1, scale: active ? 1.1 : supporting ? 1.025 : index || moment.id ? 0.92 : 1, label: active || supporting ? 1 : 0 };
}

export function getStoryEdgeState(moment: StoryMoment, id: string) {
  if (moment.weakenedEdgeIds?.includes(id)) return { kind: "weakened", opacity: 0.09 } as const;
  if (moment.highlightedEdgeIds?.includes(id)) return { kind: "prominent", opacity: 0.34 } as const;
  return { kind: "quiet", opacity: 0.13 } as const;
}

/** Scene content fails at the same public boundary as graph/view references. */
export function validateStoryMoments(graph: GraphDocument, view: GraphView, moments: StoryMoment[]) {
  if (!moments.length) throw new Error("A story requires at least one scene.");
  for (const moment of moments) {
    const nodeIds = [moment.nodeId, ...(moment.supportingNodeIds ?? []), ...Object.keys(moment.nodeOffsets ?? {})];
    const edgeIds = [...(moment.highlightedEdgeIds ?? []), ...(moment.weakenedEdgeIds ?? [])];
    if (nodeIds.some(id => !view.nodeIds.includes(id)) || edgeIds.some(id => !view.edgeIds.includes(id))) throw new Error("Story scene references content outside its graph view.");
    if (Object.values(moment.nodeOffsets ?? {}).some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y) || Math.abs(point.x) > 100 || Math.abs(point.y) > 100)) throw new Error("Story offset exceeds its bounded visual range.");
    if (moment.camera && (!Number.isFinite(moment.camera.x) || !Number.isFinite(moment.camera.y) || !Number.isFinite(moment.camera.scale) || Math.abs(moment.camera.x) > 160 || Math.abs(moment.camera.y) > 100 || moment.camera.scale < 0.9 || moment.camera.scale > 1.1)) throw new Error("Story camera exceeds its bounded visual range.");
  }
  // Check view endpoints too: a visual projection must not imply missing nodes.
  for (const edge of graph.edges.filter(edge => view.edgeIds.includes(edge.id))) {
    if (!view.nodeIds.includes(edge.source) || !view.nodeIds.includes(edge.target)) throw new Error("Story relationship leaves its graph view.");
  }
}
