import type { gsap } from "gsap";
import type { GraphDocument } from "../graph/types";
import { applyStoryProjection } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import { stageEmphasis, stageOffset } from "./semantic-stage-model";

/** Scroll authors offsets/emphasis; the existing idle clock keeps this SAME SVG alive. */
export function createSemanticStage(svg: SVGSVGElement, graph: GraphDocument, kind: string) {
  const groups = [...svg.querySelectorAll<SVGGElement>("[data-force-node]")];
  const edges = [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]")];
  const nodes = groups.map(group => graph.nodes.find(node => node.id === group.dataset.nodeId)!);
  const values = new Map(nodes.map(node => [node.id, { x: 0, y: 0, emphasis: 1 }]));
  const lines = new Map(edges.map(edge => [edge.dataset.edgeId!, { opacity: 0.44, dash: 0 }]));
  const offsets = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));
  return {
    schedule(timeline: gsap.core.Timeline, scene: FilmScene, sceneIndex: number) {
      const plan = stageEmphasis(graph, scene, kind, nodes);
      nodes.forEach((node, index) => {
        const focused = plan.focus.has(node.id);
        timeline.to(values.get(node.id)!, { ...stageOffset(node, index, sceneIndex, kind, focused), emphasis: focused ? 1 : plan.neighbors.has(node.id) ? 0.84 : 0.62, duration: sceneIndex ? 0.6 : 0.18 }, Math.max(0, sceneIndex - 0.45));
      });
      edges.forEach(edge => timeline.to(lines.get(edge.dataset.edgeId!)!, {
        opacity: plan.limited ? 0.29 : plan.edges.has(edge.dataset.edgeId!) ? 0.73 : 0.34,
        dash: plan.conditional && plan.edges.has(edge.dataset.edgeId!) ? 1 : 0,
        duration: sceneIndex ? 0.6 : 0.18,
      }, Math.max(0, sceneIndex - 0.45)));
    },
    render() {
      groups.forEach(group => {
        const id = group.dataset.nodeId!, value = values.get(id)!;
        const point = offsets.get(id)!;
        point.x = value.x; point.y = value.y;
        group.style.setProperty("--semantic-emphasis", String(value.emphasis));
      });
      edges.forEach(edge => {
        const value = lines.get(edge.dataset.edgeId!)!;
        edge.style.setProperty("--story-edge-opacity", String(value.opacity));
        edge.style.strokeDasharray = value.dash > 0.5 ? "0.04 0.025" : "none";
      });
      applyStoryProjection(svg, offsets);
    },
    reset() {
      applyStoryProjection(svg, new Map());
      groups.forEach(group => group.style.removeProperty("--semantic-emphasis"));
      edges.forEach(edge => { edge.style.removeProperty("--story-edge-opacity"); edge.style.removeProperty("stroke-dasharray"); });
    },
  };
}
