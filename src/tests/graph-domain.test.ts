import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import type { GraphDocument } from "../features/graph/types";
import {
  createInitialGraphState,
  graphExplorerReducer,
} from "../features/graph/state/graph-state";
import { getGraphRuntimePolicy } from "../features/graph/physics/graph-runtime-policy";
import { createConstellationPath, createStableGraphNodes } from "../features/graph/physics/graph-geometry";
import { getStarfieldProfile } from "../features/atmosphere/starfield-policy";
import { createBranchGrowthPlan, scheduleBranchGrowth } from "../features/transitions/branch-growth-plan";
import { clampMotion, motionCanRun } from "../features/motion/motion-tokens";
import { createForceGraphController } from "../features/graph/physics/force-graph-controller";
import { approvedBundle } from "./public-fixture";
import { adaptPublicGraph } from "../lib/public-content/graph-adapter";
import { createPublicStory } from "../lib/public-content/story-adapter";
import { publicRoutes } from "../lib/public-content/routes";
import { parsePublicBundle } from "../lib/public-content/schema";
import { getStoryEdgeState, validateStoryMoments } from "../features/motion/story-model";
import { applyStoryProjection, applyIdleProjection, applyUniverseProjection } from "../features/graph/physics/story-projection";
import { genesisDuration, genesisNodeFrame, genesisEdgeProgress, universeNodeFrame, universeEdgeProgress } from "../features/universe/universe-motion-model";
import { createIdleParameters, idlePoint, idleCanRun, advanceIdleClock } from "../features/motion/semantic-idle-model";
import { createSvgGraphAdapter } from "../features/graph/physics/svg-graph-adapter";
import {
  clusterTransitionReducer,
  idleClusterTransition,
} from "../features/transitions/transition-state";
import {
  selectClusterTransitionMode,
} from "../features/transitions/transition-policy";
import { parseGraphDocument } from "../lib/graph/parse-graph-document";
import { wrapGraphLabel } from "../features/graph/graph-labels";
import { createRevealSchedule, createKnowledgeVocabulary, publicPreview, worldPersonality, floodMetaphors } from "../features/kinetic/kinetic-model";
import { createFocusFilm, createRouteFilm, activeFilmScene } from "../features/narrative/film-model";
import { semanticProjection, createProjectionSequence, projectionLabelLines, projectionNodeEmphasis } from "../features/narrative/semantic-projection-model";
import { decodeConfig } from "../features/kinetic/decode-config";
import { createUniverseDepth, semanticNeighborhood } from "../features/graph/universe-depth";
import { stageEmphasis, stageOffset } from "../features/narrative/semantic-stage-model";
import { decodeFrame, decodeFrameState, decodeAllowed, decodeDuration, relationshipFrame } from "../features/kinetic/decode-model";
import { startDecode, hasDecoded, decodeJobCount } from "../features/kinetic/decode-controller";
import { typewriterFrame, heroReplayStep } from "../features/kinetic/decode-typewriter-model";
import { createExperienceProfile, type ExperienceProfile } from "../features/experience/experience-profile";
import { getGraphViewport, projectGraphPoint, projectGraphPoints } from "../features/graph/physics/graph-projection";
import { createSceneLifecycle, replaySceneIndex, sceneRevealFrame } from "../features/narrative/scene-replay-model";
import { createSceneReplay } from "../features/narrative/scene-replay-controller";
import { branchCamera, branchFocus } from "../features/narrative/branch-focus-model";

test("branch focus follows real AI subjects and only their approved incident edges", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.rootNodeId === "topic-ai-technology")!;
  const nodes = graph.nodes.filter(node => view.nodeIds.includes(node.id));
  const scenes = createRouteFilm(createPublicStory(approvedBundle.ai.items, graph, view), "/ai", graph);
  const before = JSON.stringify(graph);
  for (const scene of scenes) {
    const plan = branchFocus(graph, scene, "ai", nodes);
    assert.equal(plan.target, nodes.find(node => node.label === scene.title)?.id ?? scene.topicId);
    assert.ok(plan.target && nodes.some(node => node.id === plan.target));
    assert.deepEqual([...plan.edges], graph.edges.filter(edge => view.nodeIds.includes(edge.source) && view.nodeIds.includes(edge.target) && [edge.source, edge.target].includes(plan.target!)).map(edge => edge.id));
  }
  const unrelated = branchFocus(graph, { ...scenes[0], title: "Unmapped", topicId: "missing" }, "ai", nodes);
  assert.equal(unrelated.target, null);
  assert.equal(JSON.stringify(graph), before);
});

test("branch camera remains absolute, bounded and still for reduced motion", () => {
  const point = { x: 950, y: 20 }, first = branchCamera(point, 1040, 580, false);
  for (let cycle = 0; cycle < 40; cycle++) {
    branchCamera({ x: 20, y: 550 }, 1040, 580, false);
    assert.deepEqual(branchCamera(point, 1040, 580, false), first);
  }
  assert.ok(Math.abs(first.x) <= 1040 * 0.055 && Math.abs(first.y) <= 580 * 0.055);
  assert.deepEqual(branchCamera(point, 1040, 580, true), { x: 0, y: 0 });
});

const experience = (overrides: Partial<ExperienceProfile> = {}): ExperienceProfile => ({
  motionPreference: "full", viewport: "wide", pointer: "fine", performance: "normal", visibility: "visible", ...overrides,
});

test("scene epochs re-arm only on meaningful leave and invalidate rapid reversal jobs", () => {
  const state = createSceneLifecycle(3);
  const first = state.enter(0, "full")!;
  assert.equal(first.epoch, 1); assert.equal(first.animate, true);
  assert.equal(state.enter(0, "full"), null);
  for (const time of [0.77, 0.8, 0.84, 0.79]) assert.equal(replaySceneIndex(time, 0, 3), 0);
  assert.equal(replaySceneIndex(0.89, 0, 3), 1);
  const next = state.enter(1, "full")!;
  assert.equal(state.isCurrent(first.token), false);
  for (const time of [0.85, 0.79, 0.74]) assert.equal(replaySceneIndex(time, 1, 3), 1);
  assert.equal(replaySceneIndex(0.71, 1, 3), 0);
  const back = state.enter(0, "full")!;
  assert.equal(back.epoch, 2); assert.equal(state.isCurrent(next.token), false);
  state.enter(2, "full"); assert.equal(state.isCurrent(back.token), false);
  state.leave();
  assert.equal(state.enter(2, "full")?.epoch, 2);
});

test("scene replay bypasses reduced motion and leaves exact geometry to existing owners", () => {
  assert.equal(createSceneLifecycle(1).enter(0, "reduced")?.animate, false);
  for (let t = 0; t < 1.7; t += 0.01) {
    const frame = sceneRevealFrame(t);
    if (frame.edge > 0) { assert.equal(frame.node, 1); assert.equal(frame.label, 1); }
  }
  assert.deepEqual(sceneRevealFrame(1.65, 1), { node: 1, label: 1, edge: 1, copy: 1 });
  const source = readFileSync("src/features/narrative/scene-replay-controller.ts", "utf8");
  assert.doesNotMatch(source, /createForceGraph|applyStoryProjection|requestAnimationFrame|IntersectionObserver/);
  const decode = readFileSync("src/features/kinetic/decode-text.tsx", "utf8");
  assert.match(decode, /if \(panel && replay === "scene"\) return/);
  const film = readFileSync("src/features/narrative/film-controller.ts", "utf8");
  assert.doesNotMatch(film, /end: "bottom top"/);
  assert.equal(replaySceneIndex(11.01, 9, 11), 10);
});

test("cross-film handoff cancels the previous foreground timeline and Decode jobs", () => {
  const globals = globalThis as unknown as Record<string, unknown>, original = globals.document;
  globals.document = { hidden: false, documentElement: { dataset: {} } };
  const fixture = (id: string) => {
    const texts = [true, false].map(title => ({ dataset: { sceneDecode: "Research", decodeMode: "editorial" }, style: { setProperty() {}, removeProperty() {} }, querySelectorAll: () => [], closest: () => title ? {} : null }) as unknown as HTMLElement);
    const panel = { id, dataset: {}, querySelector: () => null, querySelectorAll: () => texts } as unknown as HTMLElement;
    const root = { dataset: {}, querySelector: () => null, querySelectorAll: () => [] } as unknown as HTMLElement;
    return { root, texts, controller: createSceneReplay(root, [panel], experience()) };
  };
  const a = fixture("a"), b = fixture("b");
  try {
    a.controller.activate(0); assert.equal(decodeJobCount(), 2);
    b.controller.activate(0);
    assert.equal(decodeJobCount(), 2);
    assert.equal(a.root.dataset.sceneRevealRunning, "false");
    assert.ok(a.texts.every(t => t.dataset.decoding === "false"));
    assert.ok(b.texts.every(t => t.dataset.decodeRuns === "1"));
    b.controller.activate(0); assert.ok(b.texts.every(t => t.dataset.decodeRuns === "1"));
    b.controller.leave(); assert.equal(decodeJobCount(), 0);
    b.controller.activate(0); assert.ok(b.texts.every(t => t.dataset.decodeRuns === "2"));
  } finally {
    a.controller.destroy(); b.controller.destroy(); assert.equal(decodeJobCount(), 0);
    if (original === undefined) delete globals.document; else globals.document = original;
  }
});

