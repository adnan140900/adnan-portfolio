// Uses the existing external Playwright/Core installation; no app dependency.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3000";
const output = path.resolve("docs/qa");
const mobileViewports = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 430, height: 932 }];
const cases = [
  { route: "/research", scene: "Flood Accessibility", name: "research-flood" },
  { route: "/research/flood-accessibility", scene: "Validation", name: "flood-accessibility-validation" },
  { route: "/projects", scene: "Nothipotro", name: "projects-nothipotro" },
  { route: "/projects/nothipotro", scene: "Student Learning Needs", name: "nothipotro-student-needs" },
  { route: "/ai", scene: "AI Agents", name: "ai-agents" },
  { route: "/leadership", scene: "Public Speaking", name: "leadership-public-speaking" },
  { route: "/learning", scene: "Learning Through Projects", name: "learning-through-projects" },
  { route: "/about", scene: "Flood Accessibility", name: "about-flood-accessibility" },
];
const results = [], errors = [];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });

async function context(viewport, reducedMotion = "no-preference") {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500, reducedMotion });
  const page = await ctx.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return { ctx, page };
}

async function inspect(page) {
  return page.evaluate(() => {
    const current = document.querySelector('[data-film-seek][aria-current="step"]');
    const root = document.querySelector('[data-qa-target-film="true"]') ?? current?.closest('[data-branch-persistent="true"]') ?? document.querySelector('[data-branch-persistent="true"]');
    if (!root) throw new Error("Missing persistent branch root");
    const panel = root.querySelector('[data-film-current="true"]') ?? root.querySelector('[data-film-panel]');
    const title = panel.querySelector('[data-film-title]');
    const labels = [...root.querySelectorAll('.knowledge-star-label,.projection-label')]
      .filter(label => Number.parseFloat(getComputedStyle(label).opacity) > 0.05)
      .map(label => ({ text: label.textContent?.trim() ?? "", rect: label.getBoundingClientRect().toJSON(),
        role: label.closest('[data-compact-label-role]')?.getAttribute('data-compact-label-role') ?? null }));
    const overlaps = [];
    for (let left = 0; left < labels.length; left++) for (let right = left + 1; right < labels.length; right++) {
      const a = labels[left].rect, b = labels[right].rect;
      if (Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)) overlaps.push([labels[left].text, labels[right].text]);
    }
    const graphInk = [...root.querySelectorAll('[data-compact-label="visible"] .knowledge-star-label,[data-compact-label="visible"] .projection-label,.knowledge-star-core,[data-projection-core]')]
      .map(element => element.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
    const titleRect = title.getBoundingClientRect();
    const graphBottom = Math.max(...graphInk.map(rect => rect.bottom));
    const active = root.querySelector('[data-story-active="true"]');
    const primaryLinks = [...document.querySelectorAll('.primary-navigation a')];
    const sceneLinks = [...root.querySelectorAll('[data-film-seek]')];
    return {
      activeId: active?.getAttribute('data-node-id') ?? active?.getAttribute('data-projection-node'),
      activeVisible: active?.getAttribute('data-compact-label') === 'visible',
      activeAccessible: Boolean(active?.querySelector('[aria-label]')) || Boolean(root.querySelector('.sr-only[aria-label="Projected public relationships"]')),
      edgeCount: root.querySelectorAll('[data-force-edge]').length,
      gap: titleRect.top - graphBottom,
      labelCount: labels.length,
      labels: labels.map(label => ({ text: label.text, role: label.role })),
      nodeCount: root.querySelectorAll('[data-force-node],[data-projection-node]').length,
      overlaps,
      overflow: document.documentElement.scrollWidth > innerWidth,
      primaryTouch: Math.min(...primaryLinks.map(link => link.getBoundingClientRect().height)),
      sceneTouch: Math.min(...sceneLinks.map(link => link.getBoundingClientRect().height)),
      titleFont: Number.parseFloat(getComputedStyle(title).fontSize),
      titleLines: Math.round(titleRect.height / Number.parseFloat(getComputedStyle(title).lineHeight)),
    };
  });
}

