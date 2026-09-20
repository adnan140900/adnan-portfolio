import type { GraphDocument, GraphView } from "../../features/graph/types";
import type { StoryMoment } from "../../features/motion/story-scenes";
import { validateStoryMoments } from "../../features/motion/story-model";
import type { PublicItem } from "./schema";

/** Choreography is presentation only. Unmapped sections retain their item's anchor. */
export function createPublicStory(items: PublicItem[], graph: GraphDocument, view: GraphView): StoryMoment[] {
  const moments = items.flatMap(item => item.sections.map(section => ({
    id: section.id, nodeId: section.graphNodeId ?? item.graphNodeId,
    title: section.heading, copy: section.body.join("\n\n"), displayStatus: section.displayStatus,
  }))).map((moment, index): StoryMoment => {
    const relationships = graph.edges.filter(edge => view.edgeIds.includes(edge.id) && edge.source === moment.nodeId);
    return {
      ...moment,
      supportingNodeIds: relationships.map(edge => edge.target),
      highlightedEdgeIds: relationships.map(edge => edge.id),
      camera: { x: index % 2 ? -75 : 75, y: -Math.min(index * 4, 28), scale: 1.01 },
      placement: index % 2 ? "right" : "left",
    };
  });
  validateStoryMoments(graph, view, moments);
  return moments;
}
