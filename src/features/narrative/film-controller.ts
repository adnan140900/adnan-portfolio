import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmScene } from "./film-model";
import { activeFilmScene } from "./film-model";
import type { GraphDocument } from "../graph/types";
import { createSemanticStage } from "./semantic-stage-controller";
import { createProjectionStage } from "./semantic-projection-controller";

/** One owner per film. CSS sticky, no body locks/pin spacers; reverse scroll is the same timeline. */
export function registerFilm(root: HTMLElement, scenes: FilmScene[], reduced: boolean, graph: GraphDocument) {
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
  if (reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) select(panels.indexOf(entry.target as HTMLElement)); }), { rootMargin: "-15% 0px -50%" });
    panels.forEach(panel => observer.observe(panel));
    return () => { observer.disconnect(); environmentObserver.disconnect(); media.revert(); resetTabs(); delete root.dataset.filmActive; activeEnvironment(); };
  }
  media.add("(min-width: 64rem) and (min-height: 50rem) and (pointer: fine)", () => {
    root.dataset.filmEnhanced = "true";
    const semanticSvg = root.querySelector<SVGSVGElement>(".semantic-stage .force-graph-svg");
    const projectionSvg = root.querySelector<SVGSVGElement>(".projection-desktop svg");
    const semantic = semanticSvg ? createSemanticStage(semanticSvg, graph, root.dataset.filmKind ?? "world")
      : projectionSvg ? createProjectionStage(projectionSvg, graph, scenes, root.dataset.filmKind === "identity") : null;
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
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("[data-film-seek]") : null;
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const index = Number(link.dataset.filmSeek);
      window.scrollTo({ top: window.scrollY + panels[index].getBoundingClientRect().top - 110, behavior: "instant" });
      select(index);
    };
    root.addEventListener("click", click);
    panels.forEach((panel, index) => {
      const timeline = gsap.timeline({ scrollTrigger: { id: `film:${root.id}:${index}`, trigger: panel, start: "top 55%", end: "bottom 20%", scrub: 0.35,
        onEnter: () => select(index), onEnterBack: () => select(index),
      } });
      timeline.fromTo(panel.querySelector("[data-film-term]"), { x: -65, clipPath: "inset(0 80% 0 0)" }, { x: 40, clipPath: "inset(0 0% 0 0)", duration: 1 }, 0);
      const mobileGeometry = panel.querySelector(".film-mobile-geometry");
      if (mobileGeometry) timeline.fromTo(mobileGeometry, { x: index % 2 ? -45 : 45, scale: 0.86 }, { x: index % 2 ? 30 : -30, scale: 1.08, duration: 1 }, 0);
      timeline.fromTo(panel.querySelector("[data-film-title]"), { y: 12 }, { y: 0, duration: 0.45 }, 0);
    });
    root.dataset.filmTriggerCount = String(panels.length);
    const visibility = () => ScrollTrigger.getAll().filter(trigger => String(trigger.vars.id).startsWith(`film:${root.id}:`)).forEach(trigger => {
      if (document.hidden) { trigger.getTween()?.pause(); trigger.disable(false); }
      else { trigger.enable(false); trigger.update(); trigger.getTween()?.resume(); }
    });
    document.addEventListener("visibilitychange", visibility);
    return () => { root.removeEventListener("click", click); document.removeEventListener("visibilitychange", visibility); root.dataset.filmTriggerCount = "0"; active = -1; };
  });
  return () => { environmentObserver.disconnect(); media.revert(); resetTabs(); delete root.dataset.filmActive; activeEnvironment(); };
}
