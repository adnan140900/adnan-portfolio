"use client";

import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { getGraphView, getViewEdges, getViewNodes } from "../selectors";
import {
  createInitialGraphState,
  graphExplorerReducer,
} from "../state/graph-state";
import type { GraphDocument, GraphNode, GraphViewId } from "../types";
import {
  createForceGraphLinks,
  createConstellationPath,
  createStableGraphNodes,
  resolveForcePoint,
} from "../physics/graph-geometry";
import { useForceGraph } from "../physics/use-force-graph";
import { useExperienceProfile } from "@/features/experience/experience-profile-provider";
import { usePortfolioTransition } from "@/features/transitions/portfolio-transition-provider";
import { AmbientStarfield } from "@/features/atmosphere/ambient-starfield";
import { useConstellationMotion } from "@/features/motion/use-constellation-motion";
import { useSemanticIdle } from "@/features/motion/use-semantic-idle";
import { createUniverseDepth } from "../universe-depth";
import { UniverseDepthLayer } from "./universe-depth-layer";
import { getGraphViewport, projectGraphPoint } from "../physics/graph-projection";
import { useUniverseMotion } from "../../universe/use-universe-motion";

interface KnowledgeGraphProps {
  graph: GraphDocument;
  initialViewId: GraphViewId;
  routePath: string;
  atmosphere?: "local" | "page";
}