test("branch text replay never acquires graph presentation or suspends semantic idle", () => {
  const globals = globalThis as unknown as Record<string, unknown>, original = globals.document;
  globals.document = { hidden: false, documentElement: { dataset: {} } };
  const panel = { id: "branch", dataset: {}, querySelector: () => null, querySelectorAll: () => [] } as unknown as HTMLElement;
  const root = { dataset: { branchPersistent: "true" }, querySelector() { throw new Error("branch replay must not acquire stage"); }, querySelectorAll() { throw new Error("branch replay must not acquire graph"); } } as unknown as HTMLElement;
  const controller = createSceneReplay(root, [panel], experience());
  try {
    controller.activate(0); controller.leave(); controller.activate(0);
    assert.equal(panel.dataset.sceneEpoch, "2");
  } finally {
    controller.destroy();
    if (original === undefined) delete globals.document; else globals.document = original;
  }
});

test("Home composition places the graph before compact centered copy without semantic changes", () => {
  const page = readFileSync("src/app/page.tsx", "utf8");
  assert.ok(page.indexOf("<KnowledgeGraph") < page.indexOf("<header"));
  assert.match(page, /home-universe-frame/);
  const css = readFileSync("src/app/globals.css", "utf8").split("/* Phase 13C:")[1];
  assert.match(css, /justify-items: center; text-align: center/);
  assert.match(css, /position: relative; z-index: 14; inset: auto/);
  assert.match(css, /position: sticky; top: 4rem/);
  const motion = readFileSync("src/features/universe/universe-motion-controller.ts", "utf8");
  assert.match(motion, /seconds >= 4\.1 \? 2/);
  const title = approvedBundle.profile.headline.text;
  assert.ok(title.length / 2.3 >= 22 && title.length / 2.3 <= 30);
  for (const node of approvedBundle.graph.nodes) {
    const middle = universeNodeFrame(node, "wide", 0.65);
    assert.ok(middle.scale > 0.98 && middle.opacity === 1);
  }
});

test("Genesis settles all 38 real nodes before any of the 50 edges can draw", () => {
  const nodes = approvedBundle.graph.nodes;
  for (const viewport of ["wide", "compact"] as const) {
    for (let time = 0; time <= genesisDuration; time += 0.025) {
      const visibleEdge = approvedBundle.graph.edges.some((_, index) => genesisEdgeProgress(index, 50, time) > 0);
      if (visibleEdge) for (const node of nodes) {
        const frame = genesisNodeFrame(node, viewport, time);
        assert.equal(frame.x, 0); assert.equal(frame.y, 0); assert.equal(frame.scale, 1);
      }
    }
    assert.ok(nodes.every(node => Math.hypot(genesisNodeFrame(node, viewport, 0).x, genesisNodeFrame(node, viewport, 0).y) > 0));
    assert.ok(approvedBundle.graph.edges.every((_, i) => genesisEdgeProgress(i, 50, genesisDuration) === 1));
  }
});

test("dissolution retracts all edges before displacement and reverses without accumulated state", () => {
  const snapshot = JSON.stringify(approvedBundle.graph);
  for (const viewport of ["wide", "compact"] as const) for (const node of approvedBundle.graph.nodes) {
    for (const p of [0, 0.2, 0.4, 0.53, 0.8, 1, 0.8, 0.2, 0.8, 0.4, 0, 1, 0]) {
      const frame = universeNodeFrame(node, viewport, p);
      assert.deepEqual(frame, universeNodeFrame(node, viewport, p));
      if (Math.hypot(frame.x, frame.y) > 0) for (const tier of ["primary", "secondary", "tertiary"] as const) assert.equal(universeEdgeProgress(tier, p), 0);
      if (p === 0) assert.deepEqual(frame, { x: 0, y: 0, scale: 1, opacity: 1, label: 1, idleWeight: 1 });
      if (p === 1) { assert.ok(Math.hypot(frame.x, frame.y) > 0); assert.equal(frame.label, 0); }
    }
  }
  assert.equal(JSON.stringify(approvedBundle.graph), snapshot);
  assert.ok(universeEdgeProgress("primary", 0.25) > 0);
  assert.equal(universeEdgeProgress("tertiary", 0.25), 0);
});

test("typewriter accumulates immutable final characters and retains whitespace without exposing future text", () => {
  const text = "Engineering questions. Connected ideas.";
  const locked = new Map<number, string>();
  for (let p = 0; p <= 1; p += 0.005) {
    const frame = typewriterFrame(text, p);
    assert.ok(frame.filter(cell => cell.state === "arriving").length <= 3);
    for (const [index, character] of locked) { assert.equal(frame[index].state, "locked"); assert.equal(frame[index].character, character); }
    frame.forEach((cell, index) => { if (cell.state === "locked") { assert.equal(cell.character, text[index]); locked.set(index, cell.character); } });
  }
  assert.equal(typewriterFrame(text, 1).map(cell => cell.character).join(""), text);
  assert.ok(typewriterFrame(text, 0.2).some(cell => cell.state === "hidden"));
});

test("hero replay requires full departure and meaningful return without restarting on intermediate reversals", () => {
  let armed = false, replays = 0;
  for (let cycle = 0; cycle < 5; cycle++) {
    for (const p of [0, 0.01, 0.4, 0.2, 0.8, 0.5, 1, 0.95, 0.6, 0.4, 0.7, 0.19, 0.18, 0.15, 0]) {
      const next = heroReplayStep(armed, p); armed = next.armed;
      if (next.replay) replays++;
    }
    assert.equal(replays, cycle + 1);
  }
});

test("replayable Decode jobs reuse one owner and release the shared ticker after every cycle", () => {
  const element = { dataset: {}, style: { setProperty() {}, removeProperty() {} }, querySelectorAll: () => [] } as unknown as HTMLElement;
  for (let i = 0; i < 5; i++) {
    const stop = startDecode(element, "Research", "editorial", "replay-test", { replay: true });
    assert.equal(decodeJobCount(), 1);
    const replacement = startDecode(element, "Research", "editorial", "replay-test", { replay: true });
    assert.equal(decodeJobCount(), 1);
    stop(); replacement();
    assert.equal(decodeJobCount(), 0);
  }
  assert.equal(hasDecoded("replay-test"), false);
});

test("Home projection releases exactly to the pre-existing idle geometry after repeated cycles", () => {
  const attrs = new Map<string, string>();
  const transforms = new Map<string, string>();
  const edge = { dataset: { source: "a", target: "b", edgeId: "ab" }, setAttribute: (key: string, value: string) => attrs.set(key, value) };
  const positions = ["a", "b"].map(id => ({ dataset: { storyPosition: id }, setAttribute: (_key: string, value: string) => transforms.set(id, value), removeAttribute: () => transforms.delete(id) }));
  const svg = { querySelectorAll: (selector: string) => selector === "[data-force-edge]" ? [edge] : selector === "[data-story-position]" ? positions : [] } as unknown as SVGSVGElement;
  const nodes = ["a", "b"].map((id, i) => ({ id, kind: "concept" as const, weight: 0.5, isRoot: !i, collisionRadius: 30, x: i * 100, y: i * 50 }));
  createSvgGraphAdapter(svg).render(nodes, []);
  applyIdleProjection(svg, new Map([["a", { x: 2, y: 1 }], ["b", { x: 8, y: -3 }]]));
  const before = new Map(transforms), path = attrs.get("d");
  for (let cycle = 0; cycle < 25; cycle++) {
    applyUniverseProjection(svg, new Map([["a", { x: 300, y: 200 }], ["b", { x: -220, y: -100 }]]), 0);
    applyUniverseProjection(svg, new Map(), 1);
    assert.deepEqual(transforms, before); assert.equal(attrs.get("d"), path);
  }
  assert.equal(nodes[1].x, 100); assert.equal(nodes[1].y, 50);
});

