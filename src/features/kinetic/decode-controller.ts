import { gsap } from "gsap";
import { decodeFrame, type DecodeMode } from "./decode-model";
import { decodeConfig as C } from "./decode-config";

const jobs = new Set<(now: number) => void>();
const completed = new Set<string>();
const tick = (now: number) => jobs.forEach(job => job(now));
export const hasDecoded = (key: string) => completed.has(key);

/** A shared GSAP ticker, at most TWO foreground resolves, 12 glyph writes/sec.
 * Final-width character cells prevent layout shift. No React frame updates. */
export function startDecode(element: HTMLElement, text: string, mode: DecodeMode, key: string, duration: number = C.timing[mode]) {
  const glyphs = [...element.querySelectorAll<HTMLElement>("[data-decode-glyph]")];
  const cells = glyphs.map(glyph => ({ glyph, character: glyph.querySelector?.("[data-decode-character]"), path: glyph.querySelector?.("[data-custom-glyph]") }));
  const finalChars = Array.from(text);
  const finish = () => {
    jobs.delete(update);
    if (!jobs.size) gsap.ticker.remove(tick);
    element.dataset.decoding = "false";
    element.dataset.decodeComplete = "true";
    element.style.removeProperty("--decode-blur");
    element.style.removeProperty("--decode-opacity");
    if (!glyphs.length) element.textContent = text;
  };
  let start: number | undefined, lastFrame = -1;
  const update = (now: number) => {
    start ??= now;
    const progress = Math.min(1, (now - start) / duration);
    const frame = Math.floor((now - start) * C.timing.fps);
    if (frame !== lastFrame) {
      lastFrame = frame;
      const resolved = decodeFrame(text, progress, mode, frame);
      if (!glyphs.length) element.textContent = resolved;
      Array.from(resolved).forEach((char, index) => {
        const cell = cells[index];
        if (!cell) return;
        if (!cell.character) { cell.glyph.textContent = char; return; }
        cell.character.textContent = char;
        cell.glyph.dataset.symbol = String(char !== finalChars[index]);
        const custom = mode === "system" && char !== finalChars[index] && index % 3 === 1;
        cell.glyph.dataset.custom = String(custom);
        if (custom && cell.path) {
          const mark = C.customGlyphs[(index + Math.floor(progress * C.policy.glyphStages)) % C.customGlyphs.length];
          cell.path.setAttribute("d", mark.path); cell.path.setAttribute("data-custom-glyph", mark.id);
        }
      });
      element.style.setProperty("--decode-blur", `${mode === "editorial" ? (1 - progress) * 0.7 : 0}px`);
      element.style.setProperty("--decode-opacity", String(0.78 + progress * 0.22));
      element.dataset.decodeFrame = String(frame);
    }
    if (now - start >= duration + C.timing.cursorHold) finish();
  };
  if (completed.has(key)) { finish(); return finish; }
  completed.add(key);
  if (jobs.size >= C.policy.maxJobs) { finish(); return finish; }
  element.dataset.decoding = "true";
  element.dataset.decodeComplete = "false";
  update(gsap.ticker.time);
  jobs.add(update);
  if (jobs.size === 1) gsap.ticker.add(tick);
  return finish;
}
