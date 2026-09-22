"use client";

import { useEffect, type RefObject } from "react";
import type { GraphNode } from "../graph/types";
import { applyIdleProjection } from "../graph/physics/story-projection";
import { advanceIdleClock, createIdleParameters, idleCanRun, idlePoint, idleSettlingSeconds } from "./semantic-idle-model";
import type { ExperienceProfile } from "../experience/experience-profile";

/** One imperative visual clock per graph; never writes physics or React state. */
export function useSemanticIdle(rootRef: RefObject<HTMLElement | null>, svgRef: RefObject<SVGSVGElement | null>, nodes: GraphNode[], anchorId: string | undefined, profile: ExperienceProfile, rendererReady = true) {
  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const controls = new Map([...svg.querySelectorAll<HTMLElement>("[data-control-node]")].map(element => [element.dataset.controlNode, element]));
    const bodies = nodes.map(node => ({ id: node.id, parameters: createIdleParameters(node, anchorId, root.dataset.graphRoute === "/" && (node.depth ?? 0) > 1), time: 0, speed: 0, envelope: 0 }));
    const offsets = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));
    let frame: number | null = null;
    let last = 0;
    let activeTime = 0;
    let intersecting = false;
    let frames = 0;
    const forming = () => root.dataset.routeTransitionActive === "true" || root.dataset.mobileForming === "true";
    const running = () => idleCanRun(profile.motionPreference, rendererReady, profile.visibility === "visible", intersecting, forming());
    const tick = (now: number) => {
      frame = null;
      if (!running()) return;
      const targetFps = profile.viewport === "compact" ? 24 : 30;
      if (last && now - last < 1000 / targetFps) { frame = requestAnimationFrame(tick); return; }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      activeTime += dt;
      for (const body of bodies) {
        const control = controls.get(body.id);
        const held = control?.dataset.idleHeld === "true" || root.dataset.draggingNode === body.id;
        const clock = advanceIdleClock(body.time, body.speed, dt, held);
        body.time = clock.time;
        body.speed = clock.speed;
        if (!held) body.envelope = Math.min(1, body.envelope + dt * body.speed / idleSettlingSeconds);
        const ease = body.envelope * body.envelope * (3 - 2 * body.envelope);
        const point = idlePoint(body.parameters, body.time);
        const offset = offsets.get(body.id)!;
        const amplitude = profile.viewport === "compact" ? 0.58 : 1;
        offset.x = point.x * ease * amplitude;
        offset.y = point.y * ease * amplitude;
      }
      applyIdleProjection(svg, offsets);
      if (++frames % 30 === 0) {
        root.dataset.idleSeconds = activeTime.toFixed(2);
        root.dataset.idlePhase = activeTime < idleSettlingSeconds ? "settling" : "living-idle";
      }
      frame = requestAnimationFrame(tick);
    };
    const configure = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      last = 0;
      root.dataset.idlePhase = forming() ? "formation" : running() ? activeTime < idleSettlingSeconds ? "settling" : "living-idle" : "paused";
      root.dataset.idleFps = profile.viewport === "compact" ? "24" : "30";
      if (profile.motionPreference !== "full" || !rendererReady) {
        applyIdleProjection(svg, new Map());
        for (const body of bodies) { body.envelope = 0; body.speed = 0; }
        root.dataset.idlePhase = "static";
      }
      if (running()) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; configure(); });
    observer.observe(svg);
    const transitionObserver = new MutationObserver(configure);
    transitionObserver.observe(root, { attributes: true, attributeFilter: ["data-route-transition-active", "data-mobile-forming"] });
    configure();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect(); transitionObserver.disconnect();
      applyIdleProjection(svg, new Map());
      delete root.dataset.idlePhase; delete root.dataset.idleSeconds; delete root.dataset.idleFps;
    };
  }, [rootRef, svgRef, nodes, anchorId, profile, rendererReady]);
}
