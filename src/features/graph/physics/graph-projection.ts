import type { ExperienceViewport } from "../../experience/experience-profile";
import { GRAPH_HEIGHT, GRAPH_WIDTH } from "./graph-geometry";
import type { GraphPoint } from "./types";

export const PORTRAIT_GRAPH_WIDTH = 620;
export const PORTRAIT_GRAPH_HEIGHT = 980;

export interface GraphViewport {
  height: number;
  width: number;
}

export function getGraphViewport(viewport: ExperienceViewport): GraphViewport {
  return viewport === "compact"
    ? { width: PORTRAIT_GRAPH_WIDTH, height: PORTRAIT_GRAPH_HEIGHT }
    : { width: GRAPH_WIDTH, height: GRAPH_HEIGHT };
}

/**
 * Projects the one canonical semantic layout into a portrait frame. The
 * mapping is deterministic and topology-blind: IDs, direction, and relative
 * neighborhoods remain owned by the approved graph.
 */
export function projectGraphPoint(point: GraphPoint, viewport: ExperienceViewport): GraphPoint {
  if (viewport === "wide") return { x: point.x, y: point.y };

  const x = PORTRAIT_GRAPH_WIDTH / 2 + (point.x - GRAPH_WIDTH / 2) * 0.48;
  const y = PORTRAIT_GRAPH_HEIGHT / 2 + (point.y - GRAPH_HEIGHT / 2) * 1.24;
  return {
    x: Number(Math.min(Math.max(x, 54), PORTRAIT_GRAPH_WIDTH - 54).toFixed(4)),
    y: Number(Math.min(Math.max(y, 72), PORTRAIT_GRAPH_HEIGHT - 72).toFixed(4)),
  };
}

export function projectGraphPoints(points: Map<string, GraphPoint>, viewport: ExperienceViewport) {
  return new Map([...points].map(([id, point]) => [id, projectGraphPoint(point, viewport)]));
}
