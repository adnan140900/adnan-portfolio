// External browser tooling only; no project dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://localhost:3000';
const directory = path.resolve('docs/qa');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [], errors = [];
const mode = process.env.QA_MODE || 'all';
await fs.mkdir(directory, { recursive: true });
async function context(mobile = false, reduced = false, record = false) {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference', ...(record ? { recordVideo: { dir: directory, size: viewport } } : {}) });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page };
}
async function open(page, route, filmIndex = 0) {
  await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.semantic-focus-tracer', { state: 'attached' });
  await page.waitForTimeout(600);
  await page.mouse.move(5, 5);
  await page.evaluate(filmIndex => {
    const root = document.querySelectorAll('[data-branch-persistent="true"]')[filmIndex];
    const svg = root.querySelector('.semantic-stage svg');
    const nodes = [...svg.querySelectorAll('[data-force-node], [data-projection-node]')];
    window.branchQA = { root, svg, nodes, base: nodes.map(n => n.getAttribute('transform')), violations: [], samples: 0, stopped: false };
    const inspect = () => {
      const q = window.branchQA; if (q.stopped) return;
      q.samples++;
      if (q.root.querySelectorAll('.semantic-focus-tracer').length !== 1) q.violations.push('duplicate tracer');
      if (q.svg !== q.root.querySelector('.semantic-stage svg') || q.nodes.some(n => !n.isConnected)) q.violations.push('remount');
      if (q.nodes.some(n => +getComputedStyle(n).opacity < .1)) q.violations.push('hidden node');
      if (q.root.querySelector('[data-scene-drawing="true"], [data-scene-revealing="true"], [data-scene-body][transform]')) q.violations.push('genesis');
      if ([...q.svg.querySelectorAll('[data-force-edge]')].some(e => getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity < .05)) q.violations.push('hidden edge');
      requestAnimationFrame(inspect);
    }; inspect();
  }, filmIndex);
}
async function check(page, settled = true) {
  const state = await page.evaluate(() => {
    const q = window.branchQA, ring = q.svg.querySelector('.semantic-focus-tracer');
    const active = Number(q.root.dataset.activeFilmScene);
    const panel = q.root.querySelectorAll('[data-film-panel]')[active];
    const id = ring.dataset.focusTarget;
    const node = q.nodes.find(n => (n.dataset.nodeId || n.dataset.projectionNode) === id);
    const core = node?.querySelector('.knowledge-star-core, [data-projection-core]');
    const box = core?.getBoundingClientRect(), r = ring.getBoundingClientRect();
    const edges = [...q.svg.querySelectorAll('[data-force-edge]')];
    const stage = q.root.querySelector('.semantic-stage').getBoundingClientRect();
    return { active, title: panel?.querySelector('[data-film-title] [data-scene-decode]')?.dataset.sceneDecode, id, samples: q.samples,
      violations: [...new Set(q.violations)], sameBase: q.nodes.every((n, i) => n.getAttribute('transform') === q.base[i]),
      ringError: box ? Math.hypot(box.x + box.width / 2 - r.x - r.width / 2, box.y + box.height / 2 - r.y - r.height / 2) : null,
      incidentCorrect: edges.every(e => (e.dataset.storyIncident === 'true') === (e.dataset.source === id || e.dataset.target === id)),
      epoch: Number(panel?.dataset.sceneEpoch || 0), runs: Number(panel?.querySelector('[data-decode-runs]')?.dataset.decodeRuns || 0),
      stageVisible: stage.bottom > 150 && stage.top < innerHeight - 150,
      overflow: document.documentElement.scrollWidth > innerWidth,
      nodes: q.nodes.length, edges: edges.length,
      offsets: q.nodes.map(n => n.querySelector('[data-story-position]').getAttribute('transform')),
    };
  });
  assert.deepEqual(state.violations, []); assert.equal(state.sameBase, true);
  assert.equal(state.incidentCorrect, true); assert.equal(state.overflow, false);
  if (settled && state.ringError !== null) assert.ok(state.ringError < 1, `tracer alignment ${state.ringError}`);
  return state;
}
async function seek(page, index, pause = 900) {
  const id = await page.evaluate(() => window.branchQA.root.id);
  await page.locator(`#${id} [data-film-seek="${index}"]`).click({ force: true });
  await page.mouse.move(5, 5); await page.waitForTimeout(pause);
  return check(page, pause >= 600);
}
async function stop(page) { await page.evaluate(() => { window.branchQA.stopped = true; }); }
try {
  if (mode === 'all' || mode === 'ai') for (const mobile of [false, true]) {
    const { ctx, page } = await context(mobile, false, true);
    await open(page, '/ai');
    const count = await page.locator('[data-film-panel]').count(), visits = [];
    for (const i of [...Array(count).keys(), ...Array(count).keys()].map((i, j) => j < count ? i : count - 1 - i)) {
      const state = await seek(page, i, 1800); assert.equal(state.active, i); assert.equal(state.stageVisible, true); visits.push(state);
      if (i === 2) await page.screenshot({ path: path.join(directory, `phase-13d-ai-${mobile ? 'mobile' : 'desktop'}.png`) });
    }
    assert.ok(visits.at(-1).epoch > visits[0].epoch, 'text replay rearmed');
    for (const i of [2, 3, 2, 1, 2, 3, 5, 2]) await seek(page, i, 65);
    await page.waitForTimeout(1900); const final = await check(page); assert.equal(final.active, 2);
    assert.equal(final.id, 'theme-ai-agents');
    const idleBefore = final.offsets; await page.waitForTimeout(2200);
    assert.notDeepEqual((await check(page)).offsets, idleBefore, 'idle continues');
    // Real native wheel / touch direction changes, followed by a settled scene.
    if (mobile) {
      const cdp = await ctx.newCDPSession(page);
      for (const [from, to] of [[720, 260], [300, 730]]) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 370, y: from }] });
        for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 370, y: from + (to - from) * i / 12 }] }); await page.waitForTimeout(16); }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(300);
      }
      await cdp.detach();
    } else for (const y of [540, -380, 780, -720]) { await page.mouse.wheel(0, y); await page.waitForTimeout(100); }
    await seek(page, 2, 2000); results.push({ route: '/ai', mobile, visits, final: await check(page) });
    await stop(page); const video = page.video(); await page.close(); await ctx.close();
    const temporary = await video.path(), target = path.join(directory, `phase-13d-ai-${mobile ? 'mobile' : 'desktop'}.webm`);
    await video.saveAs(target); if (temporary !== target) await fs.unlink(temporary);
  }
  if (mode === 'all' || mode === 'routes') for (const mobile of [false, true]) {
    const { ctx, page } = await context(mobile);
    for (const route of ['/research', '/research/flood-accessibility', '/projects', '/projects/nothipotro', '/projects/knowledge-workflows', '/leadership', '/learning', '/about']) {
      await open(page, route); const count = await page.locator('[data-branch-persistent="true"]').first().locator('[data-film-panel]').count();
      const visits = []; for (const i of [0, count - 1, 0]) { const state = await seek(page, i, 1300); assert.equal(state.active, i); visits.push(state); }
      if (route.includes('flood-accessibility')) { assert.equal(visits[0].nodes, 7); assert.equal(visits[0].edges, 8); }
      results.push({ route, mobile, visits }); await stop(page); console.log(`PASS ${route} ${mobile ? 'compact' : 'desktop'}`);
      if (route === '/about') {
        await open(page, route, 1); const focusVisits = [];
        for (const i of [0, 1, 2, 3, 0]) { const state = await seek(page, i, 1300); assert.equal(state.active, i); focusVisits.push(state); }
        results.push({ route: '/about#about-focus', mobile, visits: focusVisits }); await stop(page);
      }
    }
    await ctx.close();
  }
  if (mode === 'all' || mode === 'reduced') for (const mobile of [false, true]) {
    const { ctx, page } = await context(mobile, true);
    await open(page, '/ai'); const visits = [];
    for (const i of [0, 2, 3, 5, 1, 2]) { const state = await seek(page, i, 500); assert.equal(state.active, i); visits.push(state); }
    assert.ok(visits.every(s => s.offsets.every(o => o === null)));
    results.push({ route: '/ai', mobile, reduced: true, visits }); await stop(page); await ctx.close();
  }
  if (mode === 'all' || mode === 'home') for (const mobile of [false, true]) {
    const { ctx, page } = await context(mobile);
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'rest');
    const root = page.locator('.discovery-hero [data-graph-root]');
    const base = await root.locator('[data-force-node], [data-universe-node]').evaluateAll(nodes => nodes.map(n => n.getAttribute('transform')));
    assert.equal(base.length, 38); assert.equal(await root.locator('[data-force-edge], [data-universe-edge]').count(), 50);
    const distance = Number(await root.getAttribute('data-universe-scroll-distance'));
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.evaluate(y => scrollTo(0, y), distance * .8); await page.waitForTimeout(400);
      assert.ok(await root.locator('[data-force-edge], [data-universe-edge]').evaluateAll(edges => edges.every(e => e.style.visibility === 'hidden')));
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'rest');
    }
    assert.deepEqual(await root.locator('[data-force-node], [data-universe-node]').evaluateAll(nodes => nodes.map(n => n.getAttribute('transform'))), base);
    assert.equal(await page.locator('.semantic-focus-tracer').count(), 0);
    results.push({ home: true, mobile, result: 'PASS', nodes: 38, edges: 50 }); await ctx.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(directory, `phase-13d-${mode}-results.json`), JSON.stringify({ result: 'PASS', results, errors }, null, 2));
  console.log(`PASS ${mode}: ${results.length} scenarios`);
} finally { await browser.close(); }
