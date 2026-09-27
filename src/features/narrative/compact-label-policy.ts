import type { GraphNodeKind } from "../graph/types";

export type CompactLabelRole = "active" | "parent" | "root" | "neighbor" | "primary" | "supporting" | "context";

export interface LabelBounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface CompactLabelCandidate {
  bounds: LabelBounds;
  depth: number;
  id: string;
  importance?: "primary" | "featured" | "supporting";
  kind: GraphNodeKind;
  role: CompactLabelRole;
}

const rolePriority: Record<CompactLabelRole, number> = {
  active: 700,
  parent: 600,
  root: 560,
  neighbor: 460,
  primary: 340,
  supporting: 220,
  context: 100,
};

export function compactLabelPriority(candidate: CompactLabelCandidate) {
  const importance = candidate.importance === "primary" ? 24 : candidate.importance === "featured" ? 12 : 0;
  const kind = candidate.kind === "person" ? 18 : candidate.kind === "cluster" ? 12 : 0;
  return rolePriority[candidate.role] + importance + kind - candidate.depth;
}

function overlaps(a: LabelBounds, b: LabelBounds, gap: number) {
  return a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
}

/**
 * A stable presentation filter. It never changes nodes, edges, coordinates or
 * accessible names; it selects only the compact labels that can coexist.
 */
export function resolveCompactLabels(candidates: CompactLabelCandidate[], maximum = 4, collisionGap = 5, safeBounds?: LabelBounds) {
  const ordered = [...candidates].sort((a, b) => compactLabelPriority(b) - compactLabelPriority(a) || a.id.localeCompare(b.id));
  const accepted: CompactLabelCandidate[] = [];
  for (const candidate of ordered) {
    if (candidate.role === "supporting" || candidate.role === "context") continue;
    if (candidate.role !== "active" && safeBounds && (candidate.bounds.left < safeBounds.left || candidate.bounds.right > safeBounds.right
      || candidate.bounds.top < safeBounds.top || candidate.bounds.bottom > safeBounds.bottom)) continue;
    if (accepted.length >= maximum && candidate.role !== "active") continue;
    if (candidate.role !== "active" && accepted.some(label => overlaps(candidate.bounds, label.bounds, collisionGap))) continue;
    accepted.push(candidate);
  }
  return new Set(accepted.map(candidate => candidate.id));
}