test("decode preserves final strings, whitespace and punctuation with restrained editorial substitutions", () => {
  const text = "AI & Technology — café, 2026.";
  for (const mode of ["system", "editorial"] as const) {
    assert.equal(decodeFrame(text, 1, mode, 30), text);
    assert.equal(decodeFrame(text, 0.3, mode, 4), decodeFrame(text, 0.3, mode, 4));
    const chars = Array.from(decodeFrame(text, 0, mode));
    assert.equal(chars.length, Array.from(text).length);
    Array.from(text).forEach((char, index) => { if (!/[\p{L}\p{N}]/u.test(char)) assert.equal(chars[index], char); });
  }
  const substitutions = (mode: "system" | "editorial") => Array.from(decodeFrame(text, 0, mode)).filter((char, i) => char !== Array.from(text)[i]).length;
  assert.ok(substitutions("editorial") < substitutions("system"));
  assert.notEqual(decodeFrame(text, 0, "editorial"), text);
  assert.equal(decodeFrame("", 0, "system"), "");
});

test("compact normal motion decodes while reduced, unresolved, hidden and played entrances settle", () => {
  assert.equal(decodeAllowed(experience({ viewport: "compact", pointer: "coarse" }), false), true);
  assert.equal(decodeAllowed(experience({ motionPreference: "reduced" }), false), false);
  assert.equal(decodeAllowed(experience({ motionPreference: "unresolved" }), false), false);
  assert.equal(decodeAllowed(experience({ visibility: "hidden" }), false), false);
  assert.equal(decodeAllowed(experience(), true), false);
});

test("experience dimensions remain independent", () => {
  const compact = createExperienceProfile({ prefersReducedMotion: false, compactViewport: true, coarsePointer: true, constrainedPerformance: true, hidden: false });
  assert.deepEqual(compact, { motionPreference: "full", viewport: "compact", pointer: "coarse", performance: "constrained", visibility: "visible" });
  assert.equal(decodeAllowed(compact, false), true);
  const reducedWide = createExperienceProfile({ prefersReducedMotion: true, compactViewport: false, coarsePointer: false, constrainedPerformance: false, hidden: false });
  assert.equal(reducedWide.motionPreference, "reduced");
  assert.equal(reducedWide.viewport, "wide");
  assert.equal(decodeAllowed(reducedWide, false), false);
});

test("Decode V2 is dense, deterministic, frame-progressive and readable before completion", () => {
  const text = "KINETIC KNOWLEDGE SYSTEM";
  const initial = decodeFrameState(text, 0.05, "system", 0, { seed: "test", tier: "system" });
  assert.ok(initial.unresolvedIndices.size >= Math.floor(Array.from(text).filter(char => /[\p{L}\p{N}]/u.test(char)).length * 0.55));
  assert.equal(decodeFrameState(text, 0.22, "system", 0, { seed: "test" }).text, decodeFrameState(text, 0.22, "system", 0, { seed: "test" }).text);
  assert.notEqual(decodeFrameState(text, 0.22, "system", 0, { seed: "test" }).text, decodeFrameState(text, 0.22, "system", 12, { seed: "test" }).text);
  assert.ok(decodeFrameState(text, 0.55, "system", 12, { seed: "test" }).unresolvedIndices.size <= Math.ceil(initial.unresolvedIndices.size * 0.3));
  assert.ok(decodeFrameState(text, 0.79, "system", 20, { seed: "test" }).unresolvedIndices.size <= 2);
  assert.equal(decodeFrameState(text, 0.88, "system", 24, { seed: "test" }).text, text);
  for (const progress of [0, 0.2, 0.55, 0.79, 1]) assert.equal(Array.from(decodeFrame(text, progress, "system", 8)).length, Array.from(text).length);
});

test("Decode V2 timing and custom glyph budgets stay bounded", () => {
  assert.ok(decodeDuration("system") >= 0.45 && decodeDuration("system") <= 0.8);
  assert.ok(decodeDuration("editorial") >= 0.6 && decodeDuration("editorial") <= 1);
  assert.ok(decodeDuration("major") <= 1.2);
  assert.ok(decodeDuration("major", "compact") <= decodeDuration("major"));
  const text = "SEMANTIC RECONSTRUCTION FIELD";
  assert.ok(decodeFrameState(text, 0.05, "system", 0, { viewport: "wide" }).customIndices.size <= 4);
  assert.ok(decodeFrameState(text, 0.05, "system", 0, { viewport: "compact" }).customIndices.size <= 2);
});

test("shared decode scheduler caps jobs at two and cleans up synchronously", () => {
  const createElement = () => ({ dataset: {} as Record<string, string>, style: { setProperty() {}, removeProperty() {} }, querySelectorAll: () => Array.from("Research", char => ({ textContent: char })) }) as unknown as HTMLElement;
  const a = createElement(), b = createElement(), c = createElement();
  const cancelA = startDecode(a, "Research", "editorial", "test-a");
  const cancelB = startDecode(b, "Research", "system", "test-b");
  const cancelC = startDecode(c, "Research", "system", "test-c");
  assert.equal(a.dataset.decoding, "true"); assert.equal(b.dataset.decoding, "true");
  assert.equal(c.dataset.decoding, "false"); assert.equal(c.dataset.decodeComplete, "true");
  cancelA(); cancelB(); cancelC();
  assert.equal(a.dataset.decoding, "false"); assert.equal(b.dataset.decoding, "false");
  assert.equal(hasDecoded("test-a"), true);
  startDecode(a, "Research", "editorial", "test-a")();
  assert.equal(a.dataset.decoding, "false");
});

test("relationship traces stage source, line, relation and target from actual approved edges", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  for (const entry of createKnowledgeVocabulary(graph, "/").relations) {
    const edge = graph.edges.find(edge => edge.id === entry.edgeId)!;
    assert.equal(entry.source, graph.nodes.find(node => node.id === edge.source)?.label);
    assert.equal(entry.target, graph.nodes.find(node => node.id === edge.target)?.label);
    assert.equal(entry.relation, edge.relation);
    assert.equal(relationshipFrame(entry, 1), `${entry.source} ── ${edge.relation} → ${entry.target}`);
    assert.equal(relationshipFrame(entry, 0.24).includes("→"), false);
    assert.equal(relationshipFrame(entry, 0.5).includes(entry.target), false);
  }
});

test("semantic regions and transitive theme previews follow only approved reachability", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views[0];
  const primary = createStableGraphNodes(graph.nodes.filter(node => view.nodeIds.includes(node.id)), view.rootNodeId);
  const points = new Map(primary.map(node => [node.id, { x: node.x!, y: node.y! }]));
  const depth = createUniverseDepth(graph, points);
  for (const node of depth.nodes) {
    assert.ok(semanticNeighborhood(graph, node.regionId).has(node.id));
    assert.equal(graph.nodes.find(theme => theme.id === node.regionId)?.category, node.category);
    const center = points.get(node.regionId)!;
    assert.ok(Math.hypot(node.x - center.x, node.y - center.y) < 280);
  }
  const research = semanticNeighborhood(graph, "topic-research");
  assert.ok(research.has("method-validation-uncertainty"));
  assert.ok(research.has("method-geospatial-analysis"));
  assert.ok(!research.has("tool-hermes"));
});

test("Flood presentation emphasis preserves topology and item mappings", () => {
  const graph = adaptPublicGraph(approvedBundle.graph), before = JSON.stringify(graph);
  const view = graph.views.find(view => view.id === "world-research-flood-accessibility")!;
  const nodes = graph.nodes.filter(node => view.nodeIds.includes(node.id));
  const scenes = createRouteFilm(createPublicStory([approvedBundle.research.items[0]], graph, view), "/research/flood-accessibility", graph);
  const method = stageEmphasis(graph, scenes.find(scene => scene.title === "Method")!, "flood", nodes);
  assert.deepEqual([...method.focus].sort(), ["method-geospatial-analysis", "method-road-networks"]);
  const validation = stageEmphasis(graph, scenes.find(scene => scene.title === "Validation")!, "flood", nodes);
  assert.deepEqual([...validation.focus], ["method-validation-uncertainty"]);
  for (const scene of scenes) {
    const plan = stageEmphasis(graph, scene, "flood", nodes);
    plan.edges.forEach(id => assert.ok(view.edgeIds.includes(id)));
    assert.equal(scene.topicId, view.rootNodeId);
  }
  assert.equal(JSON.stringify(graph), before);
});