export function KnowledgeGraph({ graph, initialViewId, routePath, atmosphere = "local" }: KnowledgeGraphProps) {
  const view = getGraphView(graph, initialViewId);
  const [state, dispatch] = useReducer(graphExplorerReducer, view, createInitialGraphState);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusedVisualNodeId, setFocusedVisualNodeId] = useState<string | null>(null);
  const [pressedNodeId, setPressedNodeId] = useState<string | null>(null);
  const [touchSelectedNodeId, setTouchSelectedNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const pressTimeoutRef = useRef<number | null>(null);
  const profile = useExperienceProfile();
  const transition = usePortfolioTransition();
  useConstellationMotion(rootRef, profile, transition.isTransitioning);
  const visibleNodes = useMemo(
    () => getViewNodes(graph, view.id),
    [graph, view.id],
  );
  const visibleEdges = useMemo(
    () => getViewEdges(graph, view.id),
    [graph, view.id],
  );
  const idleNodes = routePath === "/" ? graph.nodes : visibleNodes;
  useSemanticIdle(rootRef, svgRef, idleNodes, view.rootNodeId, profile);
  const stableNodes = useMemo(
    () => createStableGraphNodes(visibleNodes, view.rootNodeId),
    [visibleNodes, view.rootNodeId],
  );
  const stableLinks = useMemo(() => createForceGraphLinks(visibleEdges), [visibleEdges]);
  const stableNodesById = useMemo(
    () => new Map(stableNodes.map((node) => [node.id, { ...node, ...projectGraphPoint({ x: node.x ?? 0, y: node.y ?? 0 }, profile.viewport) }])),
    [profile.viewport, stableNodes],
  );
  const canonicalPrimaryPoints = useMemo(() => new Map(stableNodes.map(node => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }])), [stableNodes]);
  const primaryPoints = useMemo(() => new Map([...canonicalPrimaryPoints].map(([id, point]) => [id, projectGraphPoint(point, profile.viewport)])), [canonicalPrimaryPoints, profile.viewport]);
  const universeDepth = useMemo(() => routePath === "/" ? createUniverseDepth(graph, canonicalPrimaryPoints) : null, [graph, canonicalPrimaryPoints, routePath]);
  const nodeById = useMemo(
    () => new Map(visibleNodes.map((node) => [node.id, node])),
    [visibleNodes],
  );
  const activeNodeId = pressedNodeId ?? hoveredNodeId ?? focusedVisualNodeId ?? touchSelectedNodeId;
  const viewport = getGraphViewport(profile.viewport);
  const focusedNode = activeNodeId ? nodeById.get(activeNodeId) : state.focusedNodeId
    ? nodeById.get(state.focusedNodeId)
    : nodeById.get(view.rootNodeId);
  const drag = useForceGraph({
    svgRef,
    nodes: visibleNodes,
    edges: visibleEdges,
    rootNodeId: view.rootNodeId,
    profile,
    suspended: transition.isTransitioning,
  });

  useUniverseMotion(rootRef, svgRef, graph.nodes, routePath, profile, transition.isTransitioning);

  const selectNode = (node: GraphNode) => {
    if (node.kind === "subject" && node.parentId) {
      dispatch({ type: "open-subject", nodeId: node.id, clusterId: node.parentId });
      return;
    }

    if (node.kind === "cluster") {
      dispatch({ type: "enter-cluster", nodeId: node.id });
      return;
    }

    dispatch({ type: "focus-node", nodeId: node.id });
  };

  const activateNonRoutedNode = (node: GraphNode) => {
    setTouchSelectedNodeId(current => current === node.id ? null : node.id);
    selectNode(node);
  };

  const handleControlClick = (
    event: ReactMouseEvent<Element>,
    node: GraphNode,
    followsRoute: boolean,
  ) => {
    if (drag.consumeSuppressedClick()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!followsRoute) activateNonRoutedNode(node);
  };

  const isNodeSelected = (node: GraphNode) =>
    (state.level === "cluster" && state.activeClusterId === node.id) ||
    (state.level === "subject" && state.activeSubjectId === node.id);

  const previewPress = (event: ReactPointerEvent<Element>, node: GraphNode) => {
    if (event.pointerType === "touch" || event.pointerType === "pen" || profile.pointer === "coarse") setPressedNodeId(node.id);
    drag.beginDrag(event, node.id);
  };

  const finishPress = (event: ReactPointerEvent<Element>) => {
    drag.finishDrag(event);
    if (pressTimeoutRef.current !== null) window.clearTimeout(pressTimeoutRef.current);
    pressTimeoutRef.current = window.setTimeout(() => {
      setPressedNodeId(null);
      pressTimeoutRef.current = null;
    }, 140);
  };

  useEffect(() => () => {
    if (pressTimeoutRef.current !== null) window.clearTimeout(pressTimeoutRef.current);
  }, []);

  const labelLines = (label: string) => {
    const words = label.split(" ");
    const lines: string[] = [];
    for (const word of words) {
      const current = lines.at(-1);
      if (!current || `${current} ${word}`.length > 24) lines.push(word);
      else lines[lines.length - 1] = `${current} ${word}`;
    }
    return lines.slice(0, 3);
  };

  const renderNodeControl = (node: GraphNode) => {
    const className = "force-node-control svg-node-control";
    const sharedProps = {
      className,
      "data-graph-control": true,
      "data-control-node": node.id,
      "data-kind": node.kind,
      "data-importance": node.importance,
      "data-depth": node.depth,
      "data-category": node.category,
      "data-display-status": node.displayStatus,
      "data-root": node.id === view.rootNodeId,
      "data-parent-node": node.parentId,
      "data-selected": isNodeSelected(node),
      "data-idle-held": hoveredNodeId === node.id || focusedVisualNodeId === node.id || isNodeSelected(node),
      tabIndex: transition.isTransitioning ? -1 : 0,
      "aria-label": node.route ? `${node.label}, opens ${node.route}` : node.label,
      onFocus: () => {
        setFocusedVisualNodeId(node.id);
        dispatch({ type: "focus-node", nodeId: node.id });
      },
      onBlur: () => setFocusedVisualNodeId(null),
      onMouseEnter: () => setHoveredNodeId(node.id),
      onMouseLeave: () => setHoveredNodeId(null),
    };
    const root = node.id === view.rootNodeId || node.kind === "person";
    const coreRadius = root ? 5.8 : node.importance === "primary" ? 4.8 : node.importance === "featured" ? 3.8 : 2.8;
    const content = (
      <>
        <circle className="knowledge-star-hit" r={62} aria-hidden="true" />
        <g
          aria-hidden="true"
          className="knowledge-star-visual"
          data-transition-anchor={node.route ? node.id : undefined}
        >
          <circle className="knowledge-star-halo" r={root ? 25 : 19} />
          <circle className="knowledge-star-core" r={coreRadius} />
        </g>
        <text className="knowledge-star-label" textAnchor="middle" aria-hidden="true">
          {labelLines(node.label).map((line, index) => <tspan key={`${index}:${line}`} x="0" dy={index === 0 ? 27 : 14}>{line}</tspan>)}
        </text>
        <circle className="story-star-marker" data-story-marker aria-hidden="true" cx={20} cy={-20} r={1.5} />
      </>
    );

    if (node.route) {
      return (
        <a
          href={node.route}
          onClick={(event) => {
            handleControlClick(event, node, true);
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (!node.route || node.route === routePath || node.kind === "person") return;
            const enter = node.kind === "subject" ? transition.enterSubject : transition.enterCluster;
            const handled = enter({
              href: node.route,
              label: node.label,
              nodeId: node.id,
            });
            if (handled) event.preventDefault();
          }}
          onPointerDown={(event) => previewPress(event, node)}
          onPointerMove={drag.moveDrag}
          onPointerUp={finishPress}
          onPointerCancel={finishPress}
          onLostPointerCapture={finishPress}
          {...sharedProps}
        >
          {content}
        </a>
      );
    }

    return (
      <g
        role="button"
        aria-pressed={isNodeSelected(node)}
        onClick={(event) => handleControlClick(event, node, false)}
        onKeyDown={(event: ReactKeyboardEvent<SVGGElement>) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            event.preventDefault();
            activateNonRoutedNode(node);
          }
        }}
        onPointerDown={(event) => previewPress(event, node)}
        onPointerMove={drag.moveDrag}
        onPointerUp={finishPress}
        onPointerCancel={finishPress}
        onLostPointerCapture={finishPress}
        {...sharedProps}
      >
        {content}
      </g>
    );
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby={`${view.id}-graph-title`}
      aria-busy={transition.isTransitioning}
      className="constellation-shell"
      data-graph-root
      data-graph-route={routePath}
      data-universe-pending={routePath === "/" && profile.motionPreference === "unresolved" ? true : undefined}
      data-reduced-motion={profile.motionPreference !== "full"}
      data-graph-level={state.level}
      data-graph-view={state.activeViewId}
      data-route-transition-active={transition.isTransitioning}
      data-route-transition-target={transition.isTargetPath(routePath)}
      data-route-transition-mode={transition.mode ?? "none"}
      data-inspecting={activeNodeId !== null}
    >
      {atmosphere === "local" && <AmbientStarfield seed="shared-public-universe" />}

      <div className="constellation-meta">
        <div>
          <h2 id={`${view.id}-graph-title`} className="text-base font-semibold">
            {view.label}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {view.level === "universe"
              ? "Use Tab to explore. Select a theme to follow its connections."
              : view.level === "subject"
              ? "Explore the concepts with Tab. Scroll to follow the story."
              : "Use Tab to explore this constellation. Dragging is optional on desktop."}
          </p>
        </div>
        <div className="constellation-runtime">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          <span className="font-mono uppercase tracking-[0.1em]">
            {profile.motionPreference === "full" ? "Scroll to explore" : profile.motionPreference === "reduced" ? "Still constellation" : "Preparing constellation"}
          </span>
        </div>
      </div>

      <div className="graph-surface">
        <div className="constellation-camera-layer"><div className="constellation-pointer-layer">
        <nav aria-label={`Explore ${view.label}`}>
          <svg
            ref={svgRef}
            className="force-graph-svg"
            viewBox={`0 0 ${viewport.width} ${viewport.height}`}
            role="group"
            aria-label={`${view.label}, ${visibleNodes.length} nodes`}
            data-semantic-mobile={profile.viewport === "compact"}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setTouchSelectedNodeId(null);
            }}
          >
            {universeDepth && <UniverseDepthLayer depth={universeDepth} primary={primaryPoints} activeId={activeNodeId} viewport={profile.viewport} />}
            <g aria-hidden="true">
              {visibleEdges.map((edge, index) => {
                const stableLink = stableLinks[index];
                const source = stableLink
                  ? resolveForcePoint(stableLink.source, stableNodesById)
                  : undefined;
                const target = stableLink
                  ? resolveForcePoint(stableLink.target, stableNodesById)
                  : undefined;
                const isConnected =
                  activeNodeId === null ||
                  edge.source === activeNodeId ||
                  edge.target === activeNodeId;

                return (
                  <path
                    key={edge.id}
                    data-force-edge
                    data-edge-id={edge.id}
                    data-source={edge.source}
                    data-target={edge.target}
                    data-relationship={edge.relation}
                    pathLength={1}
                    data-highlighted={activeNodeId !== null && isConnected}
                    data-muted={activeNodeId !== null && !isConnected}
                    className="force-edge"
                    d={createConstellationPath(
                      { x: source?.x ?? 0, y: source?.y ?? 0 },
                      { x: target?.x ?? 0, y: target?.y ?? 0 },
                      edge.id,
                    )}
                  />
                );
              })}
            </g>

            {visibleNodes.map((node) => {
              const stableNode = stableNodesById.get(node.id);
              const directlyConnected = visibleEdges.some(
                (edge) =>
                  (edge.source === activeNodeId && edge.target === node.id) ||
                  (edge.target === activeNodeId && edge.source === node.id),
              );

              return (
                <g
                  key={node.id}
                  data-force-node
                  data-node-id={node.id}
                  data-active={activeNodeId === node.id}
                  data-neighbor={directlyConnected}
                  data-draggable={drag.dragEnabled}
                  className="force-node-group"
                  transform={`translate(${stableNode?.x ?? 0} ${stableNode?.y ?? 0})`}
                >
                  <g data-story-position={node.id}><g data-scene-body data-universe-body={routePath === "/" ? node.id : undefined}>
                    <g className="scene-node" data-scene-node={node.id}>{renderNodeControl(node)}</g>
                  </g></g>
                </g>
              );
            })}
          </svg>

        </nav>
        </div></div>
      </div>

      {activeNodeId && focusedNode && view.level !== "universe" && <aside className="node-annotation" aria-live="polite"><p>{focusedNode.summary}</p></aside>}
      <details className="graph-inspection"><summary>Inspect this constellation</summary><div className="constellation-inspector">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
          {state.level}
        </p>
        <div aria-live="polite">
          <p className="inspector-title">{focusedNode?.label}</p>
          {focusedNode?.kind === "person" ? <details className="root-profile"><summary>Profile</summary><p className="inspector-summary">{focusedNode.summary}</p></details> : <>
            {focusedNode?.displayStatus && <p className="content-status">{focusedNode.displayStatus.replaceAll("-", " ")}</p>}
            <p className="inspector-summary">{focusedNode?.summary ?? "Choose a node to inspect it."}</p>
          </>}
        </div>
        {focusedNode && <details className="node-relationships"><summary>Connections for {focusedNode.label}</summary><ul>
          {graph.edges.filter(edge => edge.source === focusedNode.id || edge.target === focusedNode.id).map(edge => {
            const source = graph.nodes.find(node => node.id === edge.source)!;
            const target = graph.nodes.find(node => node.id === edge.target)!;
            return <li key={edge.id}>{source.label} <span>{edge.relation.replaceAll("-", " ")}</span> {target.route ? <Link href={target.route}>{target.label}</Link> : target.label}</li>;
          })}
        </ul></details>}
      </div></details>
    </section>
  );
}
