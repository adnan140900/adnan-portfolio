"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GraphDocument } from "../graph/types";
import { useSemanticIdle } from "../motion/use-semantic-idle";
import { useExperienceProfile } from "../experience/experience-profile-provider";
import { publishGraphGeometry } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import { createProjectionSequence, projectionLabelLines, projectionNodeEmphasis } from "./semantic-projection-model";
import { getGraphViewport, projectGraphPoints } from "../graph/physics/graph-projection";

/** One persistent semantic SVG and idle clock at every viewport. */
export function SemanticProjection({ graph, scenes, identity = false }: {
  graph: GraphDocument; scenes: FilmScene[]; identity?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null);
  const profile = useExperienceProfile();
  const plan = useMemo(() => createProjectionSequence(graph, scenes, identity), [graph, scenes, identity]);
  const base = useMemo(() => projectGraphPoints(plan.base, profile.viewport), [plan.base, profile.viewport]);
  const viewport = getGraphViewport(profile.viewport);
  useEffect(() => { if (svg.current) publishGraphGeometry(svg.current, base); }, [base]);
  useSemanticIdle(root, svg, plan.nodes, plan.frames[0]?.anchorId, profile);
  const frame = plan.frames[0];
  return <div ref={root} className="semantic-projection projection-persistent" data-projection-identity={identity}>
    <svg ref={svg} viewBox={`0 0 ${viewport.width} ${viewport.height}`} aria-hidden="true" focusable="false" data-semantic-projection data-semantic-mobile={profile.viewport === "compact"}>
      {plan.edges.map(edge => {
        const a = base.get(edge.source)!, b = base.get(edge.target)!;
        const active = frame.edges.some(item => item.id === edge.id);
        return <path key={edge.id} data-force-edge data-edge-id={edge.id} data-source={edge.source} data-target={edge.target}
          d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" stroke="currentColor" strokeWidth="0.8"
          opacity={active ? edge.source === frame.anchorId || edge.target === frame.anchorId ? 0.58 : 0.28 : 0} />;
      })}
      {plan.nodes.map(node => {
        const p = base.get(node.id)!;
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