test("route motion personalities are distinct, deterministic, bounded visual offsets", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const kinds = ["research", "projects", "ai", "leadership", "learning", "flood"];
  assert.equal(new Set(kinds.map(kind => JSON.stringify(stageOffset(graph.nodes[0], 2, 3, kind, false)))).size, kinds.length);
  for (const kind of kinds) for (let scene = 0; scene < 8; scene++) graph.nodes.forEach((node, i) => {
    const value = stageOffset(node, i, scene, kind, i === 0);
    assert.deepEqual(value, stageOffset(node, i, scene, kind, i === 0));
    assert.ok(Math.abs(value.x) <= 70 && Math.abs(value.y) <= 40);
  });
});

test("exact approved editorial titles emphasize their subject without changing source mappings", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.id === "world-topic-ai-technology")!;
  const nodes = graph.nodes.filter(node => view.nodeIds.includes(node.id));
  const scenes = createRouteFilm(createPublicStory(approvedBundle.ai.items, graph, view), "/ai", graph);
  const hermes = scenes.find(scene => scene.title === "Hermes")!;
  const plan = stageEmphasis(graph, hermes, "ai", nodes);
  assert.deepEqual([...plan.focus], ["tool-hermes"]);
  assert.ok(!plan.neighbors.has("experiment-local-ai"));
  assert.notEqual(hermes.term, "Local AI");
  assert.equal(hermes.topicId, "topic-ai-technology");
});

test("homepage depth contains all approved descendants without expanding primary navigation or physics", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const before = JSON.stringify(graph);
  const view = graph.views.find(view => view.id === graph.entryViewId)!;
  const primary = createStableGraphNodes(graph.nodes.filter(node => view.nodeIds.includes(node.id)), view.rootNodeId);
  const points = new Map(primary.map(node => [node.id, { x: node.x!, y: node.y! }]));
  const depth = createUniverseDepth(graph, points);
  assert.equal(primary.length, 7);
  assert.deepEqual(points.get(view.rootNodeId), { x: 520, y: 290 });
  assert.equal(depth.nodes.length, 31);
  assert.equal(depth.edges.length + view.edgeIds.length, 50);
  assert.equal(new Set([...primary, ...depth.nodes].map(node => node.id)).size, 38);
  assert.deepEqual(depth, createUniverseDepth(graph, points));
  depth.nodes.forEach(node => {
    assert.ok(node.depth! >= 2);
    assert.ok(node.x >= 45 && node.x <= 995 && node.y >= 35 && node.y <= 545);
    assert.ok(Math.hypot((node.x - 520) / 180, (node.y - 290) / 100) > 1);
  });
  depth.edges.forEach(edge => assert.ok(graph.edges.includes(edge)));
  assert.equal(JSON.stringify(graph), before);
});

test("homepage depth bands become progressively freer while themes remain heavy", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  graph.nodes.filter(node => node.depth! > 1).forEach(node => {
    const background = createIdleParameters(node, "person-adnan", true);
    const theme = createIdleParameters({ id: "topic-research", kind: "cluster", depth: 1 }, "person-adnan");
    assert.ok(background.x > theme.x);
    assert.ok(background.period < theme.period);
    assert.ok(background.x >= (node.depth === 2 ? 14 : 17) && background.x <= (node.depth === 2 ? 17 : 20));
  });
});

test("compact portrait projection is deterministic, bounded, and topology-neutral", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.id === graph.entryViewId)!;
  const canonical = createStableGraphNodes(graph.nodes.filter(node => view.nodeIds.includes(node.id)), view.rootNodeId);
  const points = new Map(canonical.map(node => [node.id, { x: node.x!, y: node.y! }]));
  const portrait = projectGraphPoints(points, "compact");
  assert.deepEqual(portrait, projectGraphPoints(points, "compact"));
  assert.deepEqual([...portrait.keys()], [...points.keys()]);
  assert.deepEqual(graph.edges.map(edge => [edge.source, edge.target]), approvedBundle.graph.edges.map(edge => [edge.source, edge.target]));
  for (const point of portrait.values()) {
    assert.ok(point.x >= 54 && point.x <= 566);
    assert.ok(point.y >= 72 && point.y <= 908);
  }
  assert.deepEqual(projectGraphPoint({ x: 520, y: 290 }, "compact"), { x: 310, y: 490 });
  assert.deepEqual(getGraphViewport("compact"), { width: 620, height: 980 });
});

test("mobile graph presentation uses the semantic SVG without the visible grid fallback", () => {
  const source = readFileSync("src/features/graph/components/knowledge-graph.tsx", "utf8");
  assert.match(source, /data-semantic-mobile/);
  assert.doesNotMatch(source, /mobile-graph-list/);
  assert.match(source, /visibleEdges\.map/);
  assert.match(source, /visibleNodes\.map/);
});

test("mobile semantic navigation keeps approved routes, single-tap links and accessible location state", () => {
  const header = readFileSync("src/components/layout/site-header.tsx", "utf8");
  const navigation = readFileSync("src/components/layout/primary-navigation.tsx", "utf8");
  assert.match(header, /publicRoutes\.filter/);
  assert.match(header, /href: "\/about"/);
  assert.match(navigation, /<Link/);
  assert.match(navigation, /aria-current=/);
  assert.match(navigation, /aria-label=\{item\.label\}/);
  assert.match(navigation, /data-navigation-active/);
  assert.doesNotMatch(navigation, /onClick|preventDefault|pointerdown|touchstart/i);
});

test("compact composition retains one semantic stage and a complete reduced-motion layout", () => {
  const film = readFileSync("src/features/narrative/narrative-film.tsx", "utf8");
  const stage = readFileSync("src/features/narrative/semantic-stage.css", "utf8");
  const layout = readFileSync("src/app/globals.css", "utf8");
  assert.equal((film.match(/className="semantic-stage"/g) ?? []).length, 1);
  assert.match(stage, /--mobile-stage-height/);
  assert.match(layout, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(layout, /\.home-world \.discovery-hero > \.constellation-shell/);
  assert.doesNotMatch(film, /grid-cols|mobile-graph-list/);
});

test("background relationship endpoints combine fixed depth positions with D3 and shared idle offsets", () => {
  const attrs = new Map<string, string>();
  const edge = { dataset: { source: "theme", target: "deep", edgeId: "real-edge" }, setAttribute: (key: string, value: string) => attrs.set(key, value) };
  const background = { dataset: { universeNode: "deep", baseX: "300", baseY: "200" } };
  const svg = { querySelectorAll: (selector: string) => selector === "[data-universe-edge]" ? [edge] : selector === "[data-universe-node]" ? [background] : [] } as unknown as SVGSVGElement;
  const nodes = [{ id: "theme", kind: "cluster" as const, weight: 1, isRoot: false, collisionRadius: 100, x: 100, y: 80 }];
  const adapter = createSvgGraphAdapter(svg);
  adapter.render(nodes, []);
  applyIdleProjection(svg, new Map([["theme", { x: 10, y: 5 }], ["deep", { x: 3, y: 2 }]]));
  assert.equal(attrs.get("d"), "M 110 85 L 303 202");
  nodes[0].x = 120;
  adapter.render(nodes, []);
  assert.equal(attrs.get("d"), "M 130 85 L 303 202");
  applyIdleProjection(svg, new Map());
  assert.equal(attrs.get("d"), "M 120 80 L 300 200");
  // A responsive handoff must not retain the initial SSR/wide depth endpoint.
  background.dataset.baseX = "180";
  background.dataset.baseY = "360";
  adapter.render(nodes, []);
  assert.equal(attrs.get("d"), "M 120 80 L 180 360");
});

test("focus film preserves each statement once and uses four approved, distinct topic identities", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const before = JSON.stringify(graph);
  const scenes = createFocusFilm(approvedBundle.profile.currentFocus, graph);
  assert.equal(scenes.length, 4);
  assert.equal(new Set(scenes.map(scene => scene.composition)).size, 4);
  scenes.forEach((scene, i) => {
    assert.equal(scene.copy, approvedBundle.profile.currentFocus[i].text);
    assert.equal(scene.title, graph.nodes.find(node => node.id === scene.topicId)?.label);
    assert.notEqual(scene.title, scene.term);
    assert.notEqual(scene.title, "Current focus");
    assert.ok(graph.nodes.some(node => node.label === scene.term));
    assert.ok(!graph.nodes.some(node => node.kind === "person" && node.label === scene.term));
  });
  assert.equal(JSON.stringify(graph), before);
});

test("Flood film retains eight exact sections without adding semantic mappings", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.id === "world-research-flood-accessibility")!;
  const moments = createPublicStory([approvedBundle.research.items[0]], graph, view);
  const scenes = createRouteFilm(moments, "/research/flood-accessibility", graph);
  assert.equal(scenes.length, 8);
  assert.ok(new Set(scenes.map(scene => scene.composition)).size >= 5);
  scenes.forEach((scene, i) => {
    assert.equal(scene.copy, moments[i].copy);
    assert.equal(scene.title, moments[i].title);
    assert.equal(scene.topicId, moments[i].nodeId);
    assert.notEqual(scene.term, scene.title);
    assert.ok(graph.nodes.some(node => node.label === scene.term));
  });
});

