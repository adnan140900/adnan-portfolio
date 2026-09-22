"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode, GraphNodeId } from "../types";
import { createForceGraphController } from "./force-graph-controller";
import { GRAPH_HEIGHT, GRAPH_WIDTH } from "./graph-geometry";
import { getGraphRuntimePolicy } from "./graph-runtime-policy";
import type { ForceGraphController, GraphPoint } from "./types";
import { getVisualOffset } from "./story-projection";
import type { ExperienceProfile } from "../../experience/experience-profile";
import { projectGraphPoint } from "./graph-projection";

interface UseForceGraphOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeId: GraphNodeId;
  profile: ExperienceProfile;
  suspended?: boolean;
}

interface ActiveDrag {
  nodeId: GraphNodeId;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  moved: boolean;
  grabOffset: GraphPoint;
}

function eventToGraphPoint(
  event: ReactPointerEvent<HTMLElement>,
  svg: SVGSVGElement,
): GraphPoint {
  const matrix = svg.getScreenCTM();
  if (matrix) {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  }
  const bounds = svg.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * GRAPH_WIDTH,
    y: ((event.clientY - bounds.top) / bounds.height) * GRAPH_HEIGHT,
  };
}

export function useForceGraph({
  svgRef,
  nodes,
  edges,
  rootNodeId,
  profile,
  suspended = false,
}: UseForceGraphOptions) {
  const controllerRef = useRef<ForceGraphController | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const [dragEnabled, setDragEnabled] = useState(false);

  useEffect(() => {
    const mountedSvg = svgRef.current;
    const configureController = () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;

      const policy = getGraphRuntimePolicy({
        profile,
      });

      const svg = svgRef.current;
      if (!svg || !policy.shouldCreateController || profile.visibility === "hidden") {
        setDragEnabled(false);
        return;
      }

      controllerRef.current = createForceGraphController({
        svg,
        nodes,
        edges,
        rootNodeId,
        animate: policy.shouldAnimate,
        dragEnabled: policy.dragEnabled && !suspended,
        project: point => projectGraphPoint(point, profile.viewport),
      });
      if (suspended) controllerRef.current.destroy();
      setDragEnabled(policy.dragEnabled && !suspended);
    };

    configureController();
    return () => {
      dragRef.current = null;
      const root = mountedSvg?.closest<HTMLElement>("[data-graph-root]");
      if (root) delete root.dataset.draggingNode;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [edges, nodes, profile, rootNodeId, suspended, svgRef]);

  const beginDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, nodeId: GraphNodeId) => {
      const svg = svgRef.current;
      const controller = controllerRef.current;
      if (!svg || !controller?.dragEnabled) return;

      // Preserve the point grabbed inside the control; idle/story offsets must
      // not be counted twice when D3 receives pointer coordinates.
      const pointer = eventToGraphPoint(event, svg);
      const group = event.currentTarget.closest<SVGGElement>("[data-force-node]");
      const base = group?.transform.baseVal.consolidate()?.matrix;
      const visual = getVisualOffset(svg, nodeId);
      const grabOffset = { x: pointer.x - (base?.e ?? pointer.x) - visual.x, y: pointer.y - (base?.f ?? pointer.y) - visual.y };
      const started = controller.beginDrag(nodeId, { x: pointer.x - visual.x - grabOffset.x, y: pointer.y - visual.y - grabOffset.y });
      if (!started) return;
      const root = svg.closest<HTMLElement>("[data-graph-root]");
      if (root) root.dataset.draggingNode = nodeId;

      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        nodeId,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        moved: false,
        grabOffset,
      };
    },
    [svgRef],
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !svg) return;

      const distance = Math.hypot(
        event.clientX - drag.startClientX,
        event.clientY - drag.startClientY,
      );
      drag.moved ||= distance > 5;
      if (drag.moved) event.preventDefault();
      const point = eventToGraphPoint(event, svg);
      const visual = getVisualOffset(svg, drag.nodeId);
      controllerRef.current?.drag(drag.nodeId, { x: point.x - visual.x - drag.grabOffset.x, y: point.y - visual.y - drag.grabOffset.y });
    },
    [svgRef],
  );

  const finishDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    controllerRef.current?.endDrag(drag.nodeId);
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    const root = svgRef.current?.closest<HTMLElement>("[data-graph-root]");
    if (root) delete root.dataset.draggingNode;
  }, [svgRef]);

  const consumeSuppressedClick = useCallback(() => {
    const wasDragged = suppressClickRef.current;
    suppressClickRef.current = false;
    return wasDragged;
  }, []);

  return {
    dragEnabled,
    beginDrag,
    moveDrag,
    finishDrag,
    consumeSuppressedClick,
  };
}
