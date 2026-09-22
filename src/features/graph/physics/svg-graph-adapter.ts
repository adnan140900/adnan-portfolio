import type { ForceGraphLink, ForceGraphNode, GraphPoint } from "./types";
import { publishGraphGeometry } from "./story-projection";

export interface SvgGraphAdapter {
  render(nodes: ForceGraphNode[], links: ForceGraphLink[]): void;
}

/** D3 owns base transforms; the shared projection combines offsets for edges. */
export function createSvgGraphAdapter(svg: SVGSVGElement, project: (point: GraphPoint) => GraphPoint = point => point): SvgGraphAdapter {
  const nodeElements = new Map(
    Array.from(svg.querySelectorAll<SVGGElement>("[data-force-node]")).map(element => [
      element.dataset.nodeId ?? "", element,
    ]),
  );
  return {
    render(nodes) {
      for (const node of nodes) {
        const element = nodeElements.get(node.id);
        if (!element || node.x === undefined || node.y === undefined) continue;
        const point = project({ x: node.x, y: node.y });
        element.setAttribute("transform", `translate(${point.x} ${point.y})`);
      }
      publishGraphGeometry(svg, new Map(nodes.map(node => [node.id, project({ x: node.x ?? 0, y: node.y ?? 0 })])));
    },
  };
}
