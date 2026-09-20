"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { startDecode } from "../kinetic/decode-controller";
import { motionTokens as M } from "@/features/motion/motion-tokens";
import { createBranchGrowthPlan, scheduleBranchGrowth } from "./branch-growth-plan";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  clusterTransitionReducer,
  idleClusterTransition,
  isClusterTransitionActive,
  type ClusterTransitionEvent,
  type ClusterTransitionDirection,
  type ClusterTransitionState,
} from "./transition-state";
import {
  selectClusterTransitionMode,
} from "./transition-policy";
import type {
  ClusterTransitionRequest,
  PortfolioTransitionContextValue,
} from "./types";

interface ActiveRequest extends ClusterTransitionRequest {
  direction: ClusterTransitionDirection;
  mode: "cinematic" | "compact" | "reduced";
  originPath: string;
  sourceElement: HTMLElement;
  sourceGraph: HTMLElement;
}

const PortfolioTransitionContext = createContext<PortfolioTransitionContextValue | null>(null);

function isVisible(element: Element): element is HTMLElement | SVGElement {
  const bounds = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return bounds.width > 0 && bounds.height > 0 && styles.display !== "none";
}

function findVisibleAnchor(nodeId: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-transition-anchor]"))
    .filter((element) => element.dataset.transitionAnchor === nodeId)
    .find(isVisible);
}

function getVisibleElements<T extends Element>(root: Element, selector: string) {
  return Array.from(root.querySelectorAll<T>(selector)).filter(isVisible);
}

function getCenteredBounds(sourceBounds: DOMRect) {
  const width = Math.min(Math.max(sourceBounds.width * 1.22, 184), 248);
  const height = Math.min(Math.max(sourceBounds.height * 1.12, 84), 108);
  return {
    height,
    width,
    x: window.innerWidth / 2 - width / 2,
    y: window.innerHeight / 2 - height / 2,
  };
}