test("focus projections are bounded, connected approved subsets with deterministic labeled geometry", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const scenes = createFocusFilm(approvedBundle.profile.currentFocus, graph);
  const sequence = createProjectionSequence(graph, scenes);
  assert.deepEqual(sequence, createProjectionSequence(graph, scenes));
  for (const projection of sequence.frames) {
    assert.ok(projection.nodes.length >= 4 && projection.nodes.length <= 9);
    projection.edges.forEach(edge => assert.ok(graph.edges.includes(edge)));
    for (const node of projection.nodes) {
      assert.equal(projectionLabelLines(node.label).join(" "), node.label);
      assert.ok(projection.distances.has(node.id));
      const point = projection.positions.get(node.id)!;
      assert.ok(point.x >= 150 && point.x <= 900 && point.y >= 80 && point.y <= 510);
      assert.ok(projectionNodeEmphasis(node, projection) > 0);
      if (node.id !== projection.anchorId) assert.ok(projection.edges.some(edge => edge.source === node.id || edge.target === node.id));
    }
  }
  assert.equal(sequence.frames[0].nodes.length, 7); assert.equal(sequence.frames[0].edges.length, 8);
  for (const id of ["learning-computational-civil", "learning-python-geospatial", "method-geospatial-analysis", "method-road-networks", "theme-civil-environmental-engineering"]) assert.ok(sequence.frames[1].nodes.some(node => node.id === id), id);
  assert.equal(sequence.frames[2].nodes.length, 7);
  assert.equal(sequence.frames[3].nodes.length, 6);
});

test("About centers the public person and six actual themes, with no extra relationships", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const projection = semanticProjection(graph, "topic-research", true);
  assert.equal(projection.anchorId, "person-adnan");
  assert.equal(projection.nodes.length, 7); assert.equal(projection.edges.length, 6);
  assert.ok(projection.edges.every(edge => edge.source === "person-adnan" && edge.relation === "has-theme"));
  assert.deepEqual(projection.positions.get("person-adnan"), { x: 520, y: 290 });
});

test("signature decode has a bounded original glyph family and staged readable resolution", () => {
  assert.equal(new Set(decodeConfig.customGlyphs.map(mark => mark.path)).size, 6);
  assert.ok(decodeConfig.customGlyphs.some(mark => mark.id === decodeConfig.cursor));
  assert.ok([...decodeConfig.systemPool, ...decodeConfig.editorialPool].every(mark => !"_/|.".includes(mark)));
  const text = "Connecting ideas through research";
  for (const mode of ["system", "editorial"] as const) {
    const counts = [0, 0.3, 0.6, 0.8, 1].map(progress => Array.from(decodeFrame(text, progress, mode)).filter((char, index) => char !== text[index]).length);
    assert.ok(counts.every((count, index) => !index || count <= counts[index - 1]));
    assert.ok(counts[2] <= Math.ceil(counts[0] * 0.3)); assert.ok(counts[3] <= 2); assert.equal(counts[4], 0);
    assert.notEqual(decodeFrame(text, 0.3, mode, 1), decodeFrame(text, 0.3, mode, 12), "frame progression advances deterministic substitutions");
    assert.equal(decodeFrame(text, 0.3, mode, 12), decodeFrame(text, 0.3, mode, 12), "the same frame remains deterministic");
  }
});

test("decode glyph optics are tier-specific without changing accepted timing", () => {
  const styles = readFileSync("src/features/kinetic/decode.css", "utf8");
  assert.ok(styles.includes(".decode-system .decode-mark { width: 0.82em; height: 0.82em; vertical-align: -0.055em; }"));
  assert.ok(styles.includes(".decode-editorial .decode-mark { width: 0.7em; height: 0.7em; vertical-align: -0.015em;"));
  assert.equal(decodeDuration("system", "wide"), 0.6);
  assert.equal(decodeDuration("editorial", "wide"), 0.8);
  assert.equal(decodeDuration("major", "wide"), 1.05);
});

test("film semantic progress is bounded and reverses without history-dependent state", () => {
  assert.equal(activeFilmScene(-10, 4), 0); assert.equal(activeFilmScene(10, 4), 3);
  const times = [0,0.4,0.9,1.2,2.3,3.6];
  const forward = times.map(time => activeFilmScene(time, 4));
  assert.deepEqual(times.toReversed().map(time => activeFilmScene(time, 4)), forward.toReversed());
});

test("reduced film lifecycle never enhances or hides panels and disconnects its observers", async () => {
  const { registerFilm } = await import("../features/narrative/film-controller");
  const globals = globalThis as unknown as Record<string, unknown>;
  const originalDocument = globals.document, originalObserver = globals.IntersectionObserver;
  let created = 0, disconnected = 0;
  class ObserverStub {
    constructor() { created++; }
    observe() {}
    disconnect() { disconnected++; }
  }
  const panel = { dataset: {}, style: {}, querySelectorAll: () => [] };
  const root = { dataset: {}, querySelector: () => null, querySelectorAll: (selector: string) => selector === "[data-film-panel]" ? [panel] : [] };
  globals.document = { documentElement: { dataset: {} }, querySelectorAll: () => [] };
  globals.IntersectionObserver = ObserverStub;
  try {
    const cleanup = registerFilm(root as unknown as HTMLElement, [], experience({ motionPreference: "reduced" }), adaptPublicGraph(approvedBundle.graph));
    assert.deepEqual(root.dataset, {});
    assert.deepEqual(panel.style, {});
    assert.equal(created, 2);
    cleanup();
    assert.equal(disconnected, 2);
  } finally {
    if (originalDocument === undefined) delete globals.document; else globals.document = originalDocument;
    if (originalObserver === undefined) delete globals.IntersectionObserver; else globals.IntersectionObserver = originalObserver;
  }
});

test("kinetic synthesis preserves text and deterministic punctuation timing", () => {
  for (const mode of ["character", "word"] as const) {
    const text = "Engineering questions. Connected ideas. Careful experiments.";
    const schedule = createRevealSchedule(text, mode);
    assert.equal(schedule.map(item => item.token).join(""), text);
    assert.deepEqual(schedule, createRevealSchedule(text, mode));
    assert.equal(schedule[0].at, 0);
    assert.ok(Math.abs(schedule.at(-1)!.until - 2.25) < 0.00001);
    schedule.forEach((item, i) => { assert.ok(item.until > item.at); if (i) assert.equal(item.at, schedule[i - 1].until); });
    const punctuated = schedule.find(item => /\.$/.test(item.token.trim()))!;
    assert.ok(punctuated.until - punctuated.at > schedule[0].until - schedule[0].at);
  }
  assert.deepEqual(createRevealSchedule(""), []);
});

test("knowledge field contains only adapter labels and exact directed public relationships", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const before = JSON.stringify(graph);
  for (const route of publicRoutes) {
    const vocabulary = createKnowledgeVocabulary(graph, route.path);
    assert.ok(vocabulary.labels.length);
    vocabulary.labels.forEach(label => assert.ok(graph.nodes.some(node => node.label === label)));
    vocabulary.relations.forEach(fragment => {
      const edge = graph.edges.find(edge => edge.id === fragment.edgeId)!;
      assert.equal(fragment.text, `${graph.nodes.find(node => node.id === edge.source)!.label} → ${edge.relation} → ${graph.nodes.find(node => node.id === edge.target)!.label}`);
    });
  }
  assert.notDeepEqual(createKnowledgeVocabulary(graph, "/ai"), createKnowledgeVocabulary(graph, "/learning"));
  assert.deepEqual(createKnowledgeVocabulary(graph, "/unknown"), { labels: [], relations: [] });
  assert.equal(JSON.stringify(graph), before);
});

test("anticipation is bounded to outgoing approved descendants", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  for (const node of graph.nodes) {
    const labels = publicPreview(graph, node.id);
    assert.ok(labels.length <= 3);
    const reachable = new Set([node.id]);
    for (let step = 0; step < graph.nodes.length; step++) graph.edges.forEach(edge => { if (reachable.has(edge.source)) reachable.add(edge.target); });
    labels.forEach(label => assert.ok(graph.nodes.some(target => target.label === label && reachable.has(target.id))));
  }
  assert.deepEqual(publicPreview(graph, "unknown"), []);
});

