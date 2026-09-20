interface Relationship { id: string; source: string; target: string }

/** Presentation schedule: a branch cannot leave a star before it has formed.
 * Cross-links settle after the discovery tree, without changing edge direction. */
export function scheduleBranchGrowth(root: string, plan: ReturnType<typeof createBranchGrowthPlan>, edges: Relationship[], timing: { branch: number; star: number; stagger: number }) {
  const ready = new Map([[root, 0.34]]);
  let next = 0.34;
  const scheduled: { edgeId: string; nodeId: string | null; reverse: boolean; at: number }[] = [];
  for (const branch of plan.branches.filter(item => item.nodeId !== null)) {
    const edge = edges.find(item => item.id === branch.edgeId)!;
    const parent = branch.reverse ? edge.target : edge.source;
    const at = Math.max(next, ready.get(parent) ?? next);
    scheduled.push({ ...branch, at });
    ready.set(branch.nodeId!, at + timing.branch + timing.star);
    next = at + timing.stagger;
  }
  next = Math.max(next, ...ready.values());
  for (const branch of plan.branches.filter(item => item.nodeId === null)) {
    scheduled.push({ ...branch, at: next });
    next += timing.stagger * 0.5;
  }
  return scheduled;
}

/** Breadth-first reveal over real relationships, including reversed and cyclic edges. */
export function createBranchGrowthPlan(root: string, nodeIds: string[], edges: Relationship[]) {
  const reached = new Set([root]);
  const pending = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target));
  const branches: { edgeId: string; nodeId: string | null; reverse: boolean; depth: number }[] = [];
  let depth = 0;
  while (pending.length) {
    const available = pending.filter(e => reached.has(e.source) || reached.has(e.target));
    if (!available.length) break;
    for (const edge of available) {
      const reverse = !reached.has(edge.source);
      const next = reverse ? edge.source : edge.target;
      branches.push({ edgeId: edge.id, nodeId: reached.has(next) ? null : next, reverse, depth });
      reached.add(next);
      pending.splice(pending.indexOf(edge), 1);
    }
    depth++;
  }
  return { branches, unconnectedNodeIds: nodeIds.filter(id => !reached.has(id)) };
}
