"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useExperienceProfile } from "../experience/experience-profile-provider";
import type { GraphDocument } from "../graph/types";
import { createKnowledgeVocabulary, publicPreview, worldPersonality } from "./kinetic-model";
import { decodeFrame, relationshipFrame } from "./decode-model";

const pool = Array.from({ length: 11 }, (_, index) => index);

/** One persistent, bounded public-vocabulary field. No frame-driven React state. */
export function KnowledgeField({ graph }: { graph: GraphDocument }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const profile = useExperienceProfile();
  const vocabulary = useMemo(() => createKnowledgeVocabulary(graph, pathname), [graph, pathname]);
  const personality = worldPersonality(pathname);

  useEffect(() => {
    const element = root.current;
    if (!element || profile.motionPreference === "unresolved") return;
    let dispose = () => {};
    const configure = () => {
      dispose();
      const spans = [...element.querySelectorAll<HTMLElement>("[data-field-slot]")];
      const quiet = profile.motionPreference !== "full" || profile.visibility === "hidden";
      element.dataset.mode = profile.motionPreference === "reduced" ? "reduced" : profile.viewport === "compact" ? "compact" : "living";
      let frame = 0, last = 0, seconds = 0, paint = 0;
      let pointerId = "", focusId = "", currentId = "";
      const heading = document.querySelector("h1");
      const pageTitle = (heading?.querySelector(".sr-only") ?? heading)?.textContent?.trim();
      const labels = vocabulary.labels.filter(label => label !== pageTitle);
      const controls = [...document.querySelectorAll<HTMLElement>("[data-control-node]")];
      const edges = [...document.querySelectorAll<SVGPathElement>("[data-force-edge]")];
      const resetReaction = () => {
        controls.forEach(control => { delete control.dataset.kineticRelated; });
        edges.forEach(edge => { delete edge.dataset.kineticRelated; });
      };
      const preview = () => {
        const id = focusId || pointerId;
        if (id === currentId) return;
        currentId = id;
        resetReaction();
        const labels = publicPreview(graph, id);
        spans.slice(8).forEach((span, index) => { span.textContent = labels[index] ?? ""; span.style.opacity = id ? "0.05" : "0"; });
        if (!id) return;
        const related = new Set([id]);
        graph.edges.forEach(edge => { if (edge.source === id || edge.target === id) { related.add(edge.source); related.add(edge.target); } });
        controls.forEach(control => { control.dataset.kineticRelated = String(related.has(control.dataset.controlNode ?? "")); });
        edges.forEach(edge => { edge.dataset.kineticRelated = String(edge.dataset.source === id || edge.dataset.target === id); });
      };
      const concept = (target: EventTarget | null) => target instanceof Element
        ? target.closest<HTMLElement>("[data-control-node], [data-story-node]")?.dataset : undefined;
      const pointer = (event: PointerEvent) => { const value = concept(event.target); pointerId = value?.controlNode ?? value?.storyNode ?? ""; preview(); };
      const focus = (event: FocusEvent) => { const value = concept(event.type === "focusout" ? event.relatedTarget : event.target); focusId = value?.controlNode ?? value?.storyNode ?? ""; preview(); };
      const leave = () => { pointerId = ""; preview(); };
      const update = () => {
        const used = new Set<string>();
        const count = pathname === "/about" ? 3 : Math.min(8, Math.max(0, labels.length - 1));
        spans.slice(0, 8).forEach((span, index) => {
          if (index >= count) { span.textContent = ""; span.style.opacity = "0"; return; }
          const lifetime = personality.lifetime + index * 1.7;
          const age = seconds + index * 3.8;
          const cycle = Math.floor(age / lifetime);
          const progress = age % lifetime / lifetime;
          const relation = index === 2 && pathname !== "/about" && vocabulary.relations.length && cycle % 2 === 0
            ? vocabulary.relations[(index + cycle) % vocabulary.relations.length] : undefined;
          let term = relation?.text ?? labels[(index * 5 + cycle * 3) % labels.length] ?? "";
          if (used.has(term)) term = labels.find(label => !used.has(label)) ?? "";
          used.add(term);
          const resolving = Math.min(1, progress / (relation ? 0.22 : 0.1));
          const typed = relation && term === relation.text
            ? relationshipFrame(relation, resolving, Math.floor(seconds * 24))
            : decodeFrame(term, resolving, index === 0 ? "editorial" : "system", Math.floor(seconds * 24));
          if (span.textContent !== typed) span.textContent = typed;
          const envelope = Math.min(1, progress / 0.16, (1 - progress) / 0.25);
          span.style.opacity = String(Math.max(0, envelope) * (index === 0 ? 0.028 : pathname === "/about" ? 0.026 : 0.055));
          span.style.transform = `translate3d(${progress * personality.drift * (index % 2 ? -1 : 1)}px, ${Math.sin(progress * Math.PI) * 10}px, 0)`;
          span.dataset.relationship = String(!!relation);
        });
        element.dataset.fieldSeconds = seconds.toFixed(1);
      };
      const tick = (now: number) => {
        seconds += last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        if (now - paint >= 1000 / (profile.performance === "constrained" ? 12 : 24)) { paint = now; update(); }
        frame = requestAnimationFrame(tick);
      };
      const visibility = () => {
        cancelAnimationFrame(frame); last = 0;
        const running = !document.hidden && !quiet && document.documentElement.dataset.narrativeActive !== "true";
        document.documentElement.dataset.kineticRunning = String(running);
        element.dataset.running = String(running);
        if (running) frame = requestAnimationFrame(tick);
      };
      if (quiet) {
        spans.forEach((span, index) => { span.textContent = index < 3 ? labels[index] ?? "" : ""; span.style.opacity = index < 3 ? "0.025" : "0"; span.style.transform = "none"; });
      } else {
        update();
        document.addEventListener("pointerover", pointer);
        document.addEventListener("focusin", focus);
        document.addEventListener("focusout", focus);
        document.documentElement.addEventListener("pointerleave", leave);
      }
      document.addEventListener("visibilitychange", visibility);
      const narrativeObserver = new MutationObserver(visibility);
      narrativeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-narrative-active"] });
      visibility();
      dispose = () => {
        cancelAnimationFrame(frame); narrativeObserver.disconnect(); resetReaction();
        document.removeEventListener("visibilitychange", visibility);
        document.removeEventListener("pointerover", pointer); document.removeEventListener("focusin", focus); document.removeEventListener("focusout", focus);
        document.documentElement.removeEventListener("pointerleave", leave);
        spans.forEach(span => { span.textContent = ""; span.style.removeProperty("opacity"); span.style.removeProperty("transform"); });
        delete document.documentElement.dataset.kineticRunning;
      };
    };
    configure();
    return () => { dispose(); };
  }, [graph, pathname, profile, vocabulary, personality.lifetime, personality.drift]);

  return <div ref={root} className="knowledge-field" aria-hidden="true" data-personality={personality.name} data-field-route={pathname}>
    {pool.map(index => <span key={index} data-field-slot={index} className={index >= 8 ? "field-preview" : index === 0 ? "field-ghost" : "field-annotation"}
      style={{ left: `${index >= 8 ? 13 + (index - 8) * 24 : (index * 37 + 7) % 88}%`, top: `${index >= 8 ? 38 + (index - 8) * 17 : (index * 23 + 17) % 84}%` }} />)}
  </div>;
}
