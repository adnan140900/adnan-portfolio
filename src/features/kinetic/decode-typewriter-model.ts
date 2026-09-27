import { decodeConfig } from "./decode-config";

/** Keep short approved headlines concise while retaining the established cap for longer copy. */
export function typewriterDuration(text: string) {
  return Math.min(2.3, Math.max(1.3, Array.from(text).length / 25));
}

/** A moving acquisition window. Everything behind it is permanently locked. */
export function typewriterFrame(text: string, progress: number) {
  const chars = Array.from(text);
  const head = Math.max(0, Math.min(1, progress)) * (chars.length + 2);
  return chars.map((character, index) => {
    const age = head - index;
    const state = progress >= 1 || age >= 2 ? "locked" : age < 0 ? "hidden" : "arriving";
    const substitution = Math.min(2, Math.floor(Math.max(0, age) * 1.5));
    return {
      state,
      character: state === "arriving" && /[\p{L}\p{N}]/u.test(character)
        ? decodeConfig.editorialPool[(index + substitution) % decodeConfig.editorialPool.length] : character,
      custom: state === "arriving" && /[\p{L}\p{N}]/u.test(character) && index % 3 === 0,
      glyph: (index + substitution) % decodeConfig.customGlyphs.length,
      caret: index === Math.min(chars.length - 1, Math.floor(head)),
    } as const;
  });
}

/** Only a meaningful departure arms the next reveal; small reversals do nothing. */
export function heroReplayStep(armed: boolean, progress: number) {
  if (progress >= 0.92) return { armed: true, replay: false };
  if (armed && progress <= 0.18) return { armed: false, replay: true };
  return { armed, replay: false };
}