test("editorial personalities and Flood metaphors stay bounded and distinct", () => {
  assert.equal(new Set(floodMetaphors).size, 8);
  const paths = ["/research", "/projects", "/ai", "/leadership", "/learning", "/about"];
  assert.equal(new Set(paths.map(path => worldPersonality(path).name)).size, 6);
  paths.forEach(path => { const p = worldPersonality(path); assert.ok(p.lifetime >= 16 && p.lifetime <= 36); assert.ok(p.drift >= 10 && p.drift <= 40); });
  assert.deepEqual(worldPersonality("/projects/nothipotro"), worldPersonality("/projects"));
});

test("semantic idle is deterministic, bounded and independently phased", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const parameters = graph.nodes.map(node => createIdleParameters(node, approvedBundle.graph.rootId));
  assert.equal(new Set(parameters.map(value => value.phase)).size, graph.nodes.length);
  for (const [index, node] of graph.nodes.entries()) {
    const p = parameters[index];
    assert.deepEqual(p, createIdleParameters(node, approvedBundle.graph.rootId));
    const [minPeriod,maxPeriod] = node.kind === "person" ? [65,87] : node.kind === "cluster" ? [38,48] : [20,30];
    assert.ok(p.period >= minPeriod && p.period <= maxPeriod);
    const [minRadius,maxRadius] = node.kind === "person" ? [0.65,0.65] : node.kind === "cluster" ? [7,10] : [12,16];
    assert.ok(p.x >= minRadius && p.x <= maxRadius);
    assert.ok(p.y < p.x);
    for (let seconds = 0; seconds <= 900; seconds += 0.5) {
      const point = idlePoint(p, seconds);
      assert.ok(Math.abs(point.x) <= p.x && Math.abs(point.y) <= p.y);
      assert.ok(Math.hypot(point.x, point.y) < 27);
      if (node.kind === "person") assert.ok(Math.hypot(point.x, point.y) < 2);
    }
  }
  const independent = createIdleParameters({id:"existing-concept",kind:"concept"});
  assert.ok(independent.yRatio > 1);
});

test("deep stars visibly change geometry over five seconds while remaining slow per frame", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const themes = graph.nodes.filter(node => node.depth! > 1).map(node => createIdleParameters(node, "person-adnan", true));
  for (let seconds = 0; seconds < 90; seconds++) {
    const distances = themes.map(p => {
      const a=idlePoint(p,seconds), b=idlePoint(p,seconds+5), next=idlePoint(p,seconds+0.05);
      assert.ok(Math.hypot(next.x-a.x,next.y-a.y) < 0.6);
      return Math.hypot(b.x-a.x,b.y-a.y);
    });
    assert.ok(distances.filter(distance => distance > 7).length >= 24);
  }
});

test("semantic idle freezes interaction time and blends release without catch-up", () => {
  const held = advanceIdleClock(20, 1, 30, true);
  assert.deepEqual(held, {time:20,speed:0});
  const released = advanceIdleClock(held.time, held.speed, 0.033, false);
  assert.ok(released.time > 20 && released.time < 20.001);
  assert.ok(advanceIdleClock(20, 1, 600, false).time <= 20.05);
  assert.equal(idleCanRun("full",true,true,true,false),true);
  for (const values of [["reduced",true,true,true,false],["unresolved",true,true,true,false],["full",false,true,true,false],["full",true,false,true,false],["full",true,true,false,false],["full",true,true,true,true]] as const) {
    assert.equal(idleCanRun(values[0],values[1],values[2],values[3],values[4]),false);
  }
});

test("cinematic branches wait for parent formation and cross-links settle last", () => {
  const edges = [{id:"ab", source:"a", target:"b"}, {id:"bc", source:"b", target:"c"}, {id:"ca", source:"c", target:"a"}];
  const plan = createBranchGrowthPlan("a", ["a","b","c"], edges);
  const timing = {branch:0.32, star:0.2, stagger:0.12};
  const schedule = scheduleBranchGrowth("a", plan, edges, timing);
  const discoveries = schedule.filter(item => item.nodeId);
  const cross = schedule.find(item => !item.nodeId)!;
  assert.equal(schedule.length, edges.length);
  assert.ok(discoveries.every(item => item.at + timing.branch + timing.star <= cross.at + 0.00001));
  const chain = [{id:"ab",source:"a",target:"b"},{id:"bc",source:"b",target:"c"}];
  const sequence = scheduleBranchGrowth("a", createBranchGrowthPlan("a", ["a","b","c"], chain), chain, timing);
  assert.ok(sequence[1].at >= sequence[0].at + timing.branch + timing.star);
});

test("long graph labels wrap without changing approved wording", () => {
  for (const node of approvedBundle.graph.nodes) assert.equal(wrapGraphLabel(node.label).join(" "), node.label);
  assert.ok(wrapGraphLabel("MUN Policy Preparation and Negotiation").length > 1);
});

test("ambient budgets are capped while normal-motion mobile remains alive", () => {
  const input = {width:4000,height:3000,profile:experience()};
  const wide = getStarfieldProfile(input);
  assert.equal(wide.farStarCount + wide.midStarCount, 900);
  assert.ok(wide.farStarCount > wide.midStarCount * 3);
  const mobile = getStarfieldProfile({...input, profile: experience({viewport:"compact",pointer:"coarse"})});
  assert.equal(mobile.animate,true); assert.equal(mobile.parallaxEnabled,false); assert.equal(mobile.fps,24);
  const constrained = getStarfieldProfile({...input, profile: experience({performance:"constrained"})});
  assert.equal(constrained.animate,true); assert.equal(constrained.parallaxEnabled,false); assert.equal(constrained.fps,12);
  const reduced = getStarfieldProfile({...input, profile: experience({motionPreference:"reduced"})});
  assert.equal(reduced.animate,false); assert.equal(reduced.parallaxEnabled,false);
});

function createFixture(): GraphDocument {
  return {
    schemaVersion: "2.0.0",
    source: "phase-2-placeholder",
    exportedAt: null,
    entryViewId: "universe",
    nodes: [
      {
        id: "adnan",
        label: "Adnan",
        kind: "person",
        summary: "Placeholder root.",
        weight: 1,
      },
      {
        id: "research",
        label: "Research",
        kind: "cluster",
        summary: "Placeholder cluster.",
        parentId: "adnan",
        route: "/research",
        weight: 0.8,
      },
      {
        id: "subject",
        label: "Subject",
        kind: "subject",
        summary: "Placeholder subject.",
        parentId: "research",
        weight: 0.6,
      },
    ],
    edges: [
      { id: "root-cluster", source: "adnan", target: "research", relation: "explores" },
      { id: "cluster-subject", source: "research", target: "subject", relation: "includes" },
    ],
    views: [
      {
        id: "universe",
        label: "Universe",
        level: "universe",
        rootNodeId: "adnan",
        nodeIds: ["adnan", "research"],
        edgeIds: ["root-cluster"],
      },
      {
        id: "research-cluster",
        label: "Research cluster",
        level: "cluster",
        rootNodeId: "research",
        parentNodeId: "adnan",
        nodeIds: ["research", "subject"],
        edgeIds: ["cluster-subject"],
      },
    ],
  };
}

test("accepts a valid graph document", () => {
  const fixture = createFixture();
  assert.equal(parseGraphDocument(fixture), fixture);
});

test("rejects data that does not match the graph schema", () => {
  const fixture = createFixture() as unknown as Record<string, unknown>;
  fixture.schemaVersion = "";
  assert.throws(() => parseGraphDocument(fixture), /public graph schema/);
});

test("rejects dangling graph references", () => {
  const fixture = createFixture();
  fixture.edges[0].target = "missing-node";
  assert.throws(() => parseGraphDocument(fixture), /references a missing node/);
});

test("moves through universe, cluster, subject, and back", () => {
  const fixture = createFixture();
  const universe = createInitialGraphState(fixture.views[0]);
  assert.equal(universe.level, "universe");

  const cluster = graphExplorerReducer(universe, {
    type: "enter-cluster",
    nodeId: "research",
    viewId: "research-cluster",
  });
  assert.deepEqual(cluster, {
    level: "cluster",
    activeViewId: "research-cluster",
    activeClusterId: "research",
    focusedNodeId: "research",
  });

  const subject = graphExplorerReducer(cluster, {
    type: "open-subject",
    nodeId: "subject",
    clusterId: "research",
  });
  assert.equal(subject.level, "subject");
  assert.equal(subject.focusedNodeId, "subject");

  const returned = graphExplorerReducer(subject, {
    type: "return-to-universe",
    viewId: "universe",
  });
  assert.equal(returned.level, "universe");
});

