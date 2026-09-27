import type { GraphPoint } from "./types";
import { createConstellationPath } from "./graph-geometry";

interface ProjectionState {
  background: Map<string, GraphPoint>;
  base: Map<string, GraphPoint>;
  offsets: Map<string, GraphPoint>;
  idle: Map<string, GraphPoint>;
  universe: Map<string, GraphPoint>;
  idleWeight: number;
  positions: Map<string, SVGGElement>;
  edges: SVGPathElement[];
  listeners?: Set<() => void>;
}
const projections = new WeakMap<SVGSVGElement, ProjectionState>();

function backgroundGeometry(svg: SVGSVGElement) {
  return new Map(Array.from(svg.querySelectorAll<SVGGElement>("[data-universe-node]")).map(element => [element.dataset.universeNode ?? "", { x: Number(element.dataset.baseX), y: Number(element.dataset.baseY) }]));
}

function getProjection(svg: SVGSVGElement) {
  let state = projections.get(svg);
  if (!state) {
    const background = backgroundGeometry(svg);
    state = { background, base: new Map(background), offsets: new Map(), idle: new Map(), universe: new Map(), idleWeight: 1, positions: new Map(Array.from(svg.querySelectorAll<SVGGElement>("[data-story-position]")).map(element => [element.dataset.storyPosition ?? "", element])), edges: [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]"), ...svg.querySelectorAll<SVGPathElement>("[data-universe-edge]")] };
    projections.set(svg, state);
  }
  return state;
}

export function projectStoryPoint(base: GraphPoint, offset?: GraphPoint): GraphPoint {
  return { x: base.x + (offset?.x ?? 0), y: base.y + (offset?.y ?? 0) };
}

function renderEdges(state: ProjectionState) {
  for (const edge of state.edges) {
    const sourceId = edge.dataset.source ?? "";
    const targetId = edge.dataset.target ?? "";
    const source = state.base.get(sourceId);
    const target = state.base.get(targetId);
    if (!source || !target) continue;
    edge.setAttribute("d", createConstellationPath(projectStoryPoint(source, visualOffset(state, sourceId)), projectStoryPoint(target, visualOffset(state, targetId)), edge.dataset.edgeId ?? ""));
  }
}

/** D3 publishes base geometry; no layout reads and no scene mutation of physics. */
export function publishGraphGeometry(svg: SVGSVGElement, base: Map<string, GraphPoint>) {
  const state = getProjection(svg);
  // React may have resolved compact geometry since the initial SSR projection.
  // Refresh authored endpoints at the physics handoff, never on scroll frames.
  state.background = backgroundGeometry(svg);
  state.base = new Map([...state.background, ...base]);
  renderEdges(state);
  state.listeners?.forEach(listener => listener());
}

/** Presentation subscribers share the existing geometry/idle clock, never a new loop. */
export function observeStoryProjection(svg: SVGSVGElement, listener: () => void) {
  const state = getProjection(svg);
  (state.listeners ??= new Set()).add(listener);
  return () => { state.listeners?.delete(listener); };
}

export function getStoryPoint(svg: SVGSVGElement, id: string): GraphPoint | undefined {
  const state = getProjection(svg), base = state.base.get(id);
  return base ? projectStoryPoint(base, visualOffset(state, id)) : undefined;
}

/** GSAP publishes visual offsets; both nodes and their real edges follow. */
export function applyStoryProjection(svg: SVGSVGElement, offsets: Map<string, GraphPoint>) {
  const state = getProjection(svg);
  state.offsets = offsets;
  renderPositions(state);
}

/** Idle and story offsets have separate ownership; only this bridge writes SVG. */
export function applyIdleProjection(svg: SVGSVGElement, offsets: Map<string, GraphPoint>) {
  const state = getProjection(svg);
  state.idle = offsets;
  renderPositions(state);
}

export function getVisualOffset(svg: SVGSVGElement, id: string): GraphPoint {
  return visualOffset(getProjection(svg), id);
}

/** Home-only reversible offsets. Empty + weight 1 is the exact existing render path. */
export function applyUniverseProjection(svg: SVGSVGElement, offsets: Map<string, GraphPoint>, idleWeight: number) {
  const state = getProjection(svg);
  state.universe = offsets;
  state.idleWeight = idleWeight;
  renderPositions(state);
}

function visualOffset(state: ProjectionState, id: string): GraphPoint {
  const idle = state.idle.get(id);
  const offset = projectStoryPoint(state.offsets.get(id) ?? { x: 0, y: 0 }, { x: (idle?.x ?? 0) * state.idleWeight, y: (idle?.y ?? 0) * state.idleWeight });
  return projectStoryPoint(offset, state.universe.get(id));
}

function renderPositions(state: ProjectionState) {
  for (const [id, element] of state.positions) {
    const offset = visualOffset(state, id);
    if (offset.x || offset.y) element.setAttribute("transform", `translate(${offset.x} ${offset.y})`);
    else element.removeAttribute("transform");
  }
  renderEdges(state);
  state.listeners?.forEach(listener => listener());
}
