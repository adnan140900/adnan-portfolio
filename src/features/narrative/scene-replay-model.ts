import type { MotionPreference } from "../experience/experience-profile";
import { phase } from "../universe/universe-motion-model";

/** Direction-aware Schmitt boundary: a reversal must cross the dead band. */
export function replaySceneIndex(time: number, current: number, count: number) {
  const proposed = Math.max(0, Math.min(count - 1, Math.floor(time + 0.2)));
  if (current < 0) return proposed;
  if (proposed > current && time < proposed - 0.12) return current;
  if (proposed < current && time > current - 0.28) return current;
  return proposed;
}

/** One lifecycle per film; leaving the film also re-arms single-scene routes. */
export function createSceneLifecycle(count: number) {
  const epochs = Array<number>(count).fill(0);
  let current = -1, token = 0;
  return {
    enter(index: number, motion: MotionPreference) {
      if (index === current) return null;
      current = index;
      return { index, epoch: ++epochs[index], token: ++token, animate: motion === "full" };
    },
    leave() { current = -1; token++; },
    isCurrent(value: number) { return token === value; },
  };
}

export const sceneRevealDuration = 1.65;
export function sceneRevealFrame(seconds: number, edgeOrder = 0) {
  return {
    node: phase(seconds, 0, 0.55),
    label: phase(seconds, 0.55, 0.85),
    edge: phase(seconds, 1 + edgeOrder * 0.3, 1.35 + edgeOrder * 0.3),
    copy: phase(seconds, 0.75, 1.15),
  };
}
