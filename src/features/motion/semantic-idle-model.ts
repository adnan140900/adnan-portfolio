import type { GraphNode } from "../graph/types";
import type { GraphPoint } from "../graph/physics/types";
import type { MotionPreference } from "../experience/experience-profile";

export const idleSettlingSeconds = 2;

/** Public IDs only; independent channels avoid matching periods and phases. */
function unit(id: string, channel: string) {
  let hash = 2166136261;
  for (const character of `${id}:${channel}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) / 4294967296;
}

export function createIdleParameters(node: Pick<GraphNode, "id" | "kind" | "depth">, anchorId?: string, universeBackground = false) {
  const anchor = node.kind === "person" || node.id === anchorId;
  const amplitude = anchor ? 0.65 : universeBackground ? (node.depth === 2 ? 14 : 17) + unit(node.id, "radius") * 3 : node.kind === "cluster" ? 7 + unit(node.id, "radius") * 3 : 12 + unit(node.id, "radius") * 4;
  return {
    x: amplitude,
    y: amplitude * (0.45 + unit(node.id, "eccentricity") * 0.25),
    period: anchor ? 65 + unit(node.id, "period") * 22 : universeBackground ? (node.depth === 2 ? 20 : 17) + unit(node.id, "period") * 7 : node.kind === "cluster" ? 38 + unit(node.id, "period") * 10 : 20 + unit(node.id, "period") * 10,
    yRatio: anchor ? 1 : anchorId ? 1.08 + unit(node.id, "independent-y") * 0.1 : 1.13 + unit(node.id, "independent-y") * 0.24,
    phase: unit(node.id, "phase") * Math.PI * 2,
    direction: unit(node.id, "direction") > 0.5 ? 1 : -1,
  };
}

export function idlePoint(parameters: ReturnType<typeof createIdleParameters>, seconds: number): GraphPoint {
  const angle = seconds * Math.PI * 2 / parameters.period * parameters.direction;
  return { x: Math.sin(angle + parameters.phase) * parameters.x, y: Math.cos(angle * parameters.yRatio + parameters.phase) * parameters.y };
}

export function idleCanRun(motionPreference: MotionPreference, rendererReady: boolean, visible: boolean, intersecting: boolean, forming: boolean) {
  return motionPreference === "full" && rendererReady && visible && intersecting && !forming;
}

/** Active-time clock: no wall-clock catch-up after backgrounding or a slow frame. */
export function advanceIdleClock(time: number, speed: number, delta: number, held: boolean) {
  const dt = Math.max(0, Math.min(delta, 0.05));
  const nextSpeed = held ? 0 : speed + (1 - speed) * (1 - Math.exp(-dt / 1.5));
  return { time: time + dt * nextSpeed, speed: nextSpeed };
}