test("activating the Research view creates route-aligned cluster state", () => {
  const fixture = createFixture();
  const universe = createInitialGraphState(fixture.views[0]);
  const researchState = graphExplorerReducer(universe, {
    type: "activate-view",
    view: fixture.views[1],
  });

  assert.deepEqual(researchState, {
    level: "cluster",
    activeViewId: "research-cluster",
    activeClusterId: "research",
    focusedNodeId: "research",
  });
});

test("graph runtime separates motion preference, viewport renderer and pointer capability", () => {
  assert.deepEqual(
    getGraphRuntimePolicy({
      profile: experience({ motionPreference: "reduced" }),
    }),
    {
      shouldCreateController: true,
      shouldAnimate: false,
      dragEnabled: false,
    },
  );

  assert.deepEqual(
    getGraphRuntimePolicy({
      profile: experience({ viewport: "compact" }),
    }),
    {
      shouldCreateController: true,
      shouldAnimate: true,
      dragEnabled: false,
    },
  );
  assert.equal(getGraphRuntimePolicy({ profile: experience({ pointer: "coarse" }) }).shouldAnimate, true);
  assert.equal(getGraphRuntimePolicy({ profile: experience({ pointer: "coarse" }) }).dragEnabled, false);
});

test("runs the cluster transition through one guarded route lifecycle", () => {
  const started = clusterTransitionReducer(idleClusterTransition, {
    type: "start",
    direction: "enter-cluster",
    mode: "cinematic",
    nodeId: "research",
    originPath: "/",
    targetPath: "/research",
  });
  assert.equal(started.phase, "exiting");

  const repeated = clusterTransitionReducer(started, {
    type: "start",
    direction: "enter-cluster",
    mode: "cinematic",
    nodeId: "research",
    originPath: "/",
    targetPath: "/research",
  });
  assert.equal(repeated, started);

  const awaiting = clusterTransitionReducer(started, { type: "route-requested" });
  assert.equal(awaiting.phase, "awaiting-route");
  const entering = clusterTransitionReducer(awaiting, { type: "route-ready" });
  assert.equal(entering.phase, "entering");
  assert.deepEqual(clusterTransitionReducer(entering, { type: "complete" }), {
    phase: "idle",
  });
});

test("selects transition composition independently from motion preference", () => {
  assert.equal(
    selectClusterTransitionMode({
      profile: experience({ motionPreference: "reduced" }),
    }),
    "reduced",
  );
  assert.equal(
    selectClusterTransitionMode({
      profile: experience({ viewport: "compact", pointer: "coarse" }),
    }),
    "mobile-cinematic",
  );
  assert.equal(
    selectClusterTransitionMode({
      profile: experience(),
    }),
    "cinematic",
  );
});

test("every public deep link initializes a valid graph view without a transition", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  for (const route of publicRoutes) {
    const view = graph.views.find(view => view.id === route.viewId)!;
    assert.ok(view);
    assert.equal(createInitialGraphState(view).activeViewId, view.id);
    assert.equal(idleClusterTransition.phase, "idle");
  }
});

test("creates straight geometric relationships with exact endpoints", () => {
  const first = createConstellationPath(
    { x: 10, y: 20 },
    { x: 160, y: 120 },
    "research-subject",
  );
  const second = createConstellationPath(
    { x: 10, y: 20 },
    { x: 160, y: 120 },
    "research-subject",
  );

  assert.equal(first, second);
  assert.equal(first, "M 10 20 L 160 120");
});

test("reduces ambient work and disables parallax for constrained contexts", () => {
  const desktop = getStarfieldProfile({
    height: 800,
    profile: experience(),
    width: 1200,
  });
  const mobileReduced = getStarfieldProfile({
    height: 800,
    profile: experience({ performance: "constrained", viewport: "compact", pointer: "coarse", motionPreference: "reduced" }),
    width: 390,
  });

  assert.equal(desktop.parallaxEnabled, true);
  assert.equal(mobileReduced.parallaxEnabled, false);
  assert.equal(mobileReduced.animate, false);
  assert.ok(
    mobileReduced.farStarCount + mobileReduced.midStarCount <
      desktop.farStarCount + desktop.midStarCount,
  );
});

test("branch growth follows reachable real edges, reverses incoming branches and retains disconnected nodes", () => {
  const plan = createBranchGrowthPlan("root", ["root", "a", "b", "isolated"], [
    { id: "secondary", source: "a", target: "b" },
    { id: "primary", source: "a", target: "root" },
    { id: "cycle", source: "b", target: "root" },
    { id: "invalid", source: "root", target: "missing" },
  ]);
  assert.equal(plan.branches[0].edgeId, "primary");
  assert.equal(plan.branches[0].reverse, true);
  assert.equal(plan.branches.at(-1)?.nodeId, null);
  assert.deepEqual(plan.unconnectedNodeIds, ["isolated"]);
  assert.equal(new Set(plan.branches.map(b => b.edgeId)).size, 3);
});

test("motion pauses while hidden, offscreen, unresolved or reduced and clamps velocity", () => {
  for (const preference of ["reduced", "unresolved"] as const) assert.equal(motionCanRun(preference, true, true), false);
  assert.equal(motionCanRun("full", false, true), false);
  assert.equal(motionCanRun("full", true, false), false);
  assert.equal(motionCanRun("full", true, true), true);
  assert.equal(clampMotion(50000, -1800, 1800), 1800);
  assert.equal(clampMotion(-50000, -1800, 1800), -1800);
  assert.equal(clampMotion(NaN, -1800, 1800), 0);
});

test("D3 gives a deterministic settled handoff for 60 semantic nodes", (t) => {
  const nodes: GraphDocument["nodes"] = Array.from({ length: 60 }, (_, i) => ({ id: `fixture-${i}`, kind: i ? "subject" : "cluster", weight: 0.6, label: `Fixture ${i}`, summary: "Test fixture only." }));
  const edges = nodes.slice(1).map(node => ({ id: `edge-${node.id}`, source: nodes[0].id, target: node.id, relation: "includes" }));
  const render = () => {
    const coordinates = new Map<string, string>();
    const fakeNodes = nodes.map(node => ({ dataset: { nodeId: node.id }, setAttribute: (_key: string, value: string) => coordinates.set(node.id, value) }));
    const svg = { querySelectorAll: (selector: string) => selector === "[data-force-node]" ? fakeNodes : [] } as unknown as SVGSVGElement;
    const started = performance.now();
    const controller = createForceGraphController({ svg, nodes, edges, rootNodeId: nodes[0].id, animate: true, dragEnabled: true });
    const duration = performance.now() - started;
    controller.destroy();
    return { coordinates, duration };
  };
  const first = render();
  const second = render();
  assert.equal(first.coordinates.size, 60);
  assert.deepEqual(first.coordinates, second.coordinates);
  for (const position of first.coordinates.values()) assert.doesNotMatch(position, /NaN|Infinity/);
  t.diagnostic(`60-node D3 settle: ${first.duration.toFixed(1)}ms cold, ${second.duration.toFixed(1)}ms warm; no continuous simulation after handoff.`);
});

test("Flood deep link initializes approved subject state with eight prose scenes", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.id === "world-research-flood-accessibility")!;
  const scenes = createPublicStory(approvedBundle.research.items, graph, view);
  assert.equal(graph.nodes.find(node => node.id === view.rootNodeId)?.route, "/research/flood-accessibility");
  assert.equal(view.nodeIds.length, 7);
  assert.equal(scenes.length, 8);
  assert.doesNotThrow(() => validateStoryMoments(graph, view, scenes));
  assert.deepEqual(createInitialGraphState(view), { level: "subject", activeViewId: view.id, activeClusterId: "topic-research", activeSubjectId: "research-flood-accessibility", focusedNodeId: "research-flood-accessibility" });
  const plan = createBranchGrowthPlan(view.rootNodeId, view.nodeIds, graph.edges.filter(edge => view.edgeIds.includes(edge.id)));
  assert.equal(plan.unconnectedNodeIds.length, 0);
  assert.equal(plan.branches.filter(branch => branch.nodeId).length, 6);
});

test("public scenes preserve prose without inferring section mappings or alternate road edges", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const view = graph.views.find(view => view.id === "world-research-flood-accessibility")!;
  const scenes = createPublicStory(approvedBundle.research.items, graph, view);
  scenes.forEach((scene, index) => {
    assert.equal(scene.nodeId, approvedBundle.research.items[0].graphNodeId);
    assert.equal(scene.copy, approvedBundle.research.items[0].sections[index].body.join("\n\n"));
    assert.equal(scene.weakenedEdgeIds, undefined);
  });
  assert.equal(getStoryEdgeState(scenes[0], scenes[0].highlightedEdgeIds![0]).kind, "prominent");
  assert.throws(() => validateStoryMoments(graph, view, [{ ...scenes[0], highlightedEdgeIds: ["invented"] }]), /outside its graph view/);
  assert.throws(() => validateStoryMoments(graph, view, [{ ...scenes[0], nodeOffsets: { "research-flood-accessibility": { x: 900, y: 0 } } }]), /bounded/);
});

