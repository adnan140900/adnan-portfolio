import { gsap } from "gsap";
import type { GraphNode } from "../graph/types";
import type { ExperienceViewport } from "../experience/experience-profile";
import { applyUniverseProjection } from "../graph/physics/story-projection";
import { clampProgress, genesisDuration, genesisEdgeProgress, genesisNodeFrame, universeEdgeProgress, universeNodeFrame, type UniverseEdgeTier } from "./universe-motion-model";
import { heroReplayStep } from "../kinetic/decode-typewriter-model";

/** One bounded entry clock + one native-scroll RAF. No pinning, physics or React frames. */
export function createUniverseMotion(root: HTMLElement, svg: SVGSVGElement, nodes: GraphNode[], viewport: ExperienceViewport, genesis: boolean, entryComplete: () => void) {
  const hero = root.closest<HTMLElement>(".discovery-hero")!;
  const surface = root.querySelector<HTMLElement>(".graph-surface")!;
  const bodies = nodes.map(node => {
    const body = svg.querySelector<SVGGElement>(`[data-universe-body="${node.id}"]`);
    const base = body?.closest<SVGGElement>("[data-force-node], [data-universe-node]")?.transform.baseVal.consolidate()?.matrix;
    return { node, body, origin: base ? { x: base.e, y: base.f } : undefined, label: body?.querySelector<SVGElement | HTMLElement>(".knowledge-star-label, text") };
  });
  const edgeTier = (edge: SVGPathElement): UniverseEdgeTier => edge.hasAttribute("data-force-edge") ? "primary" : edge.dataset.relationship !== "includes" ? "bridge" : edge.dataset.tier === "secondary" ? "secondary" : "tertiary";
  const edges = [...svg.querySelectorAll<SVGPathElement>("[data-force-edge], [data-universe-edge]")].sort((a, b) => {
    const tiers: UniverseEdgeTier[] = ["primary", "secondary", "tertiary", "bridge"];
    return tiers.indexOf(edgeTier(a)) - tiers.indexOf(edgeTier(b));
  });
  const edgePlan = edges.map(edge => {
    const tier = edgeTier(edge), group = edges.filter(candidate => edgeTier(candidate) === tier);
    return { edge, tier, index: group.indexOf(edge), count: group.length };
  });
  let armed = false, cycle = 0, reentering = false;
  const reveal = (stage: number) => {
    const value = String(stage);
    if (hero.dataset.heroStage !== value) hero.dataset.heroStage = value;
    hero.dataset.heroCycle = String(cycle);
  };
  const revealScroll = (progress: number) => {
    const next = heroReplayStep(armed, progress);
    if (next.armed && !armed) { cycle++; reentering = false; }
    armed = next.armed;
    if (next.replay) reentering = true;
    if (armed) reveal(progress <= 0.4 ? 1 : 0);
    else if (reentering) { reveal(progress <= 0.04 ? 3 : 2); if (progress <= 0.04) reentering = false; }
    else reveal(3);
    hero.dataset.heroReplay = armed ? "armed" : reentering ? "reentered" : "active";
  };
  let frame: number | null = null;
  let disposed = false;
  let bypass = false;
  let start = 0;
  let distance = 1;
  let lastProgress = -1;
  let entry: gsap.core.Tween | null = null;
  const clock = { seconds: 0 };
  const ownership = (value: string) => { if (root.dataset.universeMotion !== value) root.dataset.universeMotion = value; };
  const reset = () => {
    applyUniverseProjection(svg, new Map(), 1);
    for (const { body, label } of bodies) {
      body?.removeAttribute("transform"); body?.removeAttribute("opacity");
      label?.style.removeProperty("filter");
    }
    for (const edge of edges) { edge.style.removeProperty("stroke-dasharray"); edge.style.removeProperty("stroke-dashoffset"); edge.style.removeProperty("visibility"); }
    surface.style.removeProperty("translate");
    ownership("rest");
  };
  const paint = (progress: number, seconds?: number) => {
    if (disposed || bypass) return;
    root.dataset.universeProgress = progress.toFixed(4);
    if (seconds === undefined) revealScroll(progress);
    else reveal(seconds >= 5.1 ? 3 : seconds >= 4.1 ? 2 : seconds >= 3.6 ? 1 : 0);
    if (seconds === undefined && progress === 0) { reset(); return; }
    ownership(seconds === undefined ? "scroll" : "genesis");
    const offsets = new Map<string, { x: number; y: number }>();
    let idleWeight = 0;
    for (const { node, body, label, origin } of bodies) {
      const value = seconds === undefined ? universeNodeFrame(node, viewport, progress, origin) : genesisNodeFrame(node, viewport, seconds, origin);
      offsets.set(node.id, { x: value.x, y: value.y });
      idleWeight = value.idleWeight;
      body?.setAttribute("transform", `scale(${value.scale})`);
      body?.setAttribute("opacity", String(value.opacity));
      if (label) label.style.filter = `opacity(${value.label})`;
    }
    applyUniverseProjection(svg, offsets, idleWeight);
    edgePlan.forEach(({ edge, tier, index, count }) => {
      const value = seconds === undefined ? universeEdgeProgress(tier, progress, index / Math.max(1, count - 1)) : genesisEdgeProgress(index, count, seconds, tier);
      edge.style.strokeDasharray = "1 1";
      edge.style.strokeDashoffset = String(1 - value);
      edge.style.visibility = value === 0 ? "hidden" : "visible";
    });
    // The bounded CSS-sticky frame keeps the field visible; no extra camera displacement.
  };
  const scrollProgress = () => clampProgress((window.scrollY - start) / distance);
  const update = () => {
    frame = null;
    if (disposed || entry || bypass) return;
    const progress = scrollProgress();
    if (progress !== lastProgress) { lastProgress = progress; paint(progress); }
  };
  const request = () => { if (frame === null && !disposed) frame = requestAnimationFrame(update); };
  const measure = () => {
    const rect = hero.getBoundingClientRect();
    start = Math.max(0, rect.top + window.scrollY - (document.querySelector(".site-header")?.getBoundingClientRect().height ?? 64));
    distance = Math.max(420, Math.min(rect.height, window.innerHeight * 1.05));
    root.dataset.universeScrollDistance = distance.toFixed(2);
    lastProgress = -1;
    request();
  };
  const finishEntry = () => { entry = null; entryComplete(); lastProgress = -1; update(); };
  const onScroll = () => {
    bypass = false;
    lastProgress = -1;
    // Native scrolling never waits for Genesis. Seek to the same absolute scroll state.
    if (entry && scrollProgress() > 0.01) { entry.kill(); finishEntry(); }
    request();
  };
  const release = () => {
    entry?.kill(); entry = null; entryComplete(); reset(); reveal(3); bypass = true;
  };
  // Capture phase restores geometry before existing route/drag handlers inspect anchors.
  const onInteraction = (event: Event) => {
    if (event.target instanceof Element && event.target.closest("a, button, summary")) release();
  };
  const onVisibility = () => {
    if (document.hidden) entry?.pause(); else { entry?.resume(); request(); }
  };
  measure();
  if (genesis && scrollProgress() < 0.01) {
    paint(0, 0);
    entry = gsap.to(clock, { seconds: genesisDuration, duration: genesisDuration, ease: "none", onUpdate: () => paint(0, clock.seconds), onComplete: finishEntry });
  } else { entryComplete(); update(); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  hero.addEventListener("click", onInteraction, true);
  hero.addEventListener("focusin", onInteraction, true);
  const resize = new ResizeObserver(measure);
  resize.observe(hero);
  return () => {
    disposed = true; entry?.kill();
    if (frame !== null) cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", measure);
    document.removeEventListener("visibilitychange", onVisibility);
    hero.removeEventListener("click", onInteraction, true); hero.removeEventListener("focusin", onInteraction, true);
    resize.disconnect(); reset();
    delete root.dataset.universeMotion; delete root.dataset.universeProgress; delete root.dataset.universeScrollDistance;
    delete hero.dataset.heroStage; delete hero.dataset.heroCycle; delete hero.dataset.heroReplay;
  };
}
