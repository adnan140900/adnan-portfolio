"use client";

import { useEffect, useRef } from "react";
import { useExperienceProfile } from "../experience/experience-profile-provider";
import { getStarfieldProfile } from "./starfield-policy";
import { motionCanRun, motionTokens as M } from "../motion/motion-tokens";

interface AmbientStarfieldProps {
  seed: string;
}

interface AmbientStar {
  alpha: number;
  depth: number;
  radius: number;
  x: number;
  y: number;
  phase: number;
  frequency: number;
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function createStars(count: number, depth: number, random: () => number) {
  return Array.from({ length: count }, (): AmbientStar => ({
    alpha: depth < 0.5 ? 0.12 + random() * 0.22 : 0.24 + random() * 0.3,
    depth,
    radius: depth < 0.5 ? 0.3 + random() * 0.55 : 0.5 + random() * 0.75,
    // Mix wide coverage with two faint off-centre decorative concentrations.
    x: random() < 0.25 ? 0.22 + (random() + random() - 1) * 0.18 : random(),
    y: random() < 0.25 ? 0.68 + (random() + random() - 1) * 0.22 : random(),
    phase: random() * Math.PI * 2,
    frequency: 0.12 + random() * 0.19,
  }));
}

export function AmbientStarfield({ seed }: AmbientStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profile = useExperienceProfile();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let animationFrame: number | null = null;
    let stars: AmbientStar[] = [];
    let width = 1;
    let height = 1;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let parallaxEnabled = false;
    let animate = false;
    let intersecting = false;
    let elapsed = 0;
    let previousTime = 0;
    let fps = 30;
    let frames = 0;
    let drawMs = 0;

    const draw = () => {
      const started = performance.now();
      context.clearRect(0, 0, width, height);
      const travelling = container.dataset.routeTransitionActive === "true";
      for (const star of stars) {
        const amplitude = star.depth < 0.5 ? M.pointer.far : M.pointer.mid;
        const drift = elapsed * M.ambient.drift * star.depth;
        const x = ((star.x * width + drift + width) % width) + currentX * amplitude;
        const y = ((star.y * height + drift * 0.3 + height) % height) + currentY * amplitude;
        const breathing = 1 + Math.sin(elapsed * star.frequency + star.phase) * M.ambient.twinkle;
        context.beginPath();
        context.fillStyle = `rgba(224, 224, 209, ${star.alpha * breathing * (travelling ? 0.74 : 1)})`;
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      frames++;
      drawMs += performance.now() - started;
      // Bounded diagnostics: no React updates or growing per-frame arrays.
      if (frames % 30 === 0) {
        canvas.dataset.frames = String(frames);
        canvas.dataset.meanDrawMs = (drawMs / frames).toFixed(3);
      }
    };

    const animateTowardPointer = (time: number) => {
      animationFrame = null;
      if (!motionCanRun(profile.motionPreference, profile.visibility === "visible", intersecting)) return;
      if (time - previousTime < 1000 / fps) {
        animationFrame = requestAnimationFrame(animateTowardPointer);
        return;
      }
      if (animate) elapsed += Math.min((time - (previousTime || time)) / 1000, 0.1);
      previousTime = time;
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      draw();

      if (animate || Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        animationFrame = requestAnimationFrame(animateTowardPointer);
      }
    };

    const requestDraw = () => {
      if (animationFrame === null && motionCanRun(profile.motionPreference, profile.visibility === "visible", intersecting) && (animate || parallaxEnabled)) {
        animationFrame = requestAnimationFrame(animateTowardPointer);
      }
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(Math.round(bounds.width), 1);
      height = Math.max(Math.round(bounds.height), 1);
      const starfieldProfile = getStarfieldProfile({
        height,
        profile,
        width,
      });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, profile.viewport === "compact" ? 1.25 : 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const random = createRandom(hashSeed(`${seed}:${width}:${height}`));
      stars = [
        ...createStars(starfieldProfile.farStarCount, 0.28, random),
        ...createStars(starfieldProfile.midStarCount, 0.72, random),
      ];
      parallaxEnabled = starfieldProfile.parallaxEnabled;
      animate = starfieldProfile.animate;
      fps = starfieldProfile.fps;
      canvas.dataset.starCount = String(stars.length);
      canvas.dataset.targetFps = String(fps);
      currentX = 0;
      currentY = 0;
      targetX = 0;
      targetY = 0;
      draw();
      requestDraw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!parallaxEnabled || event.pointerType === "touch") return;
      const bounds = container.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      requestDraw();
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
      requestDraw();
    };

    const handleVisibilityChange = () => {
      canvas.dataset.running = String(intersecting && animate && !document.hidden);
      if (document.visibilityState === "hidden" && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      } else if (document.visibilityState === "visible") {
        previousTime = 0;
        draw();
        requestDraw();
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      canvas.dataset.running = String(intersecting && animate && document.visibilityState === "visible");
      if (!intersecting && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      previousTime = 0;
      requestDraw();
    });
    intersectionObserver.observe(container);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, [profile, seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className="ambient-starfield" />;
}
