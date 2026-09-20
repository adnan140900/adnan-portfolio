import type { ForceGraphLink, ForceGraphNode } from "./types";
import { publishGraphGeometry } from "./story-projection";

export interface SvgGraphAdapter {
  render(nodes: ForceGraphNode[], links: ForceGraphLink[]): void;
}

/** D3 owns base transforms; the shared projection combines offsets for edges. */
export function createSvgGraphAdapter(svg: SVGSVGElement): SvgGraphAdapter {
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
        element.setAttribute("transform", `translate(${node.x} ${node.y})`);
      }
      publishGraphGeometry(svg, new Map(nodes.map(node => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }])));
    },
  };
}
