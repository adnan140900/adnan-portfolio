import type { gsap } from "gsap";
import type { GraphDocument } from "../graph/types";
import { applyStoryProjection } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import { createProjectionSequence, projectionNodeEmphasis } from "./semantic-projection-model";
import type { ExperienceViewport } from "../experience/experience-profile";
import { projectGraphPoint, projectGraphPoints } from "../graph/physics/graph-projection";

export function createProjectionStage(svg: SVGSVGElement, graph: GraphDocument, scenes: FilmScene[], identity: boolean, viewport: ExperienceViewport) {
  const plan = createProjectionSequence(graph, scenes, identity);
  const basePoints = projectGraphPoints(plan.base, viewport);
  const groups = [...svg.querySelectorAll<SVGGElement>("[data-projection-node]")];
  const edges = [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]")];
  const values = new Map(plan.nodes.map(node => [node.id, { x: 0, y: 0, emphasis: projectionNodeEmphasis(node, plan.frames[0]) }]));
  const offsets = new Map(plan.nodes.map(node => [node.id, { x: 0, y: 0 }]));
  return {
    schedule(timeline: gsap.core.Timeline, scene: FilmScene, index: number) {
      const frame = plan.frames[index];
      const at = Math.max(0, index - 0.3);
      plan.nodes.forEach(node => {
        const canonicalBase = plan.base.get(node.id)!;
        const base = basePoints.get(node.id)!;
        const target = projectGraphPoint(frame.positions.get(node.id) ?? canonicalBase, viewport);
        timeline.to(values.get(node.id)!, {
          x: target.x - base.x + (identity && node.id !== frame.anchorId ? Math.sin(index + base.y) * (viewport === "compact" ? 3.5 : 6) : 0),
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
        group.dataset.projectionActive = String(value.emphasis >= 0.99);
        group.dataset.projectionNeighbor = String(value.emphasis >= 0.77 && value.emphasis < 0.99);
        group.setAttribute("opacity", String(value.emphasis));
        group.querySelector("[data-projection-core]")?.setAttribute("r", String(value.emphasis >= 0.99 ? 5 : value.emphasis >= 0.77 ? 3.4 : 2.4));
      });
      applyStoryProjection(svg, offsets);
    },
    reset() { applyStoryProjection(svg, new Map()); groups.forEach(group => { delete group.dataset.projectionActive; delete group.dataset.projectionNeighbor; }); },
  };
}
