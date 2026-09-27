import { gsap } from "gsap";
import type { ExperienceViewport } from "../experience/experience-profile";
import { decodeConfig as C } from "./decode-config";
import { decodeDuration, decodeFrameState, type DecodeMode, type DecodeTier } from "./decode-model";
import { typewriterFrame } from "./decode-typewriter-model";

const jobs = new Set<(now: number) => void>();
const completed = new Set<string>();
const owners = new WeakMap<HTMLElement, () => void>();
export const decodeJobCount = () => jobs.size;
const reportJobs = () => { if (typeof document !== "undefined") document.documentElement.dataset.decodeJobs = String(jobs.size); };
const tick = (now: number) => jobs.forEach(job => job(now));
export const hasDecoded = (key: string) => completed.has(key);

interface DecodeOptions {
  duration?: number;
  tier?: DecodeTier;
  viewport?: ExperienceViewport;
  replay?: boolean;
  presentation?: "decode" | "typewriter";
}

/** One shared GSAP ticker, at most two foreground resolves, and no React frame updates. */
export function startDecode(element: HTMLElement, text: string, mode: DecodeMode, key: string, options: DecodeOptions = {}) {
  owners.get(element)?.();
  const glyphs = [...element.querySelectorAll<HTMLElement>("[data-decode-glyph]")];
  const cells = glyphs.map(glyph => ({
    glyph,
    container: glyph.parentElement,
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
    owners.delete(element);
    reportJobs();
    if (!jobs.size) gsap.ticker.remove(tick);
    cells.forEach((cell, index) => {
      if (cell.container) { delete cell.container.dataset.typeState; delete cell.container.dataset.typeCaret; }
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
      if (options.presentation === "typewriter") {
        typewriterFrame(text, progress).forEach((value, index) => {
          const cell = cells[index];
          if (!cell) return;
          if (cell.container) { cell.container.dataset.typeState = value.state; cell.container.dataset.typeCaret = String(value.caret); }
          if (cell.character) cell.character.textContent = value.character;
          cell.glyph.dataset.custom = String(value.custom);
          cell.glyph.dataset.symbol = String(value.state === "arriving");
          if (value.custom && cell.path) cell.path.setAttribute("d", C.customGlyphs[value.glyph].path);
        });
      } else {
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
      }
      element.dataset.decodeFrame = String(frame);
    }
    if (elapsed >= duration) finish();
  };

  if ((!options.replay && completed.has(key)) || jobs.size >= C.policy.maxJobs) { finish(); return finish; }
  if (!options.replay) completed.add(key);
  owners.set(element, finish);
  element.dataset.decodeStyle = options.presentation ?? "decode";
  element.dataset.decodeRuns = String(Number(element.dataset.decodeRuns ?? 0) + 1);
  element.dataset.decoding = "true";
  element.dataset.decodeComplete = "false";
  update(gsap.ticker.time);
  jobs.add(update);
  reportJobs();
  if (jobs.size === 1) gsap.ticker.add(tick);
  return finish;
}
