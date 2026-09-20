"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GraphDocument } from "../graph/types";
import { useSemanticIdle } from "../motion/use-semantic-idle";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { publishGraphGeometry } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import { createProjectionSequence, projectionLabelLines, projectionNodeEmphasis } from "./semantic-projection-model";

/** One persistent desktop SVG/idle clock. Normal-flow copies are static. */
export function SemanticProjection({ graph, scenes, identity = false, mobile = false }: {
  graph: GraphDocument; scenes: FilmScene[]; identity?: boolean; mobile?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();
  const plan = useMemo(() => createProjectionSequence(graph, scenes, identity), [graph, scenes, identity]);
  useEffect(() => { if (svg.current) publishGraphGeometry(svg.current, plan.base); }, [plan]);
  useSemanticIdle(root, svg, plan.nodes, plan.frames[0]?.anchorId, mobile ? true : reduced);
  const frame = plan.frames[0];
  return <div ref={root} className={`semantic-projection${mobile ? " projection-mobile" : " projection-desktop"}`} data-projection-identity={identity}>
    <svg ref={svg} viewBox="0 0 1040 620" aria-hidden="true" focusable="false" data-semantic-projection>
      {plan.edges.map(edge => {
        const a = plan.base.get(edge.source)!, b = plan.base.get(edge.target)!;
        const active = frame.edges.some(item => item.id === edge.id);
        return <path key={edge.id} data-force-edge data-edge-id={edge.id} data-source={edge.source} data-target={edge.target}
          d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" stroke="currentColor" strokeWidth="0.8"
          opacity={active ? edge.source === frame.anchorId || edge.target === frame.anchorId ? 0.58 : 0.28 : 0} />;
      })}
      {plan.nodes.map(node => {
        const p = plan.base.get(node.id)!;
        const emphasis = projectionNodeEmphasis(node, frame);
        return <g key={node.id} transform={`translate(${p.x} ${p.y})`} data-projection-node={node.id} opacity={emphasis}>
          <g data-story-position={node.id}>
            <circle data-projection-core r={emphasis === 1 ? 5 : emphasis === 0.78 ? 3.4 : 2.4} fill="currentColor" />
            <text textAnchor="middle" y="25" className="projection-label">{projectionLabelLines(node.label).map((line, index) => <tspan key={index} x="0" dy={index ? "1.3em" : "0"}>{line}</tspan>)}</text>
          </g>
        </g>;
      })}
    </svg>
  </div>;
}
