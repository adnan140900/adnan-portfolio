"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { createRevealSchedule } from "./kinetic-model";

const completedEntrances = new Set<string>();

/** Full accessible string stays unchanged. GSAP writes only decorative token visibility. */
export function KineticText({ text, mode = "character", caret = true, replay = "once", replayKey = text, duration = 2.25 }: {
  text: string; mode?: "character" | "word"; caret?: boolean; replay?: "once" | "always";
  replayKey?: string; duration?: number;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const schedule = createRevealSchedule(text, mode, duration);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 47.999rem), (pointer: coarse)");
    const tokens = [...element.querySelectorAll<HTMLElement>("[data-reveal-token]")];
    let timeline: gsap.core.Timeline | undefined;
    const complete = () => {
      timeline?.kill();
      tokens.forEach(token => { token.style.visibility = "visible"; delete token.dataset.caret; });
      element.dataset.typing = "false";
    };
    if (!preference.matches && !compact.matches && !document.hidden && !(replay === "once" && completedEntrances.has(replayKey))) {
      completedEntrances.add(replayKey);
      element.dataset.typing = "true";
      gsap.set(tokens, { visibility: "hidden" });
      timeline = gsap.timeline({ onComplete: complete });
      createRevealSchedule(text, mode, duration).forEach((entry, index) => {
        timeline!.set(tokens[index], { visibility: "visible" }, entry.at);
        if (caret) timeline!.call(() => {
          if (index > 0) delete tokens[index - 1].dataset.caret;
          tokens[index].dataset.caret = "true";
        }, [], entry.at);
      });
      timeline.call(complete, [], duration);
    }
    const cancel = () => { if (preference.matches || compact.matches || document.hidden) complete(); };
    preference.addEventListener("change", cancel);
    compact.addEventListener("change", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => { complete(); preference.removeEventListener("change", cancel); compact.removeEventListener("change", cancel); document.removeEventListener("visibilitychange", cancel); };
  }, [caret, duration, mode, replay, replayKey, text]);
  // Word wrappers preserve natural line wrapping while individual characters resolve.
  let tokenIndex = 0;
  return <span ref={root} className="kinetic-text" data-typing="false">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{mode === "word" ? schedule.map((item, i) => <span data-reveal-token key={i}>{item.token}</span>) : (text.match(/\S+|\s+/g) ?? []).map((word, i) =>
      <span className={/\S/.test(word) ? "kinetic-word" : undefined} key={i}>{Array.from(word).map(char => <span data-reveal-token key={tokenIndex++}>{char}</span>)}</span>
    )}</span>
  </span>;
}
