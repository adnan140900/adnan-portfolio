"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useMemo, useReducer, useRef, useState } from "react";
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
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  NODE_BOX,
  resolveForcePoint,
} from "../physics/graph-geometry";
import { useForceGraph } from "../physics/use-force-graph";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { usePortfolioTransition } from "@/features/transitions/portfolio-transition-provider";
import { AmbientStarfield } from "@/features/atmosphere/ambient-starfield";
import { useConstellationMotion } from "@/features/motion/use-constellation-motion";
import { useSemanticIdle } from "@/features/motion/use-semantic-idle";
import { createUniverseDepth } from "../universe-depth";
import { UniverseDepthLayer } from "./universe-depth-layer";

interface KnowledgeGraphProps {
  graph: GraphDocument;
  initialViewId: GraphViewId;
  routePath: string;
}

export function KnowledgeGraph({ graph, initialViewId, routePath }: KnowledgeGraphProps) {
  const view = getGraphView(graph, initialViewId);
  const [state, dispatch] = useReducer(graphExplorerReducer, view, createInitialGraphState);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusedVisualNodeId, setFocusedVisualNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const transition = usePortfolioTransition();
  useConstellationMotion(rootRef, prefersReducedMotion, transition.isTransitioning);
  const visibleNodes = useMemo(
    () => getViewNodes(graph, view.id),
    [graph, view.id],
  );
  const visibleEdges = useMemo(
    () => getViewEdges(graph, view.id),
    [graph, view.id],
  );
  const idleNodes = routePath === "/" ? graph.nodes : visibleNodes;
  useSemanticIdle(rootRef, svgRef, idleNodes, view.rootNodeId, prefersReducedMotion);
  const stableNodes = useMemo(
    () => createStableGraphNodes(visibleNodes, view.rootNodeId),
    [visibleNodes, view.rootNodeId],
  );
  const stableLinks = useMemo(() => createForceGraphLinks(visibleEdges), [visibleEdges]);
  const stableNodesById = useMemo(
    () => new Map(stableNodes.map((node) => [node.id, node])),
    [stableNodes],
  );
  const primaryPoints = useMemo(() => new Map(stableNodes.map(node => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }])), [stableNodes]);
  const universeDepth = useMemo(() => routePath === "/" ? createUniverseDepth(graph, primaryPoints) : null, [graph, primaryPoints, routePath]);
  const nodeById = useMemo(
    () => new Map(visibleNodes.map((node) => [node.id, node])),
    [visibleNodes],
  );
  const activeNodeId = hoveredNodeId ?? focusedVisualNodeId;
  const focusedNode = activeNodeId ? nodeById.get(activeNodeId) : state.focusedNodeId
    ? nodeById.get(state.focusedNodeId)
    : nodeById.get(view.rootNodeId);
  const drag = useForceGraph({
    svgRef,
    nodes: visibleNodes,
    edges: visibleEdges,
    rootNodeId: view.rootNodeId,
    prefersReducedMotion,
    suspended: transition.isTransitioning,
  });

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

  const handleControlClick = (
    event: ReactMouseEvent<HTMLElement>,
    node: GraphNode,
    followsRoute: boolean,
  ) => {
    if (drag.consumeSuppressedClick()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!followsRoute) selectNode(node);
  };

  const isNodeSelected = (node: GraphNode) =>
    (state.level === "cluster" && state.activeClusterId === node.id) ||
    (state.level === "subject" && state.activeSubjectId === node.id);

  const renderNodeControl = (node: GraphNode, mobile = false) => {
    const className = mobile ? "mobile-graph-node" : "force-node-control";
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
      "data-selected": isNodeSelected(node),
      "data-idle-held": hoveredNodeId === node.id || focusedVisualNodeId === node.id || isNodeSelected(node),
      tabIndex: transition.isTransitioning ? -1 : undefined,
      onFocus: () => {
        setFocusedVisualNodeId(node.id);
        dispatch({ type: "focus-node", nodeId: node.id });
      },
      onBlur: () => setFocusedVisualNodeId(null),
      onMouseEnter: () => setHoveredNodeId(node.id),
      onMouseLeave: () => setHoveredNodeId(null),
    };
    const content = (
      <>
        <span
          aria-hidden="true"
          className="knowledge-star-visual"
          data-transition-anchor={node.route ? node.id : undefined}
        >
          <span className="knowledge-star-halo" />
          <span className="knowledge-star-core" />
        </span>
        <span className="knowledge-star-label">{node.label}</span>
        <span className="story-star-marker" data-story-marker aria-hidden="true" />
      </>
    );

    if (node.route) {
      return (
        <Link
          href={node.route}
          draggable={false}
          onClick={(event) => handleControlClick(event, node, true)}
          onNavigate={(event) => {
            if (!node.route || node.route === routePath || node.kind === "person") return;
            const enter = node.kind === "subject" ? transition.enterSubject : transition.enterCluster;
            const handled = enter({
              href: node.route,
              label: node.label,
              nodeId: node.id,
            });
            if (handled) event.preventDefault();
          }}
          onPointerDown={(event) => drag.beginDrag(event, node.id)}
          onPointerMove={drag.moveDrag}
          onPointerUp={drag.finishDrag}
          onPointerCancel={drag.finishDrag}
          onLostPointerCapture={drag.finishDrag}
          {...sharedProps}
        >
          {content}
          <span className="sr-only">, opens {node.route}</span>
        </Link>
      );
    }

    return (
      <button
        type="button"
        aria-pressed={isNodeSelected(node)}
        onClick={(event) => handleControlClick(event, node, false)}
        onPointerDown={(event) => drag.beginDrag(event, node.id)}
        onPointerMove={drag.moveDrag}
        onPointerUp={drag.finishDrag}
        onPointerCancel={drag.finishDrag}
        onLostPointerCapture={drag.finishDrag}
        {...sharedProps}
      >
        {content}
      </button>
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
      data-reduced-motion={prefersReducedMotion !== false}
      data-graph-level={state.level}
      data-graph-view={state.activeViewId}
      data-route-transition-active={transition.isTransitioning}
      data-route-transition-target={transition.isTargetPath(routePath)}
      data-route-transition-mode={transition.mode ?? "none"}
      data-inspecting={activeNodeId !== null}
    >
      <AmbientStarfield seed="shared-public-universe" />

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
            {prefersReducedMotion === false ? "Scroll to explore" : "Still constellation"}
          </span>
        </div>
      </div>

      <div className="graph-surface">
        <div className="constellation-camera-layer"><div className="constellation-pointer-layer">
        <nav aria-label={`Explore ${view.label}`}>
          <svg
            ref={svgRef}
            className="force-graph-svg"
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            role="group"
            aria-label={`${view.label}, ${visibleNodes.length} nodes`}
          >
            {universeDepth && <UniverseDepthLayer depth={universeDepth} primary={primaryPoints} activeId={activeNodeId} />}
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
                  <g data-story-position={node.id}><foreignObject
                    x={-NODE_BOX.width / 2}
                    y={-NODE_BOX.height / 2}
                    width={NODE_BOX.width}
                    height={NODE_BOX.height}
                    className="overflow-visible"
                  >
                    <div className="scene-node h-full w-full" data-scene-node={node.id}>{renderNodeControl(node)}</div>
                  </foreignObject></g>
                </g>
              );
            })}
          </svg>

          {universeDepth && <svg className="mobile-universe-depth" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} aria-hidden="true"><UniverseDepthLayer depth={universeDepth} primary={primaryPoints} activeId={null} /></svg>}
          <ul className="mobile-graph-list">
            {visibleNodes.map((node) => (
              <li key={node.id} className={node.id === view.rootNodeId ? "mobile-root-node" : ""}>
                {renderNodeControl(node, true)}
              </li>
            ))}
          </ul>
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
