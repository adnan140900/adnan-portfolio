"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { decodeAllowed, type DecodeMode } from "./decode-model";
import { hasDecoded, startDecode } from "./decode-controller";
import { decodeConfig } from "./decode-config";
import { DecodeGlyph } from "./decode-glyph";
import { useExperienceProfile } from "../experience/experience-profile-provider";

/** Static SSR and accessible final text; only the hidden visual duplicate mutates. */
export function DecodeText({ text, mode = "editorial", replayKey, signal = false, decorative = false }: {
  text: string; mode?: DecodeMode; replayKey: string; signal?: boolean; decorative?: boolean;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const path = usePathname();
  const profile = useExperienceProfile();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const panel = element.closest<HTMLElement>("[data-film-panel]");
    const film = panel?.closest<HTMLElement>(".narrative-film");
    const key = `${path}:${replayKey}`;
    let visible = false, started = false, cancel = () => {};
    const settle = () => { cancel(); element.dataset.decodeComplete = "true"; };
    const attempt = () => {
      if (profile.motionPreference === "unresolved") return;
      if (profile.motionPreference === "reduced" || profile.visibility === "hidden") { settle(); return; }
      const firstPanel = panel === film?.querySelector("[data-film-panel]");
      const panelReady = !panel || panel.dataset.filmCurrent === "true" || (firstPanel && film?.dataset.filmReduced === "false" && !film.dataset.filmEnhanced);
      if (started || !visible || !panelReady) return;
      if (!decodeAllowed(profile, hasDecoded(key))) { settle(); return; }
      started = true;
      const tier = signal || replayKey === "home-headline" ? "major" : mode;
      cancel = startDecode(element, text, mode, key, { tier, viewport: profile.viewport });
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
    attempt();
    return () => {
      settle(); intersection.disconnect(); mutation.disconnect();
    };
  }, [text, mode, replayKey, path, signal, profile]);
  let index = 0;
  return <span ref={root} className={`decode-text decode-${mode}${signal ? " decode-signal" : ""}`} data-decoding="false" aria-hidden={decorative || signal ? true : undefined}>
    {!decorative && !signal && <span className="sr-only">{text}</span>}
    <span className="decode-visual" aria-hidden="true">{signal && <span className="decode-initial-mark"><DecodeGlyph /></span>}{(text.match(/\S+|\s+/g) ?? []).map((word, wordIndex) =>
      <span className={/\S/.test(word) ? "decode-word" : undefined} key={wordIndex}>{Array.from(word).map(char =>
        <span className="decode-cell" key={index++}><span className="decode-final">{char}</span><span data-decode-glyph><span data-decode-character>{char}</span>{/[\p{L}\p{N}]/u.test(char) && <DecodeGlyph index={index} />}</span></span>
      )}</span>
    )}<span className="decode-cursor"><DecodeGlyph index={decodeConfig.customGlyphs.findIndex(mark => mark.id === decodeConfig.cursor)} /></span></span>
  </span>;
}
