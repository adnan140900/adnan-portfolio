import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const { chromium, webkit } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3000";
const output = path.resolve("docs/qa");
const errors = [];
const results = [];
await fs.mkdir(output, { recursive: true });

const matrix = [
  { engine: "webkit", viewport: { width: 375, height: 667 }, name: "webkit-iphone-7" },
  { engine: "webkit", viewport: { width: 428, height: 926 }, name: "webkit-iphone-12-pro-max" },
  { engine: "webkit", viewport: { width: 820, height: 1180 }, name: "webkit-ipad-air-portrait" },
  { engine: "webkit", viewport: { width: 1180, height: 820 }, name: "webkit-ipad-air-landscape" },
  { engine: "chromium", viewport: { width: 390, height: 844 }, name: "chromium-mobile" },
  { engine: "chromium", viewport: { width: 1440, height: 900 }, name: "chromium-desktop" },
];

function watch(page, scope) {
  page.on("pageerror", error => errors.push(`${scope}: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`${scope}: ${message.text()}`); });
}

async function geometry(page, rootSelector = ".discovery-hero") {
  return page.evaluate(selector => {
    const root = document.querySelector(selector);
    const svg = root?.querySelector("svg.force-graph-svg");
    if (!(root && svg instanceof SVGSVGElement)) throw new Error(`Missing graph: ${selector}`);
    const screenPoint = (element, point = { x: 0, y: 0 }) => {
      const matrix = element.getScreenCTM();
      if (!matrix) throw new Error("Missing SVG screen matrix");
      const result = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: result.x, y: result.y };
    };
    const groups = [...svg.querySelectorAll("[data-force-node]")];
    const points = new Map();
    const controls = groups.map(group => {
      const id = group.getAttribute("data-node-id");
      const body = group.querySelector("[data-scene-body]");
      const anchor = group.querySelector("[data-transition-anchor]") ?? group.querySelector(".knowledge-star-core");
      const hit = group.querySelector(".knowledge-star-hit");
      if (!(id && body instanceof SVGGraphicsElement && (anchor instanceof SVGGraphicsElement || anchor instanceof SVGCircleElement))) throw new Error(`Incomplete native control: ${id}`);
      const expected = screenPoint(body);
      const rect = anchor.getBoundingClientRect();
      const actual = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      points.set(id, expected);
      return { id, actual, expected, error: Math.hypot(actual.x - expected.x, actual.y - expected.y), hit: hit?.getBoundingClientRect().width ?? 0 };
    });
    for (const group of svg.querySelectorAll("[data-universe-node]")) {
      const id = group.getAttribute("data-universe-node");
      const body = group.querySelector("[data-universe-body]");
      if (id && body instanceof SVGGraphicsElement) points.set(id, screenPoint(body));
    }
    const edgeErrors = [...svg.querySelectorAll("[data-force-edge], [data-universe-edge]")].flatMap(path => {
      if (!(path instanceof SVGPathElement)) return [];
      const source = points.get(path.dataset.source), target = points.get(path.dataset.target);
      if (!(source && target)) return [];
      const start = screenPoint(path, path.getPointAtLength(0));
      const end = screenPoint(path, path.getPointAtLength(path.getTotalLength()));
      return [Math.hypot(start.x - source.x, start.y - source.y), Math.hypot(end.x - target.x, end.y - target.y)];
    });
    const rect = svg.getBoundingClientRect();
    const xs = controls.map(control => control.actual.x), ys = controls.map(control => control.actual.y);
    const activeId = svg.dataset.activeSemanticNode ?? null;
    const tracer = svg.querySelector(".semantic-focus-tracer");
    let tracerError = null;
    if (activeId && tracer instanceof SVGCircleElement && points.has(activeId)) {
      const center = screenPoint(tracer, { x: tracer.cx.baseVal.value, y: tracer.cy.baseVal.value });
      const active = points.get(activeId);
      tracerError = Math.hypot(center.x - active.x, center.y - active.y);
    }
    const topLeft = controls.filter(control => control.actual.x < rect.left + rect.width * 0.2 && control.actual.y < rect.top + rect.height * 0.2).length;
    const unique = new Set(controls.map(control => `${Math.round(control.actual.x / 8)}:${Math.round(control.actual.y / 8)}`)).size;
    return {
      controlCount: controls.length,
      controls,
      edgeMaxError: Math.max(0, ...edgeErrors),
      heightSpread: (Math.max(...ys) - Math.min(...ys)) / rect.height,
      maxControlError: Math.max(...controls.map(control => control.error)),
      minHitTarget: Math.min(...controls.map(control => control.hit)),
      nodeCount: root.querySelectorAll("[data-force-node], [data-universe-node]").length,
      edgeCount: root.querySelectorAll("[data-force-edge], [data-universe-edge]").length,
      topLeft,
      unique,
      widthSpread: (Math.max(...xs) - Math.min(...xs)) / rect.width,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      foreignObjects: root.querySelectorAll("foreignObject").length,
      compactLabels: Number(svg.dataset.compactLabelCount ?? 0),
      activeId,
      tracerError,
    };
  }, rootSelector);
}

function assertDistributed(value, expectedControls) {
  assert.equal(value.controlCount, expectedControls);
  assert.equal(value.foreignObjects, 0);
  assert.ok(value.widthSpread > 0.3, `width spread ${value.widthSpread}`);
  assert.ok(value.heightSpread > 0.25, `height spread ${value.heightSpread}`);
  assert.ok(value.maxControlError < 3, `control error ${value.maxControlError}`);
  assert.ok(value.minHitTarget >= 44, `hit target ${value.minHitTarget}`);
  assert.ok(value.edgeMaxError < 3, `edge error ${value.edgeMaxError}`);
  assert.ok(value.unique >= Math.max(3, expectedControls - 1));
  assert.ok(value.topLeft <= 1);
  assert.ok(value.overflow <= 0);
}

const browsers = {
  chromium: await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true }),
  webkit: await webkit.launch({ headless: true }),
};

for (const scenario of matrix) {
  const context = await browsers[scenario.engine].newContext({ viewport: scenario.viewport, isMobile: scenario.viewport.width < 500, hasTouch: scenario.viewport.width < 500 });
  const page = await context.newPage();
  watch(page, scenario.name);
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  if (scenario.name === "webkit-iphone-12-pro-max") {
    await page.screenshot({ path: path.join(output, "phase-14b-webkit-home-fresh.png") });
    await page.waitForTimeout(2100);
    await page.screenshot({ path: path.join(output, "phase-14b-webkit-home-genesis-mid.png") });
  }
  await page.waitForTimeout(scenario.name === "webkit-iphone-12-pro-max" ? 4400 : 6400);
  const rest = await geometry(page);
  assertDistributed(rest, 7);
  assert.equal(rest.nodeCount, 38);
  assert.equal(rest.edgeCount, 50);
  assert.equal(await page.locator(".discovery-hero [data-control-node]").count(), 7);
  assert.ok(await page.locator('.discovery-hero a[data-control-node][href]').count() >= 5);
  assert.ok(await page.locator(".discovery-hero svg").getByRole("link").count() >= 5);
  await page.screenshot({ path: path.join(output, `phase-14b-${scenario.name}-${scenario.viewport.width}x${scenario.viewport.height}.png`) });

  const nonRouted = page.locator('.discovery-hero [role="button"][data-control-node]').first();
  await nonRouted.focus();
  await page.keyboard.press("Space");
  assert.equal(await nonRouted.getAttribute("aria-pressed"), "true");

  const distance = Number(await page.locator("[data-universe-scroll-distance]").getAttribute("data-universe-scroll-distance"));
  await page.evaluate(value => scrollTo(0, value * 0.55), distance);
  await page.waitForTimeout(180);
  const partial = Number(await page.locator("[data-universe-progress]").getAttribute("data-universe-progress"));
  assert.ok(partial > 0.48 && partial < 0.62);
  if (scenario.name === "webkit-iphone-12-pro-max") await page.screenshot({ path: path.join(output, "phase-14b-webkit-home-partial-dissolution.png") });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(500);
  const reconstructed = await geometry(page);
  assertDistributed(reconstructed, 7);
  assert.equal(await page.locator("[data-universe-progress]").getAttribute("data-universe-progress"), "0.0000");
  if (scenario.name === "webkit-iphone-12-pro-max") await page.screenshot({ path: path.join(output, "phase-14b-webkit-home-reconstructed.png") });
  results.push({ type: "home", ...scenario, rest, partial, reconstructed });
  await context.close();
}

for (const route of ["research", "projects", "ai", "leadership", "learning"]) {
  const context = await browsers.webkit.newContext({ viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page, `webkit-${route}`);
  await page.goto(`${origin}/${route}`, { waitUntil: "networkidle" });
  const film = page.locator(".semantic-film").first();
  await film.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const value = await geometry(page, ".semantic-film");
  assert.equal(value.foreignObjects, 0);
  assert.ok(value.maxControlError < 3);
  assert.ok(value.edgeMaxError < 3);
  assert.ok(value.minHitTarget >= 44);
  assert.ok(value.unique >= Math.max(3, value.controlCount - 1));
  assert.ok(value.topLeft <= 1);
  assert.ok(value.compactLabels >= 1 && value.compactLabels <= 4);
  assert.ok(value.activeId);
  assert.ok(value.tracerError !== null && value.tracerError < 3);
  results.push({ type: "branch", route: `/${route}`, value });
  await context.close();
}

{
  const context = await browsers.webkit.newContext({ viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page, "webkit-route-activation");
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.waitForTimeout(6400);
  const researchLink = page.locator('.discovery-hero a[data-control-node][href="/research"]');
  await researchLink.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(`${origin}/research`, { timeout: 10000 });
  assert.equal(new URL(page.url()).pathname, "/research");
  results.push({ type: "navigation", engine: "webkit", destination: "/research", result: "PASS" });
  await context.close();
}

await Promise.all(Object.values(browsers).map(browser => browser.close()));
assert.deepEqual(errors, []);
await fs.writeFile(path.join(output, "phase-14b-results.json"), `${JSON.stringify({ status: "PASS", errors, results }, null, 2)}\n`);
console.log(`PASS Phase 14B: ${results.length} scenarios, ${errors.length} browser errors`);
