import type { GraphPoint } from "../physics/types";
import type { UniverseDepth } from "../universe-depth";

/** Noninteractive overview; full labels/relationships remain accessible in theme views. */
export function UniverseDepthLayer({ depth, primary, activeId }: { depth: UniverseDepth; primary: Map<string, GraphPoint>; activeId: string | null }) {
  const points = new Map([...primary, ...depth.nodes.map(node => [node.id, node] as const)]);
  const related = activeId ? depth.neighborhoods.get(activeId) : undefined;
  return <g className="universe-depth-layer" data-preview={!!related} aria-hidden="true" pointerEvents="none">
    {depth.edges.map(edge => {
      const a = points.get(edge.source)!, b = points.get(edge.target)!;
      const level = Math.max(depth.nodes.find(node => node.id === edge.source)?.depth ?? 1, depth.nodes.find(node => node.id === edge.target)?.depth ?? 1);
      const secondary = primary.has(edge.source) && level === 2 && edge.relation === "includes";
      return <path key={edge.id} data-universe-edge data-edge-id={edge.id} data-source={edge.source} data-target={edge.target} data-tier={secondary ? "secondary" : "tertiary"} data-depth={level} data-related={!!related?.has(edge.source) && !!related?.has(edge.target)} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />;
    })}
    {depth.nodes.map(node => <g key={node.id} data-universe-node={node.id} data-region={node.regionId} data-base-x={node.x} data-base-y={node.y} data-depth={node.depth} data-related={!!related?.has(node.id)} transform={`translate(${node.x} ${node.y})`}>
      <g data-story-position={node.id}>
        <circle r={(node.depth ?? 2) > 2 ? 1.85 : 2.6} />
        <text y={13} textAnchor={node.x < 140 ? "start" : node.x > 900 ? "end" : "middle"}>{node.label}</text>
      </g>
    </g>)}
  </g>;
}
