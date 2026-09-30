import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { chromium, webkit } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3015";
const routes = [
  "/research",
  "/research/flood-accessibility",
  "/projects",
  "/projects/nothipotro",
  "/projects/knowledge-workflows",
  "/ai",
  "/leadership",
  "/learning",
];
const matrix = [
  { name: "chromium-desktop", browser: chromium, viewport: { width: 1440, height: 900 }, launch: { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true } },
  { name: "chromium-android", browser: chromium, viewport: { width: 390, height: 844 }, launch: { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true } },
  { name: "webkit-desktop", browser: webkit, viewport: { width: 1180, height: 820 }, launch: { headless: true } },
  { name: "webkit-mobile", browser: webkit, viewport: { width: 428, height: 926 }, launch: { headless: true } },
];

const results = [];
for (const entry of matrix) {
  const browser = await entry.browser.launch(entry.launch);
  try {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: entry.viewport, reducedMotion: "no-preference" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      const response = await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded" });
      assert.equal(response?.status(), 200, `${entry.name} ${route} status`);
      await page.waitForSelector("[data-branch-persistent='true'] svg", { state: "attached" });
      await page.waitForFunction(() => document.querySelector("[data-branch-persistent='true']")?.getAttribute("data-active-film-scene") === "0");

      const seekCount = await page.locator("[data-film-seek]").count();
      const targetScene = seekCount > 1 ? "1" : "0";
      if (seekCount > 1) {
        await page.locator("[data-film-seek]").nth(1).evaluate(element => element.click());
        await page.waitForFunction(() => document.querySelector("[data-branch-persistent='true']")?.getAttribute("data-active-film-scene") === "1");
        await page.waitForTimeout(360);
      }

      const forward = await page.evaluate(() => {
        const film = document.querySelector("[data-branch-persistent='true']");
        const svg = film?.querySelector("svg");
        if (!(film instanceof HTMLElement && svg instanceof SVGSVGElement)) throw new Error("Missing persistent branch stage");
        const activeId = svg.dataset.activeSemanticNode ?? "";
        const active = [...svg.querySelectorAll("[data-node-id], [data-projection-node]")].find(node =>
          node.getAttribute("data-node-id") === activeId || node.getAttribute("data-projection-node") === activeId);
        const ring = svg.querySelector(".semantic-focus-tracer");
        const activeLabel = active?.querySelector(".knowledge-star-label, .projection-label");
        const labelRect = activeLabel?.getBoundingClientRect();
        let tracerError = null;
        if (active instanceof SVGGraphicsElement && ring instanceof SVGCircleElement) {
          const core = active.querySelector(".knowledge-star-core, [data-projection-core]");
          if (core instanceof SVGGraphicsElement) {
            const nodeRect = core.getBoundingClientRect(), ringRect = ring.getBoundingClientRect();
            tracerError = Math.hypot(
              nodeRect.left + nodeRect.width / 2 - (ringRect.left + ringRect.width / 2),
              nodeRect.top + nodeRect.height / 2 - (ringRect.top + ringRect.height / 2),
            );
          }
        }
        return {
          scene: film.dataset.activeFilmScene,
          activeId,
          nodeCount: svg.querySelectorAll("[data-force-node], [data-projection-node]").length,
          edgeCount: svg.querySelectorAll("[data-force-edge]").length,
          foreignObjects: svg.querySelectorAll("foreignObject").length,
          tracerOpacity: ring?.getAttribute("opacity") ?? "0",
          tracerDash: ring instanceof SVGElement ? getComputedStyle(ring).strokeDashoffset : "",
          tracerError,
          activeLabelReadable: Boolean(activeLabel && labelRect && labelRect.width > 0 && labelRect.height > 0 && Number(getComputedStyle(activeLabel).opacity || 1) > 0.3),
          incidentEdges: svg.querySelectorAll("[data-force-edge][data-story-incident='true']").length,
          overlay: Boolean(document.querySelector("[data-nextjs-dialog], #webpack-dev-server-client-overlay")),
        };
      });
      assert.equal(forward.scene, targetScene);
      assert.ok(forward.activeId, `${entry.name} ${route} active semantic node`);
      assert.ok(forward.nodeCount > 0 && forward.edgeCount > 0, `${entry.name} ${route} semantic geometry`);
      assert.equal(forward.foreignObjects, 0, `${entry.name} ${route} native SVG`);
      assert.equal(forward.overlay, false, `${entry.name} ${route} error overlay`);
      assert.ok(Number(forward.tracerOpacity) >= 0.63, `${entry.name} ${route} settled tracer opacity`);
      assert.ok(forward.tracerError === null || forward.tracerError < 0.75, `${entry.name} ${route} tracer alignment`);
      assert.equal(forward.activeLabelReadable, true, `${entry.name} ${route} active label readability`);
      assert.ok(forward.incidentEdges > 0, `${entry.name} ${route} incident edge emphasis`);

      if (seekCount > 1) {
        await page.locator("[data-film-seek]").first().evaluate(element => element.click());
        await page.waitForFunction(() => document.querySelector("[data-branch-persistent='true']")?.getAttribute("data-active-film-scene") === "0");
        await page.waitForTimeout(360);
      }
      assert.deepEqual(errors, [], `${entry.name} ${route} browser errors`);
      results.push({ engine: entry.name, route, scenes: seekCount, ...forward, reverse: seekCount > 1 ? "pass" : "not-applicable" });
      await page.close();
    }
    const home = await browser.newPage({ viewport: entry.viewport, reducedMotion: "no-preference" });
    const homeErrors = [];
    home.on("pageerror", error => homeErrors.push(error.message));
    home.on("console", message => { if (message.type() === "error") homeErrors.push(message.text()); });
    const homeResponse = await home.goto(origin, { waitUntil: "domcontentloaded" });
    assert.equal(homeResponse?.status(), 200, `${entry.name} Home status`);
    await home.waitForSelector(".discovery-hero svg.force-graph-svg", { state: "attached" });
    const homeState = await home.evaluate(() => ({
      nodes: document.querySelectorAll(".discovery-hero [data-force-node], .discovery-hero [data-universe-node]").length,
      edges: document.querySelectorAll(".discovery-hero [data-force-edge], .discovery-hero [data-universe-edge]").length,
      tracers: document.querySelectorAll(".discovery-hero .semantic-focus-tracer").length,
      overlay: Boolean(document.querySelector("[data-nextjs-dialog], #webpack-dev-server-client-overlay")),
    }));
    assert.deepEqual(homeState, { nodes: 38, edges: 50, tracers: 0, overlay: false }, `${entry.name} frozen Home universe`);
    assert.deepEqual(homeErrors, [], `${entry.name} Home browser errors`);
    results.push({ engine: entry.name, route: "/", home: true, ...homeState });
    await home.close();
  } finally {
    await browser.close();
  }
}

console.log(JSON.stringify({ status: "PASS", scenarios: results.length, results }, null, 2));
