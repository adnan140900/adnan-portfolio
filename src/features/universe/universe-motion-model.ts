import type { GraphNode } from "../graph/types";
import type { ExperienceViewport } from "../experience/experience-profile";
import type { GraphPoint } from "../graph/physics/types";

export const genesisDuration = 5.2;
export type UniverseEdgeTier = "primary" | "secondary" | "tertiary" | "bridge";
export const clampProgress = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function phase(value: number, start: number, end: number) {
  const p = clampProgress((value - start) / (end - start));
  return p * p * (3 - 2 * p);
}
function seed(id: string, salt: string) {
  let hash = 2166136261;
  for (const character of `${id}:${salt}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) / 4294967295;
}

/** ID-derived field vectors, never mutations of authoritative graph coordinates. */
export function scatterParameters(node: Pick<GraphNode, "id" | "depth">, viewport: ExperienceViewport) {
  const angle = seed(node.id, "direction") * Math.PI * 2;
  const near = seed(node.id, "depth");
  const reach = (viewport === "compact" ? 175 : 310) + seed(node.id, "reach") * (viewport === "compact" ? 220 : 330);
  return {
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach * (viewport === "compact" ? 1.25 : 0.64),
    tangent: (seed(node.id, "tangent") - 0.5) * 145,
    scale: (node.depth ?? 0) <= 1 ? 0.3 + near * 0.36 : 0.58 + near * 0.5,
    opacity: 0.46 + near * 0.4,
  };
}

export function universeNodeFrame(node: Pick<GraphNode, "id" | "depth">, viewport: ExperienceViewport, progress: number, origin?: GraphPoint) {
  const p = clampProgress(progress);
  const scatter = phase(p, 0.42, 1);
  const vector = scatterParameters(node, viewport);
  // Keep trajectories within the centered presentation field.
  if (origin) {
    const width = viewport === "compact" ? 620 : 1040, height = viewport === "compact" ? 980 : 580;
    const margin = 24 + seed(node.id, "boundary") * 48;
    vector.x = Math.max(margin, Math.min(width - margin, origin.x + vector.x)) - origin.x;
    vector.y = Math.max(margin, Math.min(height - margin, origin.y + vector.y)) - origin.y;
  }
  const bend = Math.sin(scatter * Math.PI) * vector.tangent;
  const depth = node.depth ?? 0;
  return {
    x: vector.x * scatter + bend || 0,
    y: vector.y * scatter - bend * 0.45 || 0,
    scale: 1 + (vector.scale - 1) * phase(scatter, 0.35, 1),
    opacity: 1 + (vector.opacity - 1) * phase(scatter, 0.55, 1),
    label: 1 - phase(p, depth > 2 ? 0.30 : depth > 1 ? 0.33 : 0.36, depth > 2 ? 0.38 : depth > 1 ? 0.41 : 0.48),
    idleWeight: 1 - scatter,
  };
}

export function universeEdgeProgress(tier: UniverseEdgeTier, progress: number, order = 0) {
  const interval = tier === "primary" ? [0.20, 0.34] : tier === "secondary" ? [0.13, 0.25] : tier === "tertiary" ? [0.065, 0.17] : [0.015, 0.10];
  const stagger = Math.max(0, Math.min(1, order)) * Math.min(0.025, interval[0] * 0.75);
  // In reverse: root, main branches, deep branches, then bridges.
  interval[0] -= stagger; interval[1] -= stagger;
  return 1 - phase(progress, interval[0], interval[1]);
}

export function genesisNodeFrame(node: Pick<GraphNode, "id" | "depth">, viewport: ExperienceViewport, seconds: number, origin?: GraphPoint) {
  const delay = seed(node.id, "arrival") * 0.18;
  const assembly = phase(seconds, delay, 1.85 + delay);
  // Reuse the exact field endpoint. Every point is settled before the first edge.
  const dispersed = universeNodeFrame(node, viewport, 1, origin);
  return {
    x: dispersed.x * (1 - assembly) || 0, y: dispersed.y * (1 - assembly) || 0,
    scale: dispersed.scale + (1 - dispersed.scale) * assembly,
    opacity: dispersed.opacity + (1 - dispersed.opacity) * assembly,
    label: phase(seconds, 1.2 + delay, 2.05 + delay), idleWeight: 0,
  };
}

export function genesisEdgeProgress(index: number, count: number, seconds: number, tier?: UniverseEdgeTier) {
  const stages = { primary: [2.35, 0.48], secondary: [3, 0.5], tertiary: [3.7, 0.48], bridge: [4.35, 0.5] };
  const [begin, spread] = tier ? stages[tier] : [2.35, 2.5];
  const start = begin + index / Math.max(1, count - 1) * spread;
  return phase(seconds, start, start + 0.35);
}
