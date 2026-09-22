import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmScene } from "./film-model";
import { activeFilmScene } from "./film-model";
import type { GraphDocument } from "../graph/types";
import { createSemanticStage } from "./semantic-stage-controller";
import { createProjectionStage } from "./semantic-projection-controller";
import type { ExperienceProfile } from "../experience/experience-profile";

/** One owner per film. CSS sticky, no body locks/pin spacers; reverse scroll is the same timeline. */
export function registerFilm(root: HTMLElement, scenes: FilmScene[], profile: ExperienceProfile, graph: GraphDocument) {
  gsap.registerPlugin(ScrollTrigger);
  const panels = [...root.querySelectorAll<HTMLElement>("[data-film-panel]")];
  const progress = [...root.querySelectorAll<HTMLAnchorElement>("[data-film-seek]")];
  const originalTabs = new Map([...root.querySelectorAll<HTMLAnchorElement>("[data-film-panel] a")].map(link => [link, link.getAttribute("tabindex")]));
  const media = gsap.matchMedia();
  const resetTabs = () => originalTabs.forEach((value, link) => value === null ? link.removeAttribute("tabindex") : link.setAttribute("tabindex", value));
  let active = -1;
  const select = (index: number, enhanced = false) => {
    if (index === active) return;
    active = index;
    root.dataset.activeFilmScene = String(index);
    progress.forEach((link, i) => i === index ? link.setAttribute("aria-current", "step") : link.removeAttribute("aria-current"));
    const currentLink = progress[index], list = currentLink?.parentElement?.parentElement;
    if (list && !list.matches(":hover, :focus-within") && root.dataset.filmActive === "true") list.scrollLeft = currentLink.offsetLeft - list.clientWidth / 2 + currentLink.offsetWidth / 2;
    panels.forEach((panel, i) => {
      panel.dataset.filmCurrent = String(i === index);
      if (enhanced) panel.querySelectorAll<HTMLAnchorElement>("a").forEach(link => { link.tabIndex = i === index ? 0 : -1; });
    });
  };
  const activeEnvironment = () => {
    const activeFilm = [...document.querySelectorAll<HTMLElement>("[data-film-active='true']")][0];
    if (activeFilm) document.documentElement.dataset.narrativeActive = "true";
    else delete document.documentElement.dataset.narrativeActive;
  };
  const environmentObserver = new IntersectionObserver(entries => {
    root.dataset.filmActive = String(entries[0]?.isIntersecting ?? false); activeEnvironment();
  }, { rootMargin: "-20% 0px -20%" });
  environmentObserver.observe(root);
  if (profile.motionPreference !== "full") {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) select(panels.indexOf(entry.target as HTMLElement)); }), { rootMargin: "-15% 0px -50%" });
    panels.forEach(panel => observer.observe(panel));
    return () => { observer.disconnect(); environmentObserver.disconnect(); media.revert(); resetTabs(); delete root.dataset.filmActive; activeEnvironment(); };
  }
  media.add("(min-width: 64rem) and (min-height: 50rem) and (pointer: fine)", () => {
    root.dataset.filmEnhanced = "true";
    const semanticSvg = root.querySelector<SVGSVGElement>(".semantic-stage .force-graph-svg");
    const projectionSvg = root.querySelector<SVGSVGElement>(".projection-persistent svg");
    const semantic = semanticSvg ? createSemanticStage(semanticSvg, graph, root.dataset.filmKind ?? "world", "wide")
      : projectionSvg ? createProjectionStage(projectionSvg, graph, scenes, root.dataset.filmKind === "identity", "wide") : null;
    let updates = 0;
    const render = () => {
      semantic?.render();
      root.dataset.filmUpdates = String(++updates);
    };
    gsap.set(panels, { opacity: 0, pointerEvents: "none" });
    gsap.set(panels[0], { opacity: 1, pointerEvents: "auto" });
    const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate() {
      render(); select(activeFilmScene(this.time(), scenes.length), true);
      root.style.setProperty("--film-progress", String(this.progress()));
    } });
    scenes.forEach((scene, index) => {
      semantic?.schedule(timeline, scene, index);
      const title = panels[index].querySelector("[data-film-title]");
      const body = panels[index].querySelector("[data-film-copy]");
      const term = panels[index].querySelector("[data-film-term]");
      if (index) {
        timeline.to(panels[index - 1], { opacity: 0, pointerEvents: "none", duration: 0.3 }, index - 0.3);
        timeline.to(panels[index], { opacity: 1, pointerEvents: "auto", duration: 0.35 }, index - 0.35);
        timeline.fromTo(title, { y: 18, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.5 }, index - 0.3);
        timeline.fromTo(body, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, index - 0.1);
      }
      timeline.fromTo(term, { clipPath: "inset(0 100% 0 0)", x: -120 }, { clipPath: "inset(0 0% 0 0)", x: 0, duration: 0.65 }, index);
      if (index < scenes.length - 1) {
        timeline.to(title, { y: -12, duration: 0.45 }, index + 0.55);
        timeline.to(term, { x: index % 2 ? 220 : -240, y: -90, duration: 0.6 }, index + 0.4);
      }
    });
    timeline.to({}, { duration: 0.01 }, scenes.length);
    const trigger = ScrollTrigger.create({ id: `film:${root.id}`, trigger: root, start: "top 64px", end: "bottom bottom", animation: timeline, scrub: 0.45 });
    root.dataset.filmTriggerCount = "1";
    const seek = (index: number) => window.scrollTo({ top: trigger.start + (index + 0.18) / timeline.duration() * (trigger.end - trigger.start), behavior: "instant" });
    const followHash = () => { const index = panels.findIndex(panel => `#${panel.id}` === window.location.hash); if (index >= 0) seek(index); };
    const hashFrame = requestAnimationFrame(followHash);
    window.addEventListener("hashchange", followHash);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("[data-film-seek]") : null;
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); seek(Number(link.dataset.filmSeek));
    };
    const focus = (event: FocusEvent) => {
      const panel = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-film-panel]") : null;
      if (panel && panels.indexOf(panel) !== active) seek(panels.indexOf(panel));
    };
    const visibility = () => {
      if (document.hidden) { trigger.getTween()?.pause(); trigger.disable(false); }
      else { trigger.enable(false); trigger.update(); trigger.getTween()?.resume(); }
    };
    root.addEventListener("click", click); root.addEventListener("focusin", focus);
    document.addEventListener("visibilitychange", visibility);
    select(0, true); render();
    return () => {
      semantic?.reset();
      cancelAnimationFrame(hashFrame); window.removeEventListener("hashchange", followHash);
      root.removeEventListener("click", click); root.removeEventListener("focusin", focus); document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.filmEnhanced; delete root.dataset.filmActive; root.dataset.filmTriggerCount = "0";
      resetTabs(); activeEnvironment(); root.style.removeProperty("--film-progress"); active = -1;
    };
  });
  media.add("(max-width: 63.999rem), (max-height: 49.999rem), (pointer: coarse)", () => {
    root.dataset.filmEnhanced = "compact";
    const semanticSvg = root.querySelector<SVGSVGElement>(".semantic-stage .force-graph-svg");
    const projectionSvg = root.querySelector<SVGSVGElement>(".projection-persistent svg");
    const semantic = semanticSvg ? createSemanticStage(semanticSvg, graph, root.dataset.filmKind ?? "world", "compact")
      : projectionSvg ? createProjectionStage(projectionSvg, graph, scenes, root.dataset.filmKind === "identity", "compact") : null;
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("[data-film-seek]") : null;
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const index = Number(link.dataset.filmSeek);
      window.scrollTo({ top: window.scrollY + panels[index].getBoundingClientRect().top - 110, behavior: "instant" });
      select(index);
    };
    root.addEventListener("click", click);
    let updates = 0;
    const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate() {
      semantic?.render(); select(activeFilmScene(this.time(), scenes.length));
      root.style.setProperty("--film-progress", String(this.progress()));
      root.dataset.filmUpdates = String(++updates);
    } });
    scenes.forEach((scene, index) => {
      semantic?.schedule(timeline, scene, index);
      timeline.fromTo(panels[index].querySelector("[data-film-term]"), { x: -38, clipPath: "inset(0 80% 0 0)" }, { x: 18, clipPath: "inset(0 0% 0 0)", duration: 0.72 }, index);
      timeline.fromTo(panels[index].querySelector("[data-film-title]"), { y: 10 }, { y: 0, duration: 0.38 }, index);
    });
    timeline.to({}, { duration: 0.01 }, scenes.length);
    const trigger = ScrollTrigger.create({ id: `film:${root.id}`, trigger: root, start: "top 64px", end: "bottom top", animation: timeline, scrub: 0.38 });
    root.dataset.filmTriggerCount = "1";
    const visibility = () => {
      if (document.hidden) { trigger.getTween()?.pause(); trigger.disable(false); }
      else { trigger.enable(false); trigger.update(); trigger.getTween()?.resume(); }
    };
    document.addEventListener("visibilitychange", visibility);
    select(0); semantic?.render();
    return () => {
      semantic?.reset(); root.removeEventListener("click", click); document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.filmEnhanced; root.dataset.filmTriggerCount = "0"; root.style.removeProperty("--film-progress"); active = -1;
    };
  });
  return () => { environmentObserver.disconnect(); media.revert(); resetTabs(); delete root.dataset.filmActive; activeEnvironment(); };
}
