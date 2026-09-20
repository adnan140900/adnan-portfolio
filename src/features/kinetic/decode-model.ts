import { decodeConfig as C } from "./decode-config";
export type DecodeMode = "system" | "editorial";

/** Reproducible glyphs, never generated prose. Whitespace/punctuation stay intact. */
export function decodeFrame(text: string, progress: number, mode: DecodeMode, _frame = 0) {
  // Retain the shared ambient-clock API; frame number no longer changes glyphs.
  void _frame;
  if (progress >= C.policy.finalAt) return text;
  const chars = Array.from(text);
  const glyphs = mode === "system" ? C.systemPool : C.editorialPool;
  const candidates = chars.flatMap((char, index) => /[\p{L}\p{N}]/u.test(char) && (mode === "system" || index % C.policy.editorialStride === 1) ? [index] : []);
  const eligible = mode === "editorial" && candidates.length > C.policy.editorialMax
    ? Array.from({ length: C.policy.editorialMax }, (_, index) => candidates[Math.floor(index * candidates.length / C.policy.editorialMax)]) : candidates;
  const stage = progress < C.policy.symbolicUntil ? 0 : progress < C.policy.mostlyResolvedAt ? 1 : progress < C.policy.tailAt ? 2 : 3;
  const remaining = stage === 0 ? eligible.length : stage === 1 ? Math.ceil(eligible.length * 0.45) : stage === 2 ? Math.min(3, Math.ceil(eligible.length * 0.2)) : Math.min(1, eligible.length);
  const unresolved = new Set(eligible.slice(-remaining));
  return chars.map((char, index) => {
    if (!unresolved.has(index)) return char;
    return glyphs[(index * 7 + Math.min(stage, C.policy.glyphStages - 1)) % glyphs.length];
  }).join("");
}

export function decodeAllowed(reduced: boolean, compact: boolean, hidden: boolean, played: boolean) {
  return !reduced && !compact && !hidden && !played;
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
