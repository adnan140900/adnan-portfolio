import type { gsap } from "gsap";
import type { GraphDocument } from "../graph/types";
import { applyStoryProjection } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import { createProjectionSequence, projectionNodeEmphasis } from "./semantic-projection-model";

export function createProjectionStage(svg: SVGSVGElement, graph: GraphDocument, scenes: FilmScene[], identity: boolean) {
  const plan = createProjectionSequence(graph, scenes, identity);
  const groups = [...svg.querySelectorAll<SVGGElement>("[data-projection-node]")];
  const edges = [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]")];
  const values = new Map(plan.nodes.map(node => [node.id, { x: 0, y: 0, emphasis: projectionNodeEmphasis(node, plan.frames[0]) }]));
  const offsets = new Map(plan.nodes.map(node => [node.id, { x: 0, y: 0 }]));
  return {
    schedule(timeline: gsap.core.Timeline, scene: FilmScene, index: number) {
      const frame = plan.frames[index];
      const at = Math.max(0, index - 0.3);
      plan.nodes.forEach(node => {
        const base = plan.base.get(node.id)!, target = frame.positions.get(node.id) ?? base;
        timeline.to(values.get(node.id)!, {
          x: target.x - base.x + (identity && node.id !== frame.anchorId ? Math.sin(index + base.y) * 6 : 0),
          y: target.y - base.y,
          emphasis: projectionNodeEmphasis(node, frame), duration: index ? 0.3 : 0.1,
        }, at);
      });
      edges.forEach(edge => timeline.to(edge, { opacity: frame.edges.some(item => item.id === edge.dataset.edgeId)
        ? edge.dataset.source === frame.anchorId || edge.dataset.target === frame.anchorId ? 0.58 : 0.28 : 0, duration: index ? 0.3 : 0.1 }, at));
    },
    render() {
      groups.forEach(group => {
        const id = group.dataset.projectionNode!, value = values.get(id)!;
        const offset = offsets.get(id)!; offset.x = value.x; offset.y = value.y;
        group.setAttribute("opacity", String(value.emphasis));
        group.querySelector("[data-projection-core]")?.setAttribute("r", String(value.emphasis >= 0.99 ? 5 : value.emphasis >= 0.77 ? 3.4 : 2.4));
      });
      applyStoryProjection(svg, offsets);
    },
    reset() { applyStoryProjection(svg, new Map()); },
  };
}
