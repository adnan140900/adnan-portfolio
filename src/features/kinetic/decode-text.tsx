"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { decodeAllowed, type DecodeMode } from "./decode-model";
import { hasDecoded, startDecode } from "./decode-controller";
import { decodeConfig } from "./decode-config";
import { DecodeGlyph } from "./decode-glyph";
import { useExperienceProfile } from "../experience/experience-profile-provider";

/** Static SSR and accessible final text; only the hidden visual duplicate mutates. */
export function DecodeText({ text, mode = "editorial", replayKey, signal = false, decorative = false, presentation = "decode", replay = "once", heroStage }: {
  text: string; mode?: DecodeMode; replayKey: string; signal?: boolean; decorative?: boolean;
  presentation?: "decode" | "typewriter"; replay?: "once" | "scene"; heroStage?: number;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const path = usePathname();
  const profile = useExperienceProfile();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const panel = element.closest<HTMLElement>("[data-film-panel], [data-film-intro]");
    // Film-owned text uses the shared activation epoch, not a per-piece observer.
    if (panel && replay === "scene") return;
    const film = panel?.closest<HTMLElement>(".narrative-film");
    const key = `${path}:${replayKey}`;
    let visible = false, started = false, cancel = () => {};
    const settle = () => { cancel(); element.dataset.decodeComplete = "true"; };
    const hero = heroStage ? element.closest<HTMLElement>(".discovery-hero") : null;
    if (hero && heroStage) {
      let cycle = "";
      const synchronize = () => {
        if (profile.motionPreference !== "full" || document.hidden) { settle(); return; }
        const stage = Number(hero.dataset.heroStage);
        const nextCycle = hero.dataset.heroCycle ?? "0";
        if (stage < heroStage) { settle(); return; }
        if (cycle === nextCycle) return;
        cycle = nextCycle;
        cancel = startDecode(element, text, mode, key, { replay: true, presentation, duration: presentation === "typewriter" ? 2.3 : 0.5, viewport: profile.viewport });
      };
      const observer = new MutationObserver(synchronize);
      observer.observe(hero, { attributes: true, attributeFilter: ["data-hero-stage", "data-hero-cycle"] });
      document.addEventListener("visibilitychange", synchronize);
      synchronize();
      return () => { settle(); observer.disconnect(); document.removeEventListener("visibilitychange", synchronize); };
    }
    const attempt = () => {
      if (profile.motionPreference === "unresolved") return;
      if (profile.motionPreference === "reduced" || document.hidden) { settle(); return; }
      if (replay === "scene" && (panel?.dataset.filmReveal === "left" || film?.dataset.filmActive === "false")) return;
      const firstPanel = panel === film?.querySelector("[data-film-panel]");
      const panelReady = !panel || panel.dataset.filmCurrent === "true" || (firstPanel && film?.dataset.filmReduced === "false" && !film.dataset.filmEnhanced);
      if (started || !visible || !panelReady) return;
      if (!decodeAllowed({ motionPreference: profile.motionPreference, visibility: document.hidden ? "hidden" : "visible" }, replay === "once" && hasDecoded(key))) { settle(); return; }
      started = true;
      const tier = signal || replayKey === "home-headline" ? "major" : mode;
      cancel = startDecode(element, text, mode, key, { tier, viewport: profile.viewport, replay: replay === "scene", presentation });
    };
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (!visible && started) settle(); else attempt();
    });
    intersection.observe(element);
    const mutation = new MutationObserver(() => {
      if (replay === "scene" && (panel?.dataset.filmReveal === "left" || film?.dataset.filmActive === "false")) { settle(); started = false; return; }
      if (panel?.dataset.filmCurrent === "false" && started) settle(); else attempt();
    });
    if (panel) mutation.observe(panel, { attributes: true, attributeFilter: ["data-film-current", "data-film-reveal"] });
    if (film) mutation.observe(film, { attributes: true, attributeFilter: ["data-film-reduced", "data-film-enhanced", "data-film-active"] });
    document.addEventListener("visibilitychange", attempt);
    attempt();
    return () => {
      settle(); intersection.disconnect(); mutation.disconnect();
      document.removeEventListener("visibilitychange", attempt);
    };
  }, [text, mode, replayKey, path, signal, profile.motionPreference, profile.viewport, presentation, replay, heroStage]);
  let index = 0;
  return <span ref={root} className={`decode-text decode-${mode}${signal ? " decode-signal" : ""}`} data-scene-decode={replay === "scene" ? text : undefined} data-decode-mode={mode} data-decoding="false" aria-hidden={decorative || signal ? true : undefined}>
    {!decorative && !signal && <span className="sr-only">{text}</span>}
    <span className="decode-visual" aria-hidden="true">{signal && <span className="decode-initial-mark"><DecodeGlyph /></span>}{(text.match(/\S+|\s+/g) ?? []).map((word, wordIndex) =>
      <span className={/\S/.test(word) ? "decode-word" : undefined} key={wordIndex}>{Array.from(word).map(char =>
        <span className="decode-cell" key={index++}><span className="decode-final">{char}</span><span data-decode-glyph><span data-decode-character>{char}</span>{/[\p{L}\p{N}]/u.test(char) && <DecodeGlyph index={index} />}</span></span>
      )}</span>
    )}<span className="decode-cursor"><DecodeGlyph index={decodeConfig.customGlyphs.findIndex(mark => mark.id === decodeConfig.cursor)} /></span></span>
  </span>;
}