test("enterSubject and exitSubject retain route guards and cancel cleanly", () => {
  for (const direction of ["enter-subject", "exit-subject"] as const) {
    const started = clusterTransitionReducer(idleClusterTransition, { type: "start", direction, mode: "cinematic", nodeId: "flood-accessibility", originPath: "/research", targetPath: "/research/flood-accessibility" });
    const entering = clusterTransitionReducer(clusterTransitionReducer(started, { type: "route-requested" }), { type: "route-ready" });
    assert.equal(entering.phase, "entering");
    assert.deepEqual(clusterTransitionReducer(entering, { type: "cancel" }), idleClusterTransition);
  }
});

test("story projection keeps edges attached through D3 updates and resets without changing physical nodes", () => {
  const attrs = new Map<string, string>();
  const edge = { dataset: { source: "a", target: "b", edgeId: "ab" }, setAttribute: (key: string, value: string) => attrs.set(key, value) };
  const position = { dataset: { storyPosition: "b" }, setAttribute: () => undefined, removeAttribute: () => undefined };
  const svg = { querySelectorAll: (selector: string) => selector === "[data-force-edge]" ? [edge] : selector === "[data-story-position]" ? [position] : [] } as unknown as SVGSVGElement;
  const nodes = ["a", "b"].map((id, index) => ({ id, kind: "concept" as const, weight: 0.5, isRoot: !index, collisionRadius: 30, x: index * 100, y: index * 50 }));
  const adapter = createSvgGraphAdapter(svg);
  adapter.render(nodes, []);
  applyStoryProjection(svg, new Map([["b", { x: 25, y: -10 }]]));
  assert.equal(attrs.get("d"), "M 0 0 L 125 40");
  assert.equal(nodes[1].x, 100);
  nodes[1].x = 120;
  adapter.render(nodes, []);
  assert.equal(attrs.get("d"), "M 0 0 L 145 40");
  applyStoryProjection(svg, new Map());
  assert.equal(attrs.get("d"), "M 0 0 L 120 50");
  applyIdleProjection(svg, new Map([["a", {x:2,y:1}], ["b", {x:8,y:-3}]]));
  assert.equal(attrs.get("d"), "M 2 1 L 128 47");
  applyStoryProjection(svg, new Map([["b", {x:10,y:20}]]));
  assert.equal(attrs.get("d"), "M 2 1 L 138 67");
  applyIdleProjection(svg, new Map());
  assert.equal(attrs.get("d"), "M 0 0 L 130 70");
  assert.equal(nodes[1].x,120);
});

test("approved release manifest contains seven payloads and the exact graph counts", () => {
  assert.equal(approvedBundle.manifest.assetPolicy, "asset-free");
  assert.equal(approvedBundle.manifest.files.length, 7);
  assert.equal(approvedBundle.graph.nodes.length, 38);
  assert.equal(approvedBundle.graph.edges.length, 50);
  assert.equal(approvedBundle.graph.rootId, "person-adnan");
});

test("public schema rejects unknown fields, versions, assets and incomplete manifests", () => {
  assert.throws(() => parsePublicBundle({ ...approvedBundle, assets: [] }), /allowed schema field/);
  assert.throws(() => parsePublicBundle({ ...approvedBundle, manifest: { ...approvedBundle.manifest, schemaVersion: "2.0.0" } }), /schemaVersion/);
  assert.throws(() => parsePublicBundle({ ...approvedBundle, manifest: { ...approvedBundle.manifest, releaseVersion: "other-release" } }), /releaseVersion/);
  assert.throws(() => parsePublicBundle({ ...approvedBundle, manifest: { ...approvedBundle.manifest, assetPolicy: "images" } }), /assetPolicy/);
  assert.throws(() => parsePublicBundle({ ...approvedBundle, manifest: { ...approvedBundle.manifest, files: approvedBundle.manifest.files.slice(1) } }), /seven payload/);
});

test("public schema rejects broken topology, duplicate IDs and invented section mappings", () => {
  const duplicate = structuredClone(approvedBundle);
  duplicate.graph.nodes[1].id = duplicate.graph.nodes[0].id;
  assert.throws(() => parsePublicBundle(duplicate), /unique/);
  const dangling = structuredClone(approvedBundle);
  dangling.graph.edges[0].target = "missing";
  assert.throws(() => parsePublicBundle(dangling), /existing distinct nodes/);
  const section = structuredClone(approvedBundle);
  section.research.items[0].sections[0].graphNodeId = "not-approved";
  assert.throws(() => parsePublicBundle(section), /existing public node/);
  const links = structuredClone(approvedBundle);
  links.profile.links[0].url = "javascript:alert(1)";
  assert.throws(() => parsePublicBundle(links), /HTTPS or email/);
});

test("adapter preserves every approved label, summary, status and directed relationship", () => {
  const before = JSON.stringify(approvedBundle.graph);
  const graph = adaptPublicGraph(approvedBundle.graph);
  assert.equal(JSON.stringify(approvedBundle.graph), before);
  assert.equal(graph.nodes.length, 38);
  assert.equal(graph.edges.length, 50);
  approvedBundle.graph.nodes.forEach(source => {
    const node = graph.nodes.find(node => node.id === source.id)!;
    for (const field of ["label", "summary", "depth", "importance", "category", "displayStatus"] as const) assert.equal(node[field], source[field]);
  });
  assert.deepEqual(graph.edges, approvedBundle.graph.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, relation: edge.relationship })));
  assert.equal(new Set(graph.views.flatMap(view => view.nodeIds)).size, 38);
  assert.equal(new Set(graph.views.flatMap(view => view.edgeIds)).size, 50);
  graph.views.forEach(view => assert.doesNotThrow(() => validateStoryMoments(graph, view, [{ nodeId: view.rootNodeId, title: view.label, copy: "Test" }])));
});

test("workflow branches stay separate and Hermes has no Local AI connection", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  const connections = graph.edges.filter(edge => edge.source === "project-knowledge-workflows");
  assert.deepEqual(new Set(connections.map(edge => edge.target)), new Set(["theme-research-workflows", "theme-knowledge-management"]));
  assert.ok(connections.every(edge => edge.relation === "explores"));
  for (const pair of [["theme-research-workflows", "theme-knowledge-management"], ["tool-hermes", "experiment-local-ai"]]) {
    assert.ok(!graph.edges.some(edge => pair.includes(edge.source) && pair.includes(edge.target)));
  }
});

test("route policy exposes only the ten approved URLs and leaves Engineering unrouted", () => {
  assert.deepEqual(publicRoutes.map(route => route.path), ["/", "/about", "/research", "/research/flood-accessibility", "/projects", "/projects/nothipotro", "/projects/knowledge-workflows", "/ai", "/leadership", "/learning"]);
  assert.equal(adaptPublicGraph(approvedBundle.graph).nodes.find(node => node.id === "topic-engineering")?.route, undefined);
});

test("all collection stories retain exact prose, status and only explicit item/section mappings", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  for (const key of ["research", "projects", "ai", "leadership", "learning"] as const) {
    const path = `/${key}`;
    const route = publicRoutes.find(route => route.path === path)!;
    const view = graph.views.find(view => view.id === route.viewId)!;
    for (const item of approvedBundle[key].items) {
      const scenes = createPublicStory([item], graph, view);
      scenes.forEach((scene, index) => {
        const section = item.sections[index];
        assert.equal(scene.title, section.heading);
        assert.equal(scene.copy, section.body.join("\n\n"));
        assert.equal(scene.displayStatus, section.displayStatus);
        assert.equal(scene.nodeId, section.graphNodeId ?? item.graphNodeId);
      });
    }
  }
});

test("initial public geometry has stable subpixel serialization across runtimes", () => {
  const graph = adaptPublicGraph(approvedBundle.graph);
  for (const view of graph.views) {
    const nodes = createStableGraphNodes(graph.nodes.filter(node => view.nodeIds.includes(node.id)), view.rootNodeId);
    for (const node of nodes) {
      assert.ok(typeof node.x === "number" && typeof node.y === "number");
      assert.equal(node.x, Number(node.x.toFixed(4)));
      assert.equal(node.y, Number(node.y.toFixed(4)));
    }
  }
});
