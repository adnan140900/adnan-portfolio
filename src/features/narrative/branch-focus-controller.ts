import { gsap } from "gsap";
import type { GraphDocument } from "../graph/types";
import { applyStoryProjection, getStoryPoint, getVisualOffset, observeStoryProjection } from "../graph/physics/story-projection";
import type { FilmScene } from "./film-model";
import type { ExperienceProfile } from "../experience/experience-profile";
import { branchCamera, branchFocus } from "./branch-focus-model";

/** One focus job and one tracer per persistent stage. D3 and idle keep ownership. */
export function createBranchFocus(svg: SVGSVGElement, graph: GraphDocument, kind: string, profile: ExperienceProfile) {
  const groups = [...svg.querySelectorAll<SVGGElement>("[data-force-node], [data-projection-node]")];
  const idOf = (group: SVGGElement) => (group.dataset.nodeId ?? group.dataset.projectionNode)!;
  const nodes = groups.map(group => graph.nodes.find(node => node.id === idOf(group))!);
  const edges = [...svg.querySelectorAll<SVGPathElement>("[data-force-edge]")];
  const originalNodes = new Map(groups.map(group => [group, group.getAttribute("opacity")]));
  const originalEdges = new Map(edges.map(edge => [edge, edge.style.opacity]));
  const offsets = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));
  const camera = { x: 0, y: 0 };
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ring.setAttribute("class", "semantic-focus-tracer"); ring.setAttribute("aria-hidden", "true");
  ring.setAttribute("pathLength", "1"); ring.setAttribute("opacity", "0");
  ring.setAttribute("vector-effect", "non-scaling-stroke"); svg.append(ring);
  let target: string | null = null, tween: gsap.core.Timeline | null = null;
  let radius = 12, current = { x: 0, y: 0 }, origin = { x: 0, y: 0 };
  const tracer = { travel: 1, opacity: 0, scale: 1, draw: 1 };
  const paint = () => {
    const point = target ? getStoryPoint(svg, target) : undefined;
    if (!point) { ring.setAttribute("opacity", "0"); return; }
    current = { x: origin.x + (point.x - origin.x) * tracer.travel, y: origin.y + (point.y - origin.y) * tracer.travel };
    ring.setAttribute("cx", String(current.x)); ring.setAttribute("cy", String(current.y));
    ring.setAttribute("r", String(radius * tracer.scale)); ring.setAttribute("opacity", String(tracer.opacity));
    ring.style.strokeDashoffset = String(1 - tracer.draw);
  };
  const measure = () => {
    if (!svg.isConnected) return;
    const matrix = svg.getScreenCTM(), measuredScale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
    const scale = Number.isFinite(measuredScale) && measuredScale > 0 ? measuredScale : 1;
    svg.style.setProperty("--branch-label-scale", String(1 / Math.max(0.1, scale)));
    const group = groups.find(group => idOf(group) === target);
    const core = group?.querySelector<HTMLElement>(".knowledge-star-core");
    const coreWidth = core ? parseFloat(getComputedStyle(core).width) : NaN;
    // Route travel can temporarily detach or hide the measured control.
    const coreRadius = Number.isFinite(coreWidth) ? coreWidth / 2 : Number(group?.querySelector("[data-projection-core]")?.getAttribute("r") ?? 5);
    radius = coreRadius + (profile.viewport === "compact" ? 5 : 8) / Math.max(0.1, scale);
    // Keep labels below the outer ring, in presentation space only.
    groups.forEach(item => item.style.removeProperty("--tracer-label-gap"));
    group?.style.setProperty("--tracer-label-gap", `${radius + 7}px`);
    paint();
  };
  const render = () => {
    offsets.forEach(offset => { offset.x = camera.x; offset.y = camera.y; });
    applyStoryProjection(svg, offsets);
  };
  const unsubscribe = observeStoryProjection(svg, paint);
  const resize = new ResizeObserver(measure); resize.observe(svg);
  const settle = () => {
    tween?.progress(1).kill(); tween = null;
  };
  const visibility = () => { if (document.hidden) settle(); };
  document.addEventListener("visibilitychange", visibility);
  return {
    select(scene: FilmScene) {
      const plan = branchFocus(graph, scene, kind, nodes);
      if (target === plan.target && svg.dataset.branchFocusReady === "true") return;
      tween?.kill(); tween = null; origin = { ...current };
      const previous = target; target = plan.target;
      svg.dataset.activeSemanticNode = target ?? ""; svg.dataset.branchFocusReady = "true";
      ring.dataset.focusTarget = target ?? "";
      groups.forEach(group => {
        const id = idOf(group), active = id === target, neighbor = !active && plan.neighbors.has(id);
        group.dataset.storyActive = String(active); group.dataset.storyNeighbor = String(neighbor);
        group.style.setProperty("--semantic-emphasis", active ? "1" : neighbor ? "0.86" : "0.64");
        if (group.dataset.projectionNode) group.setAttribute("opacity", active ? "1" : neighbor ? "0.86" : "0.64");
      });
      edges.forEach(edge => {
        const incident = plan.edges.has(edge.dataset.edgeId!);
        edge.dataset.storyIncident = String(incident);
        edge.style.setProperty("--story-edge-opacity", incident ? "0.76" : "0.34");
        if (!edge.classList.contains("force-edge")) edge.style.opacity = incident ? "0.76" : "0.34";
      });
      const point = target ? getStoryPoint(svg, target) : undefined;
      const offset = target ? getVisualOffset(svg, target) : { x: 0, y: 0 };
      const base = point ? { x: point.x - offset.x, y: point.y - offset.y } : undefined;
      const next = branchCamera(base, svg.viewBox.baseVal.width, svg.viewBox.baseVal.height, profile.motionPreference !== "full");
      measure();
      if (profile.motionPreference !== "full" || document.hidden || !previous) {
        Object.assign(camera, next); Object.assign(tracer, { travel: 1, opacity: target ? 0.64 : 0, scale: 1, draw: 1 }); render(); return;
      }
      const distance = point ? Math.hypot(point.x - origin.x, point.y - origin.y) : 0;
      const duration = 0.28 + Math.min(0.14, distance / svg.viewBox.baseVal.width * 0.3);
      tracer.travel = 0;
      tween = gsap.timeline({ onUpdate: render, onComplete: () => { tween = null; } });
      tween.to(camera, { ...next, duration, ease: "power2.inOut" }, 0)
        .to(tracer, { opacity: distance > svg.viewBox.baseVal.width * 0.2 ? 0.04 : 0.22, scale: 0.86, duration: duration * 0.22 }, 0)
        .to(tracer, { travel: 1, duration: duration * 0.65, ease: "power2.inOut" }, duration * 0.12)
        .set(tracer, { draw: 0 }, duration * 0.7)
        .to(tracer, { opacity: target ? 0.64 : 0, scale: 1, draw: 1, duration: duration * 0.3, ease: "power1.out" }, duration * 0.7);
    },
    destroy() {
      tween?.kill(); unsubscribe(); resize.disconnect(); document.removeEventListener("visibilitychange", visibility); ring.remove();
      applyStoryProjection(svg, new Map());
      groups.forEach(group => { delete group.dataset.storyActive; delete group.dataset.storyNeighbor; group.style.removeProperty("--semantic-emphasis"); group.style.removeProperty("--tracer-label-gap"); });
      edges.forEach(edge => { delete edge.dataset.storyIncident; edge.style.removeProperty("--story-edge-opacity"); });
      originalNodes.forEach((opacity, group) => opacity === null ? group.removeAttribute("opacity") : group.setAttribute("opacity", opacity));
      originalEdges.forEach((opacity, edge) => { edge.style.opacity = opacity; });
      delete svg.dataset.activeSemanticNode; delete svg.dataset.branchFocusReady;
      svg.style.removeProperty("--branch-label-scale");
    },
  };
}
