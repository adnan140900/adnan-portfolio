"use client";

import { useEffect, type RefObject } from "react";
import { motionCanRun, motionTokens as M } from "./motion-tokens";

/** Visual-only motion: never writes D3 groups, route controls, or React graph state. */
export function useConstellationMotion(rootRef: RefObject<HTMLElement | null>, reduced: boolean | null, suspended: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pointerLayer = root.querySelector<HTMLElement>(".constellation-pointer-layer");
    const nodes = [...root.querySelectorAll<HTMLElement>(".force-node-control")];
    const cores = [...root.querySelectorAll<HTMLElement>(".knowledge-star-core")];
    root.style.setProperty("--breath-scale", String(1 + M.ambient.scale));
    root.style.setProperty("--hover-duration", `${M.pointer.response}s`);
    const edges = [...root.querySelectorAll<SVGElement>("[data-force-edge]")];
    const desktop = window.matchMedia("(min-width: 48rem) and (pointer: fine)");
    let intersecting = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pulseEnd: ReturnType<typeof setTimeout> | undefined;
    let frame: number | null = null;
    let edgeIndex = 0;
    let pointerX = 0;
    let pointerY = 0;
    const clearProximity = () => nodes.forEach(node => node.removeAttribute("data-proximity"));
    const running = () => !suspended && desktop.matches && motionCanRun(reduced, !document.hidden, intersecting);
    const pulse = () => {
      if (!running() || !edges.length) return;
      const edge = edges[edgeIndex++ % edges.length];
      edge.dataset.ambientActive = "true";
      pulseEnd = setTimeout(() => edge.removeAttribute("data-ambient-active"), M.ambient.edgeDuration * 1000);
      timer = setTimeout(pulse, M.ambient.edgeInterval * 1000);
    };
    cores.forEach((core, index) => {
      core.style.setProperty("--breath-duration", `${M.ambient.breathingSeconds + index % 4}s`);
      core.style.setProperty("--breath-phase", `${-(index * 1.73)}s`);
    });
    const configure = () => {
      clearTimeout(timer);
      clearTimeout(pulseEnd);
      edges.forEach(edge => edge.removeAttribute("data-ambient-active"));
      root.dataset.ambientRunning = String(running());
      if (running()) timer = setTimeout(pulse, M.ambient.edgeInterval * 1000);
      else {
        clearProximity();
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        pointerLayer?.style.removeProperty("transform");
      }
    };
    const move = (event: PointerEvent) => {
      if (!running() || event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        // All reads precede writes; at most one proximity pass per pointer frame.
        const bounds = root.getBoundingClientRect();
        const candidates = nodes.map(node => ({ node, rect: node.getBoundingClientRect() }));
        const nearest = candidates.map(({node, rect}) => ({node, distance: Math.hypot(pointerX - rect.x - rect.width / 2, pointerY - rect.y - rect.height / 2)})).sort((a,b) => a.distance - b.distance)[0];
        clearProximity();
        if (nearest && nearest.distance < M.pointer.proximity) nearest.node.dataset.proximity = "true";
        if (pointerLayer) pointerLayer.style.transform = `translate(${((pointerX - bounds.x) / bounds.width - 0.5) * M.pointer.semantic}px, ${((pointerY - bounds.y) / bounds.height - 0.5) * M.pointer.semantic}px)`;
      });
    };
    const leave = () => { clearProximity(); pointerLayer?.style.removeProperty("transform"); };
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; configure(); });
    observer.observe(root);
    desktop.addEventListener("change", configure);
    document.addEventListener("visibilitychange", configure);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    configure();
    return () => {
      clearTimeout(timer); clearTimeout(pulseEnd);
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect(); desktop.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", configure);
      root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave);
      delete root.dataset.ambientRunning;
      root.style.removeProperty("--breath-scale");
      root.style.removeProperty("--hover-duration");
      edges.forEach(edge => edge.removeAttribute("data-ambient-active"));
      cores.forEach(core => { core.style.removeProperty("--breath-duration"); core.style.removeProperty("--breath-phase"); });
      leave();
    };
  }, [rootRef, reduced, suspended]);
}
