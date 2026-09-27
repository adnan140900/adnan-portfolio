import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3000";
const output = path.resolve("docs/qa");
const expected = {
  headline: "YOU’VE ENTERED THE MULTIVERSE OF ADNAN",
  support: "Every node is a fragment of who I am —\nprojects, research, ideas, stories, and obsessions.",
  cta: "Choose a node to begin exploring.",
};
const errors = [];
const results = [];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
]) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.waitForTimeout(5600);
  const metrics = await page.evaluate(expectedCopy => {
    const hero = document.querySelector(".discovery-hero");
    const graph = document.querySelector(".home-universe-frame > .constellation-shell");
    const copy = document.querySelector(".public-world-copy");
    const headline = document.querySelector('[data-home-copy="headline"]');
    const support = document.querySelector('[data-home-copy="support"]');
    const cta = document.querySelector('[data-home-copy="cta"]');
    if (!(hero && graph && copy && headline && support && cta)) throw new Error("Missing Home universe or copy region");
    const normalized = value => value?.replace(/\s+/g, " ").trim();
    const accessibleText = element => normalized(element.querySelector(".sr-only")?.textContent);
    const graphRect = graph.getBoundingClientRect(), copyRect = copy.getBoundingClientRect();
    return {
      copy: { headline: accessibleText(headline), support: accessibleText(support), cta: accessibleText(cta) },
      expected: { headline: expectedCopy.headline, support: normalized(expectedCopy.support), cta: expectedCopy.cta },
      sizes: { headline: parseFloat(getComputedStyle(headline).fontSize), support: parseFloat(getComputedStyle(support).fontSize), cta: parseFloat(getComputedStyle(cta).fontSize), ctaWeight: Number(getComputedStyle(cta).fontWeight) },
      placement: { graphBottom: graphRect.bottom, copyTop: copyRect.top, gap: copyRect.top - graphRect.bottom },
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      nodes: hero.querySelectorAll("[data-force-node], [data-universe-node]").length,
      edges: hero.querySelectorAll("[data-force-edge], [data-universe-edge]").length,
      overlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
      bodyLength: document.body.innerText.trim().length,
      stage: hero.getAttribute("data-hero-stage"),
    };
  }, expected);
  assert.deepEqual(metrics.copy, metrics.expected);
  assert.ok(metrics.sizes.headline > metrics.sizes.support);
  assert.ok(metrics.sizes.ctaWeight >= 700);
  assert.ok(metrics.placement.gap >= -1);
  assert.ok(metrics.overflow <= 0);
  assert.equal(metrics.nodes, 38);
  assert.equal(metrics.edges, 50);
  assert.equal(metrics.overlay, false);
  assert.ok(metrics.bodyLength > 0);
  await page.screenshot({ path: path.join(output, `phase-14a-home-multiverse-${viewport.width}x${viewport.height}.png`), fullPage: false });

  const distance = await page.locator("[data-universe-scroll-distance]").getAttribute("data-universe-scroll-distance");
  await page.evaluate(value => scrollTo(0, Number(value) * 0.95), distance);
  await page.waitForTimeout(250);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(500);
  const reconstructed = await page.evaluate(() => ({
    progress: document.querySelector("[data-universe-progress]")?.getAttribute("data-universe-progress"),
    nodes: document.querySelector(".discovery-hero")?.querySelectorAll("[data-force-node], [data-universe-node]").length,
    edges: document.querySelector(".discovery-hero")?.querySelectorAll("[data-force-edge], [data-universe-edge]").length,
  }));
  assert.deepEqual(reconstructed, { progress: "0.0000", nodes: 38, edges: 50 });
  results.push({ viewport, ...metrics, reconstructed });
  await context.close();
}

await browser.close();
assert.deepEqual(errors, []);
await fs.writeFile(path.join(output, "phase-14a-home-copy-results.json"), `${JSON.stringify({ status: "PASS", errors, results }, null, 2)}\n`);
console.log(`PASS Home copy QA: ${results.length} viewports, ${errors.length} browser errors`);
