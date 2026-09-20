import type { GraphPoint } from "./types";
import { createConstellationPath } from "./graph-geometry";

interface ProjectionState {
  background: Map<string, GraphPoint>;
  base: Map<string, GraphPoint>;
  offsets: Map<string, GraphPoint>;
  idle: Map<string, GraphPoint>;
  positions: Map<string, SVGGElement>;
  edges: SVGPathElement[];
}
const projections = new WeakMap<SVGSVGElement, ProjectionState>();

function getProjection(svg: SVGSVGElement) {
  let state = projections.get(svg);
  if (!state) {
    const background = new Map(Array.from(svg.querySelectorAll<SVGGElement>("[data-universe-node]")).map(element => [element.dataset.universeNode ?? "", { x: Number(element.dataset.baseX), y: Number(element.dataset.baseY) }]));
    state = { background, base: new Map(background), offsets: new Map(), idle: new Map(), positions: new Map(Array.from(svg.querySelectorAll<SVGGElement>("[data-story-position]")).map(element => [element.dataset.storyPosition ?? "", element])), edges: [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]"), ...svg.querySelectorAll<SVGPathElement>("[data-universe-edge]")] };
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
    edge.setAttribute("d", createConstellationPath(projectStoryPoint(projectStoryPoint(source, state.offsets.get(sourceId)), state.idle.get(sourceId)), projectStoryPoint(projectStoryPoint(target, state.offsets.get(targetId)), state.idle.get(targetId)), edge.dataset.edgeId ?? ""));
  }
}

/** D3 publishes base geometry; no layout reads and no scene mutation of physics. */
export function publishGraphGeometry(svg: SVGSVGElement, base: Map<string, GraphPoint>) {
  const state = getProjection(svg);
  state.base = new Map([...state.background, ...base]);
  renderEdges(state);
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
  const state = getProjection(svg);
  return projectStoryPoint(state.offsets.get(id) ?? { x: 0, y: 0 }, state.idle.get(id));
}

function renderPositions(state: ProjectionState) {
  for (const [id, element] of state.positions) {
    const offset = projectStoryPoint(state.offsets.get(id) ?? { x: 0, y: 0 }, state.idle.get(id));
    if (offset.x || offset.y) element.setAttribute("transform", `translate(${offset.x} ${offset.y})`);
    else element.removeAttribute("transform");
  }
  renderEdges(state);
}
