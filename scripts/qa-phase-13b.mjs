/* Optional local QA using existing browser tooling; no application dependency. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const loadTool = createRequire(import.meta.url);
const { chromium } = loadTool(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3000";
const directory = path.resolve("docs/qa");
const errors = [], results = [];
const root = '.discovery-hero [data-graph-root]';

async function state(page) {
  return page.locator(root).evaluate(root => ({
    phase: root.dataset.universeMotion, progress: Number(root.dataset.universeProgress), distance: Number(root.dataset.universeScrollDistance),
    cycle: Number(root.closest('.discovery-hero').dataset.heroCycle),
    runs: Number(document.querySelector('.discovery-hero h1 .decode-text').dataset.decodeRuns),
    typing: document.querySelector('.discovery-hero h1 .decode-text').dataset.decoding,
    jobs: Number(document.documentElement.dataset.decodeJobs || 0), idle: root.dataset.idleSeconds,
    base: [...root.querySelectorAll('[data-force-node], [data-universe-node]')].map(e => e.getAttribute('transform')),
    offsets: [...root.querySelectorAll('[data-story-position]')].map(e => e.getAttribute('transform')),
    bodies: [...root.querySelectorAll('[data-universe-body]')].map(e => [e.getAttribute('transform'), e.getAttribute('opacity')]),
    edges: [...root.querySelectorAll('[data-force-edge], [data-universe-edge]')].map(e => [e.style.strokeDashoffset, e.style.visibility]),
    caret: root.closest('.discovery-hero').querySelectorAll('[data-decoding="true"] [data-type-caret="true"]').length,
  }));
}
async function seek(page, p) {
  const { distance } = await state(page);
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), p * distance);
  await page.waitForTimeout(90);
}
async function wheel(page, p, ms = 2600) {
  const { distance } = await state(page), start = await page.evaluate(() => scrollY), steps = Math.ceil(ms / 50);
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, (p * distance - start) / steps); await page.waitForTimeout(50); }
  await seek(page, p);
}
async function settled(page) {
  await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'rest');
  await page.waitForFunction(() => document.querySelector('.discovery-hero h1 .decode-text')?.dataset.decoding === 'false');
  await page.waitForTimeout(300);
}
async function assertRest(page, base) {
  const s = await state(page);
  assert.equal(s.phase, 'rest'); assert.equal(s.bodies.length, 38); assert.equal(s.edges.length, 50);
  assert.deepEqual(s.base, base); assert.ok(s.bodies.every(b => b[0] === null && b[1] === null));
  assert.ok(s.edges.every(e => e[0] === '' && e[1] === '')); assert.equal(s.caret, 0); assert.equal(s.jobs, 0);
  const endpointErrors = await page.locator(root).evaluate(root => {
    const points = new Map([...root.querySelectorAll('[data-force-node], [data-universe-node]')].map(e => {
      const b = e.transform.baseVal.consolidate()?.matrix, o = e.querySelector('[data-story-position]').transform.baseVal.consolidate()?.matrix;
      return [e.dataset.nodeId || e.dataset.universeNode, { x: (b?.e || 0) + (o?.e || 0), y: (b?.f || 0) + (o?.f || 0) }];
    }));
    return [...root.querySelectorAll('[data-force-edge], [data-universe-edge]')].filter(e => {
      const a = points.get(e.dataset.source), b = points.get(e.dataset.target), s = e.getPointAtLength(0), t = e.getPointAtLength(e.getTotalLength());
      return Math.hypot(a.x - s.x, a.y - s.y) > 0.02 || Math.hypot(b.x - t.x, b.y - t.y) > 0.02;
    }).length;
  });
  assert.equal(endpointErrors, 0);
}
function observeErrors(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
}
async function capture(context, page, filename) {
  const video = page.video(); await page.close(); await context.close();
  const temporary = await video.path(); await video.saveAs(path.join(directory, filename));
  if (temporary !== path.join(directory, filename)) await fs.unlink(temporary);
}
async function touchSwipe(page, from, to) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 345, y: from }] });
  for (let i = 1; i <= 16; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 345, y: from + (to - from) * i / 16 }] }); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach();
}

await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const kind of ['desktop', 'mobile', 'replay-stress']) {
    const mobile = kind === 'mobile', viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
    const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile, recordVideo: { dir: directory, size: viewport } });
    const page = await context.newPage(); observeErrors(page);
    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'genesis');
    assert.equal((await state(page)).typing, 'false', 'text waits for nodes');
    await settled(page); await page.waitForTimeout(5000);
    const original = await state(page); assert.equal(original.runs, 1);
    await assertRest(page, original.base);
    if (kind !== 'replay-stress') await page.screenshot({ path: path.join(directory, `phase-13b-rest-${mobile ? '390x844' : '1440x900'}.png`) });
    // Near-top and partial reversals must not re-arm text.
    for (const p of [0.01, 0, 0.4, 0.2, 0.8, 0.4, 0]) await seek(page, p);
    assert.equal((await state(page)).runs, original.runs);
    const cycles = kind === 'replay-stress' ? 5 : 2;
    for (let i = 0; i < cycles; i++) {
      await wheel(page, 0.64, kind === 'replay-stress' ? 1000 : 2600);
      const stopped = await state(page); await page.waitForTimeout(800);
      assert.deepEqual((await state(page)).offsets, stopped.offsets);
      assert.ok(stopped.edges.every(e => e[1] === 'hidden'));
      await wheel(page, 1, 1200); await page.waitForTimeout(500);
      await wheel(page, 0.38, 2000);
      const calm = await state(page);
      assert.ok(calm.bodies.every(b => b[0] === 'scale(1)'));
      assert.ok(calm.edges.every(e => e[1] === 'hidden'), 'settle before relationships');
      await wheel(page, 0, 2800); await settled(page); await page.waitForTimeout(900);
      const restored = await state(page);
      assert.equal(restored.runs, original.runs + i + 1); assert.equal(restored.cycle, i + 1);
      await assertRest(page, original.base);
      console.log(`${kind}: cycle ${i + 1}/${cycles} PASS`);
    }
    for (const p of [0.4, 0.1, 0.8, 0.2, 1, 0.7, 0.3, 0.75, 0.1, 0]) await seek(page, p);
    await settled(page); await assertRest(page, original.base);
    if (mobile) { await touchSwipe(page, 720, 270); await touchSwipe(page, 280, 720); await seek(page, 0); await settled(page); await assertRest(page, original.base); }
    await page.waitForTimeout(1000);
    results.push({ kind, cycles, nodes: 38, relationships: 50, result: 'PASS' });
    await capture(context, page, `phase-13b-${kind}.webm`);
  }
  // Additional requested compact sizes and reduced motion.
  for (const viewport of [{ width: 360, height: 800 }, { width: 430, height: 932 }]) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
    const page = await context.newPage(); observeErrors(page); await page.goto(origin); await settled(page);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(directory, `phase-13b-rest-${viewport.width}x${viewport.height}.png`) });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage(); observeErrors(page); await page.goto(origin); await settled(page);
  // Follow real Home focus navigation forward, then back; only departed title replays.
  const title = page.locator('#current-focus-focus-flood-research [data-film-title] .decode-text');
  await page.locator('[data-film-seek="0"]').click(); await page.waitForTimeout(1400);
  const firstRuns = Number(await title.getAttribute('data-decode-runs'));
  assert.ok(firstRuns > 0);
  await page.locator('[data-film-seek="2"]').click(); await page.waitForTimeout(1400);
  await page.locator('[data-film-seek="0"]').click(); await page.waitForTimeout(1400);
  assert.equal(Number(await title.getAttribute('data-decode-runs')), firstRuns + 1);
  await seek(page, 1); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(300);
  assert.equal((await state(page)).phase, undefined); assert.equal((await state(page)).jobs, 0);
  await seek(page, 0); assert.ok((await state(page)).bodies.every(b => b[0] === null));
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Research', exact: true }).click();
  await page.waitForURL('**/research'); assert.equal(await page.locator('[data-universe-motion]').count(), 0);
  await page.goBack(); await page.waitForURL(origin + '/'); await page.waitForTimeout(400);
  assert.equal((await state(page)).jobs, 0);
  await context.close(); assert.deepEqual(errors, []);
  await fs.writeFile(path.join(directory, 'phase-13b-results.json'), JSON.stringify({ results, errors, sectionReplay: 'PASS', reducedMotionAndNavigation: 'PASS' }, null, 2) + '\n');
  console.log('Phase 13B browser QA PASS');
} finally { await browser.close(); }