try {
  for (const viewport of mobileViewports) {
    const { ctx, page } = await context(viewport);
    for (const entry of cases) {
      await page.goto(origin + entry.route, { waitUntil: "networkidle", timeout: 60000 });
      const seek = page.locator('[data-film-seek]').filter({ hasText: entry.scene }).first();
      await seek.click({ force: true });
      await seek.evaluate(link => { link.closest('[data-branch-persistent="true"]')?.setAttribute('data-qa-target-film', 'true'); });
      await page.waitForTimeout(1200);
      const result = await inspect(page);
      assert.equal(result.activeVisible, true, `${entry.name}: active label hidden`);
      assert.equal(result.overlaps.length, 0, `${entry.name}: ${JSON.stringify(result.overlaps)}`);
      assert.ok(result.labelCount >= 1 && result.labelCount <= 4, `${entry.name}: ${result.labelCount} visible labels`);
      assert.ok(result.gap >= 32 && result.gap <= 120, `${entry.name}: ${result.gap}px graph/title gap`);
      assert.ok(result.titleFont >= 28 && result.titleFont <= 34, `${entry.name}: ${result.titleFont}px title`);
      assert.ok(result.titleLines <= 3, `${entry.name}: ${result.titleLines} title lines`);
      assert.equal(result.overflow, false, `${entry.name}: horizontal overflow`);
      assert.ok(result.primaryTouch >= 44 && result.sceneTouch >= 44, `${entry.name}: touch target`);
      assert.ok(result.activeAccessible, `${entry.name}: active semantics unavailable`);
      await page.screenshot({ path: path.join(output, `phase-14a-${entry.name}-${viewport.width}x${viewport.height}.png`) });
      results.push({ viewport, ...entry, ...result, result: "PASS" });
    }
    await ctx.close();
  }

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    const { ctx, page } = await context(viewport);
    await page.goto(origin + "/ai", { waitUntil: "networkidle" });
    await page.locator('[data-film-seek]').filter({ hasText: "AI Agents" }).first().click({ force: true });
    await page.waitForTimeout(1200);
    const desktop = await page.evaluate(() => ({ compactLabels: document.querySelectorAll('[data-compact-label]').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      sceneFont: Number.parseFloat(getComputedStyle(document.querySelector('[data-film-current="true"] [data-film-title]')).fontSize) }));
    assert.equal(desktop.compactLabels, 0); assert.equal(desktop.overflow, false);
    await page.screenshot({ path: path.join(output, `phase-14a-desktop-ai-${viewport.width}x${viewport.height}.png`) });
    results.push({ viewport, desktop, result: "PASS" }); await ctx.close();
  }

  for (const reduced of [false, true]) {
    const { ctx, page } = await context({ width: 390, height: 844 }, reduced ? "reduce" : "no-preference");
    await page.goto(origin + "/", { waitUntil: "networkidle" });
    await page.waitForFunction(reducedMotion => {
      const root = document.querySelector('.discovery-hero [data-graph-root]');
      return reducedMotion ? root?.getAttribute('data-reduced-motion') === 'true' : root?.dataset.universeMotion === 'rest';
    }, reduced);
    const home = await page.evaluate(() => ({ nodes: document.querySelectorAll('.discovery-hero [data-force-node],.discovery-hero [data-universe-node]').length,
      edges: document.querySelectorAll('.discovery-hero [data-force-edge],.discovery-hero [data-universe-edge]').length,
      compactLabels: document.querySelectorAll('.discovery-hero [data-compact-label]').length,
      overflow: document.documentElement.scrollWidth > innerWidth }));
    assert.deepEqual(home, { nodes: 38, edges: 50, compactLabels: 0, overflow: false });
    results.push({ home, reduced, result: "PASS" }); await ctx.close();
  }

  const { ctx, page } = await context({ width: 390, height: 844 }, "reduce");
  await page.goto(origin + "/leadership", { waitUntil: "networkidle" });
  await page.locator('[data-film-seek]').filter({ hasText: "Public Speaking" }).first().click({ force: true });
  await page.waitForTimeout(400);
  const reduced = await inspect(page);
  assert.equal(reduced.activeVisible, true); assert.equal(reduced.overlaps.length, 0); assert.equal(reduced.overflow, false);
  results.push({ reducedMotion: true, ...reduced, result: "PASS" }); await ctx.close();

  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, "phase-14a-results.json"), JSON.stringify({ result: "PASS", scenarios: results.length, results, errors }, null, 2));
  console.log(`PASS Phase 14A: ${results.length} scenarios, ${errors.length} browser errors`);
} finally {
  await browser.close();
}
