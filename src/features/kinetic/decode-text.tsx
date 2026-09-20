"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { decodeAllowed, type DecodeMode } from "./decode-model";
import { hasDecoded, startDecode } from "./decode-controller";
import { decodeConfig } from "./decode-config";
import { DecodeGlyph } from "./decode-glyph";

/** Static SSR and accessible final text; only the hidden visual duplicate mutates. */
export function DecodeText({ text, mode = "editorial", replayKey, signal = false, decorative = false }: {
  text: string; mode?: DecodeMode; replayKey: string; signal?: boolean; decorative?: boolean;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const path = usePathname();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 63.999rem), (pointer: coarse)");
    const panel = element.closest<HTMLElement>("[data-film-panel]");
    const film = panel?.closest<HTMLElement>(".narrative-film");
    const key = `${path}:${replayKey}`;
    let visible = false, started = false, cancel = () => {};
    const settle = () => { cancel(); element.dataset.decodeComplete = "true"; };
    const attempt = () => {
      if (reduced.matches || compact.matches || document.hidden) { settle(); return; }
      const firstPanel = panel === film?.querySelector("[data-film-panel]");
      const panelReady = !panel || panel.dataset.filmCurrent === "true" || (firstPanel && film?.dataset.filmReduced === "false" && !film.dataset.filmEnhanced);
      if (started || !visible || !panelReady) return;
      if (!decodeAllowed(reduced.matches, compact.matches, document.hidden, hasDecoded(key))) { settle(); return; }
      started = true;
      cancel = startDecode(element, text, mode, key, signal || replayKey === "home-headline" ? decodeConfig.timing.major : decodeConfig.timing[mode]);
    };
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (!visible && started) settle(); else attempt();
    });
    intersection.observe(element);
    const mutation = new MutationObserver(() => {
      if (panel?.dataset.filmCurrent === "false" && started) settle(); else attempt();
    });
    if (panel) mutation.observe(panel, { attributes: true, attributeFilter: ["data-film-current"] });
    if (film) mutation.observe(film, { attributes: true, attributeFilter: ["data-film-reduced", "data-film-enhanced"] });
    reduced.addEventListener("change", attempt); compact.addEventListener("change", attempt);
    document.addEventListener("visibilitychange", attempt);
    attempt();
    return () => {
      settle(); intersection.disconnect(); mutation.disconnect();
      reduced.removeEventListener("change", attempt); compact.removeEventListener("change", attempt);
      document.removeEventListener("visibilitychange", attempt);
    };
  }, [text, mode, replayKey, path, signal]);
  let index = 0;
  return <span ref={root} className={`decode-text decode-${mode}${signal ? " decode-signal" : ""}`} data-decoding="false" aria-hidden={decorative || signal ? true : undefined}>
    {!decorative && !signal && <span className="sr-only">{text}</span>}
    <span className="decode-visual" aria-hidden="true">{signal && <span className="decode-initial-mark"><DecodeGlyph /></span>}{(text.match(/\S+|\s+/g) ?? []).map((word, wordIndex) =>
      <span className={/\S/.test(word) ? "decode-word" : undefined} key={wordIndex}>{Array.from(word).map(char =>
        <span className="decode-cell" key={index++}><span className="decode-final">{char}</span><span data-decode-glyph><span data-decode-character>{char}</span>{mode === "system" && /[\p{L}\p{N}]/u.test(char) && <DecodeGlyph index={index} />}</span></span>
      )}</span>
    )}<span className="decode-cursor"><DecodeGlyph index={decodeConfig.customGlyphs.findIndex(mark => mark.id === decodeConfig.cursor)} /></span></span>
  </span>;
}
