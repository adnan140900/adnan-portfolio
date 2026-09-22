import type { ExperienceProfile, ExperienceViewport } from "../experience/experience-profile";
import { experienceCanAnimate } from "../experience/experience-profile";
import { decodeConfig as C } from "./decode-config";

export type DecodeMode = "system" | "editorial";
export type DecodeTier = DecodeMode | "major";

export interface DecodeFrameOptions {
  seed?: string;
  tier?: DecodeTier;
  viewport?: ExperienceViewport;
}

export interface DecodeFrameState {
  customIndices: ReadonlySet<number>;
  text: string;
  unresolvedIndices: ReadonlySet<number>;
}

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function candidateCount(length: number, tier: DecodeTier) {
  if (!length) return 0;
  if (tier === "system") return Math.min(length, Math.max(1, Math.round(length * 0.7)));
  if (tier === "major") return Math.min(length, clamp(Math.round(length * 0.68), 8, 14));
  return Math.min(length, clamp(Math.round(length * 0.48), 4, 8));
}

function remainingCount(selected: number, progress: number) {
  if (!selected || progress >= C.policy.finalAt) return 0;
  if (progress < C.policy.acquireUntil) return selected;
  if (progress < C.policy.reconstructionUntil) {
    const phase = (progress - C.policy.acquireUntil) / (C.policy.reconstructionUntil - C.policy.acquireUntil);
    return Math.ceil(selected * (1 - phase * 0.65));
  }
  if (progress < C.policy.semanticLockUntil) {
    const phase = (progress - C.policy.reconstructionUntil) / (C.policy.semanticLockUntil - C.policy.reconstructionUntil);
    return Math.ceil(selected * (0.35 - phase * 0.17));
  }
  if (progress < C.policy.tailAt) {
    const phase = (progress - C.policy.semanticLockUntil) / (C.policy.tailAt - C.policy.semanticLockUntil);
    return Math.ceil(selected * 0.18 * (1 - phase) + Math.min(2, selected) * phase);
  }
  const phase = (progress - C.policy.tailAt) / (C.policy.finalAt - C.policy.tailAt);
  return Math.max(0, Math.ceil(Math.min(2, selected) * (1 - phase)));
}

/** Deterministic semantic reconstruction. Whitespace and punctuation never enter the candidate set. */
export function decodeFrameState(text: string, progress: number, mode: DecodeMode, frame = 0, options: DecodeFrameOptions = {}): DecodeFrameState {
  const normalizedProgress = clamp(progress, 0, 1);
  if (normalizedProgress >= C.policy.finalAt || !text) return { text, unresolvedIndices: new Set(), customIndices: new Set() };

  const chars = Array.from(text);
  const tier = options.tier ?? mode;
  const seed = options.seed ?? text;
  const candidates = chars
    .flatMap((character, index) => /[\p{L}\p{N}]/u.test(character) ? [index] : [])
    .sort((left, right) => hash(`${seed}:${tier}:${left}:candidate`) - hash(`${seed}:${tier}:${right}:candidate`));
  const selected = candidates.slice(0, candidateCount(candidates.length, tier));
  const unresolved = new Set(selected.slice(0, remainingCount(selected.length, normalizedProgress)));
  const customLimit = options.viewport === "compact" ? C.policy.customCompact : C.policy.customWide;
  const modeLimit = mode === "editorial" ? Math.min(2, customLimit) : customLimit;
  const custom = new Set([...unresolved]
    .sort((left, right) => hash(`${seed}:${left}:custom`) - hash(`${seed}:${right}:custom`))
    .slice(0, modeLimit));
  const glyphs = mode === "system" ? C.systemPool : C.editorialPool;
  const reconstructed = chars.map((character, index) => {
    if (!unresolved.has(index)) return character;
    const cellSeed = hash(`${seed}:${tier}:${index}:sequence`);
    const cadence = 2 + cellSeed % 3;
    const substitution = Math.min(C.policy.substitutions - 1, Math.floor(Math.max(0, frame) / cadence));
    return glyphs[(cellSeed + substitution) % glyphs.length];
  }).join("");

  return { text: reconstructed, unresolvedIndices: unresolved, customIndices: custom };
}

export function decodeFrame(text: string, progress: number, mode: DecodeMode, frame = 0, options: DecodeFrameOptions = {}) {
  return decodeFrameState(text, progress, mode, frame, options).text;
}

export function decodeDuration(tier: DecodeTier, viewport: ExperienceViewport = "wide") {
  const duration = C.timing[tier];
  return viewport === "compact" ? duration * C.timing.compactFactor : duration;
}

export function decodeAllowed(profile: Pick<ExperienceProfile, "motionPreference" | "visibility">, played: boolean) {
  return experienceCanAnimate(profile) && !played;
}

/** Source → growing trace → exact relation → target. Input is an approved edge. */
export function relationshipFrame(relation: { source: string; relation: string; target: string }, progress: number, frame = 0) {
  const source = decodeFrame(relation.source, Math.min(1, progress / 0.25), "system", frame);
  if (progress < 0.25) return source;
  const line = "─".repeat(Math.min(4, Math.floor((progress - 0.25) / 0.15 * 4)));
  if (progress < 0.4) return `${source} ${line}`;
  const label = decodeFrame(relation.relation, Math.min(1, (progress - 0.4) / 0.25), "system", frame);
  if (progress < 0.65) return `${source} ── ${label}`;
  return `${source} ── ${label} → ${decodeFrame(relation.target, Math.min(1, (progress - 0.65) / 0.35), "system", frame)}`;
}