export function PortfolioTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(clusterTransitionReducer, idleClusterTransition);
  const stateRef = useRef<ClusterTransitionState>(idleClusterTransition);
  const requestRef = useRef<ActiveRequest | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const routeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryFrameRef = useRef<number | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayLabelRef = useRef<HTMLSpanElement>(null);
  const cancelDecodeRef = useRef<(() => void) | null>(null);
  const touchedElementsRef = useRef<Array<HTMLElement | SVGElement>>([]);

  const send = useCallback((event: ClusterTransitionEvent) => {
    stateRef.current = clusterTransitionReducer(stateRef.current, event);
    dispatch(event);
  }, []);

  const clearVisuals = useCallback(() => {
    cancelDecodeRef.current?.();
    cancelDecodeRef.current = null;
    timelineRef.current?.kill();
    timelineRef.current = null;

    if (routeTimeoutRef.current) {
      clearTimeout(routeTimeoutRef.current);
      routeTimeoutRef.current = null;
    }

    if (entryFrameRef.current !== null) {
      cancelAnimationFrame(entryFrameRef.current);
      entryFrameRef.current = null;
    }

    if (touchedElementsRef.current.length > 0) {
      gsap.set(touchedElementsRef.current, { clearProps: "opacity,transform,transformOrigin,strokeDasharray,strokeDashoffset" });
      touchedElementsRef.current = [];
    }

    if (overlayRef.current) {
      gsap.set(overlayRef.current, { clearProps: "all" });
    }

    document.documentElement.removeAttribute("data-cinematic-transition");
  }, []);

  const finishTransition = useCallback(() => {
    clearVisuals();
    requestRef.current = null;
    send({ type: "complete" });
  }, [clearVisuals, send]);

  const cancelTransition = useCallback(() => {
    clearVisuals();
    requestRef.current = null;
    send({ type: "cancel" });
  }, [clearVisuals, send]);

  const requestNavigation = useCallback(
    (request: ActiveRequest) => {
      if (requestRef.current !== request) return;

      send({ type: "route-requested" });
      routeTimeoutRef.current = setTimeout(() => {
        if (requestRef.current !== request || window.location.pathname === request.href) return;
        const fallbackHref = request.href;
        cancelTransition();
        window.location.assign(fallbackHref);
      }, 3500);

      try {
        router.push(request.href, {
          scroll: false,
          transitionTypes: [
            request.direction.startsWith("enter-") ? "cluster-forward" : "cluster-back",
          ],
        });
      } catch {
        const fallbackHref = request.href;
        cancelTransition();
        window.location.assign(fallbackHref);
      }
    },
    [cancelTransition, router, send],
  );

  const beginTransition = useCallback(
    (
      direction: ClusterTransitionDirection,
      request: ClusterTransitionRequest,
    ) => {
      if (stateRef.current.phase !== "idle") return true;
      if (request.href === pathname || !request.href.startsWith("/") || request.href.startsWith("//")) return false;
      clearVisuals();

      const sourceElement = findVisibleAnchor(request.nodeId);
      const sourceGraph = sourceElement?.closest<HTMLElement>("[data-graph-root]");
      if (!sourceElement || !sourceGraph) return false;

      const mode = selectClusterTransitionMode({
        isDesktop: window.matchMedia("(min-width: 48rem)").matches,
        prefersReducedMotion,
      });
      const activeRequest: ActiveRequest = {
        ...request,
        direction,
        mode,
        originPath: pathname,
        sourceElement,
        sourceGraph,
      };

      requestRef.current = activeRequest;
      send({
        type: "start",
        direction,
        mode,
        nodeId: request.nodeId,
        originPath: pathname,
        targetPath: request.href,
      });
      document.documentElement.dataset.cinematicTransition = direction;

      const sourceControl = sourceElement.closest<HTMLElement>("[data-graph-control]");
      const otherControls = getVisibleElements<HTMLElement>(
        sourceGraph,
        "[data-graph-control]",
      ).filter((element) => element !== sourceControl);
      const edges = getVisibleElements<SVGElement>(sourceGraph, "[data-force-edge]");
      touchedElementsRef.current = [
        sourceElement,
        ...(sourceControl ? [sourceControl] : []),
        ...otherControls,
        ...edges,
      ];

      if (mode !== "cinematic") {
        const timeline = gsap.timeline({
          onComplete: () => requestNavigation(activeRequest),
        });
        timeline.to(sourceControl ?? sourceElement, {
          duration: mode === "reduced" ? M.transition.fade : M.transition.compact,
          ease: M.ease.quiet,
          opacity: 0.62,
          scale: mode === "compact" ? 1.025 : 1,
        });
        timelineRef.current = timeline;
        return true;
      }

      const overlay = overlayRef.current;
      const overlayLabel = overlayLabelRef.current;
      if (!overlay || !overlayLabel) {
        requestNavigation(activeRequest);
        return true;
      }

      const sourceBounds = sourceElement.getBoundingClientRect();
      const centered = getCenteredBounds(sourceBounds);
      overlay.dataset.direction = direction;
      overlayLabel.textContent = request.label;
      if (!direction.startsWith("exit-")) cancelDecodeRef.current = startDecode(overlayLabel, request.label, "editorial", `entry:${request.href}`);
      gsap.set(sourceControl ?? sourceElement, { opacity: 0 });
      gsap.set(overlay, {
        height: sourceBounds.height,
        opacity: 1,
        width: sourceBounds.width,
        x: sourceBounds.left,
        y: sourceBounds.top,
      });

      const timeline = gsap.timeline({
        onComplete: () => requestNavigation(activeRequest),
      });
      timeline
        .to(otherControls, {
          duration: direction.startsWith("exit-") ? M.transition.star : M.transition.compact,
          ease: M.ease.reveal,
          opacity: 0.24,
          stagger: 0.012,
        }, 0)
        .to(edges, { duration: M.transition.compact, ease: M.ease.reveal, opacity: 0.06 }, 0)
        .to(overlay, {
          duration: M.transition.travel,
          ease: M.ease.travel,
          height: direction.startsWith("exit-") ? centered.height * 0.9 : centered.height,
          width: direction.startsWith("exit-") ? centered.width * 0.9 : centered.width,
          x:
            direction.startsWith("exit-")
              ? centered.x + centered.width * 0.05
              : centered.x,
          y:
            direction.startsWith("exit-")
              ? centered.y + centered.height * 0.05
              : centered.y,
        }, 0.045);
      timelineRef.current = timeline;
      return true;
    },
    [clearVisuals, pathname, prefersReducedMotion, requestNavigation, send],
  );

  const runTargetEntrance = useCallback(
    (request: ActiveRequest) => {
      const attemptEntrance = (attempt: number) => {
        if (requestRef.current !== request) return;

        const targetAnchor = findVisibleAnchor(request.nodeId);
        const targetGraph = targetAnchor?.closest<HTMLElement>("[data-graph-root]");
        if (!targetAnchor || !targetGraph || (request.mode === "cinematic" && targetGraph.dataset.reducedMotion !== "false")) {
          if (attempt < 20) {
            entryFrameRef.current = requestAnimationFrame(() =>
              attemptEntrance(attempt + 1),
            );
          } else {
            cancelTransition();
          }
          return;
        }

        if (routeTimeoutRef.current) {
          clearTimeout(routeTimeoutRef.current);
          routeTimeoutRef.current = null;
        }
        send({ type: "route-ready" });

        // Route navigation from a lower story moment must land at the new world.
        // Longer approved introductions sit before the graph. Cinematic entry
        // keeps the shared star and all growing endpoints in the viewport.
        const landingTop = request.mode === "cinematic"
          ? Math.max(0, targetGraph.getBoundingClientRect().top + window.scrollY - 56)
          : 0;
        window.scrollTo({ top: landingTop, behavior: "instant" });

        const targetControl = targetAnchor.closest<HTMLElement>("[data-graph-control]");
        const otherControls = getVisibleElements<HTMLElement>(
          targetGraph,
          "[data-graph-control]",
        ).filter((element) => element !== targetControl);
        const edges = getVisibleElements<SVGElement>(targetGraph, "[data-force-edge]");
        touchedElementsRef.current.push(
          targetAnchor,
          ...(targetControl ? [targetControl] : []),
          targetGraph,
          ...otherControls,
          ...edges,
        );

        if (request.mode !== "cinematic") {
          const timeline = gsap.timeline({ onComplete: finishTransition });
          timeline.fromTo(
            targetGraph,
            { opacity: 0.7 },
            {
              duration: request.mode === "reduced" ? M.transition.fade : M.transition.compact,
              ease: M.ease.quiet,
              opacity: 1,
            },
          );
          timelineRef.current = timeline;
          return;
        }

        const overlay = overlayRef.current;
        if (!overlay) {
          finishTransition();
          return;
        }

        const targetBounds = targetAnchor.getBoundingClientRect();
        gsap.set(targetControl ?? targetAnchor, { opacity: 0 });
        gsap.set(otherControls, { opacity: 0, scale: 0.965 });
        gsap.set(edges, { opacity: 0 });

        const timeline = gsap.timeline({ onComplete: finishTransition });
        timeline
          .to(overlay, {
            duration: M.transition.resolve,
            ease: M.ease.travel,
            height: targetBounds.height,
            width: targetBounds.width,
            x: targetBounds.left,
            y: targetBounds.top,
          }, 0)
          .set(overlay, { opacity: 0 }, M.transition.resolve)
          .set(targetControl ?? targetAnchor, { opacity: 1 }, M.transition.resolve);

        if (request.direction.startsWith("enter-")) {
          const controls = new Map(otherControls.map(control => [control.dataset.controlNode ?? "", control]));
          const edgeMap = new Map(edges.map(edge => [edge.dataset.edgeId ?? "", edge]));
          const plan = createBranchGrowthPlan(request.nodeId, [request.nodeId, ...controls.keys()], edges.map(edge => ({ id: edge.dataset.edgeId ?? "", source: edge.dataset.source ?? "", target: edge.dataset.target ?? "" })));
          const labels = otherControls.flatMap(control => [...control.querySelectorAll<HTMLElement>(".knowledge-star-label")]);
          touchedElementsRef.current.push(...labels);
          gsap.set(labels, { opacity: 0 });
          const schedule = scheduleBranchGrowth(request.nodeId, plan, edges.map(edge => ({ id: edge.dataset.edgeId ?? "", source: edge.dataset.source ?? "", target: edge.dataset.target ?? "" })), M.transition);
          schedule.forEach((branch) => {
            const edge = edgeMap.get(branch.edgeId);
            const at = branch.at;
            if (edge) {
              timeline.set(edge, { opacity: 0.28, strokeDasharray: 1, strokeDashoffset: branch.reverse ? -1 : 1 }, at);
              timeline.to(edge, { strokeDashoffset: 0, duration: M.transition.branch, ease: M.ease.quiet }, at);
              timeline.to(edge, { opacity: 0.18, duration: M.transition.fade }, at + M.transition.branch);
            }
            const control = branch.nodeId ? controls.get(branch.nodeId) : undefined;
            if (control) {
              timeline.fromTo(control, { opacity: 0, scale: 0.28 }, { opacity: 1, scale: 1, duration: M.transition.star, ease: M.ease.reveal }, at + M.transition.branch);
              timeline.to(control.querySelector(".knowledge-star-label"), { opacity: 1, duration: M.transition.label }, at + M.transition.branch + 0.1);
            }
          });
          plan.unconnectedNodeIds.forEach(id => {
            const control = controls.get(id);
            if (control) timeline.to(control, { opacity: 1, scale: 1, duration: M.transition.star });
          });
        } else {
          timeline.to(edges, { opacity: 0.18, duration: M.transition.star }, 0.3)
            .to(otherControls, { opacity: 1, scale: 1, duration: M.transition.star, stagger: 0.025 }, 0.32);
        }
        timelineRef.current = timeline;
      };

      attemptEntrance(0);
    },
    [cancelTransition, finishTransition, send],
  );

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;
    const request = requestRef.current;

    if (request) {
      if (pathname === request.href) {
        if (stateRef.current.phase === "exiting") {
          timelineRef.current?.kill();
          send({ type: "route-requested" });
        }
        if (stateRef.current.phase === "awaiting-route") {
          runTargetEntrance(request);
        }
      } else if (stateRef.current.phase === "entering") {
        cancelTransition();
      } else if (pathname !== request.originPath && pathname !== request.href) {
        cancelTransition();
      }
      return;
    }

    // History or ordinary links can interrupt a direct-entry reveal too.
    if (previousPath !== null && previousPath !== pathname) clearVisuals();
    // Direct URLs and history render the complete graph immediately.
  }, [cancelTransition, clearVisuals, pathname, runTargetEntrance, send]);

  useEffect(() => clearVisuals, [clearVisuals]);

  useEffect(() => {
    // Cancel before Next handles a newer link, not after its route commits:
    // otherwise the old exit timeline can push its destination in the meantime.
    const navigation = (event: MouseEvent) => {
      const request = requestRef.current;
      if (!request || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname !== request.href) cancelTransition();
    };
    document.addEventListener("click", navigation, true);
    return () => document.removeEventListener("click", navigation, true);
  }, [cancelTransition]);

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) { timelineRef.current?.pause(); cancelDecodeRef.current?.(); }
      else timelineRef.current?.resume();
    };
    const resize = () => {
      if (requestRef.current) {
        const href = requestRef.current.href;
        cancelTransition();
        if (window.location.pathname !== href) router.push(href);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", resize);
    };
  }, [cancelTransition, router]);

  useEffect(() => {
    if (prefersReducedMotion && requestRef.current) {
      const href = requestRef.current.href;
      cancelTransition();
      if (window.location.pathname !== href) router.push(href);
    }
  }, [cancelTransition, prefersReducedMotion, router]);

  const contextValue = useMemo<PortfolioTransitionContextValue>(() => {
    const active = isClusterTransitionActive(state);
    return {
      direction: active ? state.direction : null,
      enterCluster: (request) => beginTransition("enter-cluster", request),
      exitCluster: (request) => beginTransition("exit-cluster", request),
      enterSubject: (request) => beginTransition("enter-subject", request),
      exitSubject: (request) => beginTransition("exit-subject", request),
      isTargetPath: (path) => active && state.targetPath === path,
      isTransitioning: active,
      mode: active ? state.mode : null,
      phase: state.phase,
      targetPath: active ? state.targetPath : null,
    };
  }, [beginTransition, state]);

  return (
    <PortfolioTransitionContext.Provider value={contextValue}>
      {children}
      <div ref={overlayRef} aria-hidden="true" className="cluster-transition-overlay">
        <span ref={overlayLabelRef} />
      </div>
    </PortfolioTransitionContext.Provider>
  );
}

export function usePortfolioTransition() {
  const context = useContext(PortfolioTransitionContext);
  if (!context) {
    throw new Error("usePortfolioTransition must be used within PortfolioTransitionProvider.");
  }
  return context;
}
