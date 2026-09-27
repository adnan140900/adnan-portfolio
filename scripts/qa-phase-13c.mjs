/* Uses external browser tooling only. No application/test dependency is installed. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://localhost:3000';
const directory = path.resolve('docs/qa');
const errors = [], results = [];
const resume = Number(process.env.QA_FROM || 0);
const until = Number(process.env.QA_UNTIL || 5);
const output = process.env.QA_REPORT || 'phase-13c-results.json';
if (resume) {
  try { results.push(...JSON.parse(await fs.readFile(path.join(directory, output), 'utf8')).results); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
let complete = false;
const homeRoot = '.discovery-hero [data-graph-root]';
const wait = (page, ms) => page.waitForTimeout(ms);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
await fs.mkdir(directory, { recursive: true });
async function make(viewport, mobile = false, recording = false, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, reducedMotion, ...(recording ? { recordVideo: { dir: directory, size: viewport } } : {}) });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { context, page };
}
async function save(context, page, name) {
  const video = page.video(); await page.close(); await context.close();
  const temporary = await video.path(), target = path.join(directory, name);
  await video.saveAs(target); if (temporary !== target) await fs.unlink(temporary);
}
async function move(page, y, ms = 800) {
  const start = await page.evaluate(() => scrollY), steps = Math.ceil(ms / 50);
  for (let i = 1; i <= steps; i++) { await page.mouse.wheel(0, (y - start) / steps); await wait(page, 50); }
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await wait(page, 100);
}
async function homeState(page) {
  return page.locator(homeRoot).evaluate(r => ({
    phase: r.dataset.universeMotion, p: Number(r.dataset.universeProgress), distance: Number(r.dataset.universeScrollDistance),
    runs: Number(document.querySelector('.discovery-hero h1 .decode-text').dataset.decodeRuns),
    base: [...r.querySelectorAll('[data-force-node], [data-universe-node]')].map(e => e.getAttribute('transform')),
    offsets: [...r.querySelectorAll('[data-story-position]')].map(e => e.getAttribute('transform')),
    bodies: [...r.querySelectorAll('[data-universe-body]')].map(e => [e.getAttribute('transform'), e.getAttribute('opacity')]),
    edges: [...r.querySelectorAll('[data-force-edge], [data-universe-edge]')].map(e => [e.style.strokeDashoffset, e.style.visibility]),
  }));
}
async function homeSettled(page) {
  await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'rest');
  await page.waitForFunction(() => document.querySelector('.discovery-hero h1 .decode-text')?.dataset.decoding === 'false');
}
async function endpoints(page, scope) {
  const result = await page.locator(scope).evaluate(root => {
    const groups = [...root.querySelectorAll('[data-force-node], [data-universe-node], [data-projection-node]')];
    const points = new Map(groups.map(g => {
      const b = g.transform.baseVal.consolidate()?.matrix, o = g.querySelector('[data-story-position]').transform.baseVal.consolidate()?.matrix;
      return [g.dataset.nodeId || g.dataset.universeNode || g.dataset.projectionNode, { x: (b?.e || 0) + (o?.e || 0), y: (b?.f || 0) + (o?.f || 0) }];
    }));
    const edges = [...root.querySelectorAll('[data-force-edge], [data-universe-edge]')];
    return { unique: points.size === groups.length, mismatch: edges.filter(e => {
      const a = points.get(e.dataset.source), b = points.get(e.dataset.target), p = e.getPointAtLength(0), q = e.getPointAtLength(e.getTotalLength());
      return !a || !b || Math.hypot(a.x - p.x, a.y - p.y) > .03 || Math.hypot(b.x - q.x, b.y - q.y) > .03;
    }).length };
  });
  assert.equal(result.unique, true); assert.equal(result.mismatch, 0);
}
async function assertHome(page, initial) {
  const s = await homeState(page);
  assert.deepEqual(s.base, initial.base); assert.equal(s.base.length, 38); assert.equal(s.edges.length, 50);
  assert.ok(s.bodies.every(b => b[0] === null && b[1] === null)); assert.ok(s.edges.every(e => e[0] === '' && e[1] === ''));
  await endpoints(page, homeRoot);
}
async function composition(page, viewport) {
  const geometry = await page.evaluate(() => {
    const graph = document.querySelector('.discovery-hero .constellation-shell').getBoundingClientRect();
    const copy = document.querySelector('.discovery-hero .public-world-copy').getBoundingClientRect();
    const surface = document.querySelector('.discovery-hero .graph-surface').getBoundingClientRect();
    const clippedLabels = [...document.querySelectorAll('.discovery-hero .knowledge-star-label, .discovery-hero [data-universe-body] text')].filter(e => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && (b.top < graph.top || b.bottom > graph.bottom || b.left < graph.left || b.right > graph.right);
    }).map(e => e.textContent);
    return { graph: graph.toJSON(), copy: copy.toJSON(), surface: surface.toJSON(), clippedLabels, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.ok(Math.abs(geometry.surface.x + geometry.surface.width / 2 - viewport.width / 2) < 2);
  assert.ok(geometry.copy.top >= geometry.graph.bottom - 1); assert.equal(geometry.overflow, false);
  assert.deepEqual(geometry.clippedLabels, []);
  assert.ok(geometry.graph.height > geometry.copy.height * 1.8);
  await page.screenshot({ path: path.join(directory, `phase-13c-home-${viewport.width}x${viewport.height}.png`) });
  results.push({ viewport, geometry, result: 'PASS' });
}
async function touchSwipe(page, from, to) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 345, y: from }] });
  for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 345, y: from + (to - from) * i / 14 }] }); await wait(page, 16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach();
}
async function sceneSeek(page, filmId, index, ms = 700) {
  const target = await page.locator(`#${filmId}`).evaluate((r, index) => {
    const rect = r.getBoundingClientRect(), count = r.querySelectorAll('[data-film-panel]').length;
    const start = rect.top + scrollY - 64;
    const end = rect.bottom + scrollY - innerHeight;
    return start + (index + .24) / (count + .01) * (end - start);
  }, index);
  await move(page, target, ms); await wait(page, 2100);
  const state = await page.locator(`#${filmId}`).evaluate((r, index) => {
    const p = r.querySelectorAll('[data-film-panel]')[index];
    return { active: Number(r.dataset.activeFilmScene), epoch: Number(p.dataset.sceneEpoch), runs: Number(p.querySelector('[data-film-title] .decode-text').dataset.decodeRuns), running: r.dataset.sceneRevealRunning, jobs: Number(document.documentElement.dataset.decodeJobs || 0) };
  }, index);
  assert.equal(state.active, index, `${filmId} active scene`); assert.ok(state.epoch > 0 && state.runs > 0, `${filmId} reveal runs`);
  assert.equal(state.running, 'false'); assert.equal(state.jobs, 0);
  await endpoints(page, `#${filmId} .semantic-stage`);
  return state;
}
async function filmAudit(page, filmId) {
  const n = await page.locator(`#${filmId} [data-film-panel]`).count();
  const first = await sceneSeek(page, filmId, 0);
  const y = await page.evaluate(() => scrollY);
  for (const dy of [15, -12, 9, -6]) await page.evaluate(y => scrollTo(0, y), y + dy);
  await wait(page, 2000);
  assert.equal(Number(await page.locator(`#${filmId} [data-film-panel]`).first().getAttribute('data-scene-epoch')), first.epoch);
  if (n > 1) await sceneSeek(page, filmId, n - 1);
  else { await move(page, 0); await wait(page, 1200); }
  const again = await sceneSeek(page, filmId, 0);
  assert.ok(again.epoch > first.epoch && again.runs > first.runs, `${filmId} backward replay`);
  if (n > 1) {
    await sceneSeek(page, filmId, n - 1);
    for (const i of [0, n - 1, 0, Math.min(1, n - 1), 0]) {
      await page.locator(`#${filmId} [data-film-seek="${i}"]`).click({ force: true }); await wait(page, 80);
    }
    await sceneSeek(page, filmId, 0, 100);
  }
  assert.equal(await page.locator(`#${filmId} [data-scene-drawing="true"]`).count(), 0);
  assert.equal(await page.locator(`#${filmId} [data-scene-body][transform]`).count(), 0);
  return { filmId, scenes: n, firstEpoch: first.epoch, returnEpoch: again.epoch, result: 'PASS' };
}
try {
  if (resume <= 0) for (const mobile of [false, true]) {
    const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
    const { context, page } = await make(viewport, mobile, true);
    await page.goto(origin, { timeout: 60000 }); await homeSettled(page); await wait(page, 5000);
    const first = await homeState(page); await composition(page, viewport); await assertHome(page, first);
    for (let cycle = 1; cycle <= 5; cycle++) {
      await move(page, first.distance * .65, 1600);
      const stop = await homeState(page); await wait(page, 650);
      assert.deepEqual((await homeState(page)).offsets, stop.offsets);
      assert.ok(stop.edges.every(e => e[1] === 'hidden'));
      const box = await page.locator('.home-universe-frame').boundingBox(); assert.ok(box.y > 0 && box.y < 80, 'fragments remain in viewport');
      await move(page, first.distance, 800); await wait(page, 400);
      await move(page, first.distance * .38, 1800);
      assert.ok((await homeState(page)).edges.every(e => e[1] === 'hidden'));
      await move(page, 0, 1500); await homeSettled(page); await wait(page, 200);
      assert.equal((await homeState(page)).runs, first.runs + cycle); await assertHome(page, first);
      console.log(`Home ${mobile ? 'mobile' : 'desktop'} cycle ${cycle}: PASS`);
    }
    if (mobile) { await touchSwipe(page, 740, 220); await touchSwipe(page, 260, 740); await move(page, 0, 300); await homeSettled(page); await assertHome(page, first); }
    for (const p of [.4, .1, .8, .2, 1, .3, .75, .1, 0]) { await page.evaluate(y => scrollTo(0, y), first.distance * p); await wait(page, 80); }
    await homeSettled(page); await assertHome(page, first);
    results.push({ home: mobile ? 'mobile' : 'desktop', cycles: 5, nodes: 38, edges: 50, result: 'PASS' });
    await save(context, page, `phase-13c-home-${mobile ? 'mobile' : 'desktop'}.webm`);
  }
  if (resume <= 1 && until >= 1) for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 360, height: 800 }, { width: 430, height: 932 }]) {
    const { context, page } = await make(viewport, viewport.width < 768);
    await page.goto(origin); await homeSettled(page); await composition(page, viewport); await context.close();
  }
  // Benchmark: the actual approved AI sequence also includes Research Workflows.
  if (resume <= 2 && until >= 2) {
    const { context, page } = await make({ width: 1440, height: 900 }, false, true);
    await page.goto(`${origin}/ai`); await wait(page, 1800);
    const id = await page.locator('.narrative-film').getAttribute('id');
    const count = await page.locator('[data-film-panel]').count(), history = [];
    for (const direction of ['forward', 'reverse', 'forward']) {
      const order = Array.from({ length: count }, (_, i) => direction === 'reverse' ? count - i - 1 : i);
      for (const index of order) history.push({ direction, index, ...(await sceneSeek(page, id, index, 950)) });
      if (direction === 'reverse') { await move(page, 0, 1200); await wait(page, 1400); }
    }
    assert.ok(history.at(-1).epoch >= 2);
    assert.ok(Number(await page.locator('[data-film-intro] .decode-text').getAttribute('data-decode-runs')) >= 2);
    await page.screenshot({ path: path.join(directory, 'phase-13c-ai-final.png') });
    results.push({ ai: history, result: 'PASS' }); console.log('AI full forward/reverse/forward: PASS');
    await save(context, page, 'phase-13c-ai-replay.webm');
  }
  const routes = ['/about', '/research', '/research/flood-accessibility', '/projects', '/projects/nothipotro', '/projects/knowledge-workflows', '/ai', '/leadership', '/learning'];
  for (const mobile of [false, true]) {
    if (resume > (mobile ? 4 : 3) || until < (mobile ? 4 : 3)) continue;
    const { context, page } = await make(mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile, !mobile);
    for (const route of routes) {
      await page.goto(origin + route); await wait(page, 700);
      const films = await page.locator('.narrative-film').evaluateAll(elements => elements.map(e => e.id));
      for (const id of films) results.push({ route, mobile, ...(await filmAudit(page, id)) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route} overflow`);
      console.log(`${route} ${mobile ? 'mobile' : 'desktop'} replay/stress: PASS`);
    }
    await page.goto(origin); await homeSettled(page);
    results.push({ route: '/', mobile, ...(await filmAudit(page, 'current-focus')) });
    if (!mobile) await save(context, page, 'phase-13c-route-replay.webm'); else await context.close();
  }
  if (resume <= 5 && until >= 5) {
    const { context, page } = await make({ width: 390, height: 844 }, true, false, 'reduce');
    for (const route of ['/', '/ai', '/about']) {
      await page.goto(origin + route); await wait(page, 500);
      await move(page, 800, 300); await move(page, 0, 300);
      assert.equal(await page.locator('[data-universe-motion], [data-scene-revealing="true"], [data-decoding="true"]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await wait(page, 400);
    await sceneSeek(page, 'identity', 1); await page.emulateMedia({ reducedMotion: 'reduce' }); await wait(page, 300);
    assert.equal(await page.locator('[data-scene-drawing], [data-scene-body][transform]').count(), 0);
    await context.close(); results.push({ reducedMotion: 'PASS' });
  }
  assert.deepEqual(errors, []);
  complete = true;
  console.log('Phase 13C browser QA PASS');
} finally {
  await fs.writeFile(path.join(directory, output), JSON.stringify({ complete, resumedFrom: resume, through: until, results, errors }, null, 2) + '\n');
  await browser.close();
}
