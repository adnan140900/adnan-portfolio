import { gsap } from "gsap";
import { startDecode } from "../kinetic/decode-controller";
import type { DecodeMode } from "../kinetic/decode-model";
import type { ExperienceProfile } from "../experience/experience-profile";
import { createSceneLifecycle, sceneRevealDuration, sceneRevealFrame } from "./scene-replay-model";

// A page can contain multiple films. The newly read scene takes foreground ownership.
let foregroundCancel: (() => void) | null = null;

/** Bounded presentation job under the existing film owner, never a second scroll owner. */
export function createSceneReplay(root: HTMLElement, panels: HTMLElement[], profile: ExperienceProfile) {
  const lifecycle = createSceneLifecycle(panels.length);
  // Branch scenes replay typography only. Their stage and idle never yield to Genesis.
  const graphReplay = root.dataset.branchPersistent !== "true";
  const stage = graphReplay ? root.querySelector<HTMLElement>(".constellation-shell, .projection-persistent") : null;
  const bodies = graphReplay ? [...root.querySelectorAll<SVGGElement>("[data-scene-body]")] : [];
  const labels = graphReplay ? [...root.querySelectorAll<HTMLElement | SVGElement>(".knowledge-star-label, .projection-label")] : [];
  const edges = graphReplay ? [...root.querySelectorAll<SVGPathElement>(".semantic-stage [data-force-edge]")] : [];
  let timeline: gsap.core.Tween | null = null, cancelDecode: (() => void)[] = [];
  let panel: HTMLElement | undefined, copy: HTMLElement | null = null;
  const clock = { seconds: sceneRevealDuration };
  const restore = () => {
    bodies.forEach(body => { body.removeAttribute("transform"); body.removeAttribute("opacity"); });
    labels.forEach(label => label.style.removeProperty("filter"));
    edges.forEach(edge => {
      if (edge.dataset.sceneDrawing !== "true") return;
      delete edge.dataset.sceneDrawing;
      edge.style.removeProperty("stroke-dashoffset"); edge.style.removeProperty("visibility");
      const dash = edge.dataset.sceneRestDash;
      if (dash) edge.style.strokeDasharray = dash; else edge.style.removeProperty("stroke-dasharray");
    });
    copy?.style.removeProperty("filter");
    if (stage) delete stage.dataset.sceneRevealing;
    root.dataset.sceneRevealRunning = "false";
  };
  const cancel = () => {
    timeline?.kill(); timeline = null;
    cancelDecode.forEach(stop => stop()); cancelDecode = [];
    restore();
    if (foregroundCancel === cancel) foregroundCancel = null;
  };
  const paint = () => {
    const frame = sceneRevealFrame(clock.seconds);
    const shift = profile.viewport === "compact" ? 9 : 16;
    bodies.forEach((body, index) => {
      body.setAttribute("transform", `translate(${Math.sin(index * 2.4) * shift * (1 - frame.node)} ${shift * (1 - frame.node)}) scale(${0.8 + frame.node * 0.2})`);
      body.setAttribute("opacity", String(0.22 + 0.78 * frame.node));
    });
    labels.forEach(label => { label.style.filter = `opacity(${frame.label})`; });
    edges.forEach((edge, index) => {
      const value = sceneRevealFrame(clock.seconds, index / Math.max(1, edges.length - 1)).edge;
      edge.style.strokeDasharray = "1 1"; edge.style.strokeDashoffset = String(1 - value);
      edge.style.visibility = value === 0 ? "hidden" : "visible";
    });
    if (copy) copy.style.filter = `opacity(${frame.copy})`;
  };
  return {
    activate(index: number) {
      const activation = lifecycle.enter(index, profile.motionPreference);
      if (!activation) return;
      cancel(); panel = panels[index];
      copy = panel.querySelector<HTMLElement>("[data-film-copy]");
      panel.dataset.sceneEpoch = String(activation.epoch);
      root.dataset.sceneActivation = `${panel.id}:${activation.epoch}`;
      if (!activation.animate || document.hidden) return;
      foregroundCancel?.(); foregroundCancel = cancel;
      if (stage) stage.dataset.sceneRevealing = "true";
      root.dataset.sceneRevealRunning = "true";
      edges.forEach(edge => { edge.dataset.sceneRestDash = edge.style.strokeDasharray; edge.dataset.sceneDrawing = "true"; });
      // Title first in the shared two-job budget; decorative vocabulary second.
      const texts = [...panel.querySelectorAll<HTMLElement>("[data-film-title] [data-scene-decode], [data-film-term] [data-scene-decode]")];
      texts.sort((a, b) => Number(!!b.closest("[data-film-title]")) - Number(!!a.closest("[data-film-title]")));
      cancelDecode = texts.map(element => startDecode(element, element.dataset.sceneDecode!, element.dataset.decodeMode as DecodeMode, `${panel!.id}:${activation.epoch}`, { replay: true, viewport: profile.viewport }));
      clock.seconds = 0; paint();
      timeline = gsap.to(clock, { seconds: sceneRevealDuration, duration: sceneRevealDuration, ease: "none", onUpdate: paint, onComplete: () => {
        if (!lifecycle.isCurrent(activation.token)) return;
        timeline = null; restore();
        if (foregroundCancel === cancel) foregroundCancel = null;
      } });
    },
    render() { if (timeline) paint(); },
    suspend: cancel,
    leave() { cancel(); lifecycle.leave(); },
    destroy() { cancel(); lifecycle.leave(); panels.forEach(p => { delete p.dataset.sceneEpoch; }); delete root.dataset.sceneActivation; delete root.dataset.sceneRevealRunning; },
  };
}
