import { gsap } from "gsap";
import type { ExperienceViewport } from "../experience/experience-profile";
import { decodeConfig as C } from "./decode-config";
import { decodeDuration, decodeFrameState, type DecodeMode, type DecodeTier } from "./decode-model";

const jobs = new Set<(now: number) => void>();
const completed = new Set<string>();
const tick = (now: number) => jobs.forEach(job => job(now));
export const hasDecoded = (key: string) => completed.has(key);

interface DecodeOptions {
  duration?: number;
  tier?: DecodeTier;
  viewport?: ExperienceViewport;
}

/** One shared GSAP ticker, at most two foreground resolves, and no React frame updates. */
export function startDecode(element: HTMLElement, text: string, mode: DecodeMode, key: string, options: DecodeOptions = {}) {
  const glyphs = [...element.querySelectorAll<HTMLElement>("[data-decode-glyph]")];
  const cells = glyphs.map(glyph => ({
    glyph,
    character: glyph.querySelector?.<HTMLElement>("[data-decode-character]") ?? null,
    path: glyph.querySelector?.<SVGPathElement>("[data-custom-glyph]") ?? null,
  }));
  const finalChars = Array.from(text);
  const tier = options.tier ?? mode;
  const viewport = options.viewport ?? "wide";
  const duration = options.duration ?? decodeDuration(tier, viewport);
  const activeDuration = Math.max(0.01, duration - C.timing.cursorHold);
  let finished = false;
  let start: number | undefined;
  let lastFrame = -1;

  const finish = () => {
    if (finished) return;
    finished = true;
    jobs.delete(update);
    if (!jobs.size) gsap.ticker.remove(tick);
    cells.forEach((cell, index) => {
      if (cell.character) cell.character.textContent = finalChars[index] ?? "";
      else cell.glyph.textContent = finalChars[index] ?? "";
      if (cell.glyph.dataset) {
        cell.glyph.dataset.symbol = "false";
        cell.glyph.dataset.custom = "false";
      }
    });
    if (!glyphs.length) element.textContent = text;
    element.dataset.decoding = "false";
    element.dataset.decodeComplete = "true";
    element.style.removeProperty("--decode-blur");
    element.style.removeProperty("--decode-opacity");
  };

  const update = (now: number) => {
    start ??= now;
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / activeDuration);
    const frame = Math.floor(elapsed * C.timing.fps);
    if (frame !== lastFrame) {
      lastFrame = frame;
      const state = decodeFrameState(text, progress, mode, frame, { seed: key, tier, viewport });
      if (!glyphs.length) element.textContent = state.text;
      Array.from(state.text).forEach((character, index) => {
        const cell = cells[index];
        if (!cell) return;
        if (!cell.character) { cell.glyph.textContent = character; return; }
        cell.character.textContent = character;
        cell.glyph.dataset.symbol = String(state.unresolvedIndices.has(index));
        const custom = state.customIndices.has(index);
        cell.glyph.dataset.custom = String(custom);
        if (custom && cell.path) {
          const mark = C.customGlyphs[(index + frame) % C.customGlyphs.length];
          cell.path.setAttribute("d", mark.path);
          cell.path.setAttribute("data-custom-glyph", mark.id);
        }
      });
      element.style.setProperty("--decode-blur", `${mode === "editorial" ? (1 - progress) * 0.55 : 0}px`);
      element.style.setProperty("--decode-opacity", String(0.8 + progress * 0.2));
      element.dataset.decodeFrame = String(frame);
    }
    if (elapsed >= duration) finish();
  };

  if (completed.has(key) || jobs.size >= C.policy.maxJobs) { finish(); return finish; }
  completed.add(key);
  element.dataset.decoding = "true";
  element.dataset.decodeComplete = "false";
  update(gsap.ticker.time);
  jobs.add(update);
  if (jobs.size === 1) gsap.ticker.add(tick);
  return finish;
}
