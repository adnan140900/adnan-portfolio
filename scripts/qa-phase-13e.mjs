// Uses an existing external Playwright/Core installation; no app dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://localhost:3000';
const mode = process.env.QA_MODE || 'all';
const dir = path.resolve('docs/qa');
const results = [], errors = [];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
await fs.mkdir(dir, { recursive: true });
async function create(viewport, record = false, reducedMotion = 'no-preference') {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500, reducedMotion, ...(record ? { recordVideo: { dir, size: viewport } } : {}) });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page };
}
async function open(page, route) {
  await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.semantic-focus-tracer', { state: 'attached' });
  await page.mouse.move(5, 5);
  await page.evaluate(() => {
    window.seamlessQA = { canvas: document.querySelector('main canvas'), groups: [...document.querySelectorAll('[data-force-node], [data-projection-node]')], stopped: false, violations: [], samples: 0 };
    const q = window.seamlessQA;
    q.base = q.groups.map(n => n.getAttribute('transform'));
    const frame = () => {
      if (q.stopped) return; q.samples++;
      if (q.canvas !== document.querySelector('main canvas') || q.groups.some(n => !n.isConnected)) q.violations.push('remounted graph/atmosphere');
      if (document.querySelector('[data-scene-drawing="true"], [data-scene-revealing="true"], [data-scene-body][transform]')) q.violations.push('graph genesis');
      if (q.groups.some(n => +getComputedStyle(n).opacity < .1)) q.violations.push('hidden nodes');
      if ([...document.querySelectorAll('[data-branch-persistent="true"] [data-force-edge]')].some(e => getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity < .05)) q.violations.push('hidden edges');
      requestAnimationFrame(frame);
    }; frame();
  });
}
async function state(page, index, film = 0) {
  return page.evaluate(({ index, film }) => {
    const root = document.querySelectorAll('[data-branch-persistent="true"]')[film], panel = root.querySelectorAll('[data-film-panel]')[index];
    const title = panel.querySelector('[data-film-title]'), copy = panel.querySelector('.film-copy>p:not(.film-status)');
    const q = window.seamlessQA, stage = root.querySelector('.semantic-stage'), ring = root.querySelector('.semantic-focus-tracer');
    const node = [...root.querySelectorAll('[data-force-node], [data-projection-node]')].find(n => (n.dataset.nodeId || n.dataset.projectionNode) === ring.dataset.focusTarget);
    const core = node?.querySelector('.knowledge-star-core, [data-projection-core]');
    const r = ring.getBoundingClientRect(), c = core?.getBoundingClientRect();
    const a = document.querySelector('.branch-atmosphere-viewport').getBoundingClientRect();
    const rect = title.getBoundingClientRect(), rectCopy = copy?.getBoundingClientRect();
    return {
      active: +root.dataset.activeFilmScene, target: ring.dataset.focusTarget,
      sceneFont: parseFloat(getComputedStyle(title).fontSize), routeFont: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize), bodyFont: parseFloat(getComputedStyle(copy).fontSize),
      title: title.querySelector('[data-scene-decode]')?.dataset.sceneDecode, titleBox: rect.toJSON(), copyBox: rectCopy?.toJSON(),
      canvasCount: document.querySelectorAll('main canvas').length, canvasBox: a.toJSON(),
      backgrounds: [root.querySelector('.film-stage'), stage, root.querySelector('.constellation-shell')].filter(Boolean).map(e => ({ color: getComputedStyle(e).backgroundColor, image: getComputedStyle(e).backgroundImage, overflow: getComputedStyle(e).overflow })),
      emptyPointer: getComputedStyle(stage).pointerEvents, tracerPointer: getComputedStyle(ring).pointerEvents,
      controlPointer: getComputedStyle(root.querySelector('.force-node-control') || ring).pointerEvents,
      overflow: document.documentElement.scrollWidth > innerWidth,
      sameBase: q.groups.every((n, i) => n.getAttribute('transform') === q.base[i]), violations: [...new Set(q.violations)], samples: q.samples,
      ringError: c ? Math.hypot(c.x + c.width / 2 - r.x - r.width / 2, c.y + c.height / 2 - r.y - r.height / 2) : null,
      epoch: +panel.dataset.sceneEpoch, rings: root.querySelectorAll('.semantic-focus-tracer').length,
      nodes: root.querySelectorAll('[data-force-node], [data-projection-node]').length, edges: root.querySelectorAll('[data-force-edge]').length,
      offsets: [...root.querySelectorAll('[data-story-position]')].map(e => e.getAttribute('transform')),
    };
  }, { index, film });
}
async function seek(page, index, pause = 1300, film = 0) {
  await page.locator('[data-branch-persistent="true"]').nth(film).locator(`[data-film-seek="${index}"]`).click({ force: true });
  await page.mouse.move(5, 5); await page.waitForTimeout(pause);
  const s = await state(page, index, film);
  if (pause > 600) { assert.equal(s.active, index); if (s.ringError !== null) assert.ok(s.ringError < 1); }
  assert.equal(s.canvasCount, 1); assert.equal(s.sameBase, true); assert.equal(s.overflow, false); assert.deepEqual(s.violations, []); assert.equal(s.rings, 1);
  assert.ok(s.backgrounds.every(b => b.color === 'rgba(0, 0, 0, 0)' && b.image === 'none' && b.overflow === 'visible'));
  assert.equal(s.emptyPointer, 'none'); assert.equal(s.tracerPointer, 'none');
  assert.ok(s.bodyFont >= 15.2 && s.bodyFont <= 18);
  assert.ok(s.titleBox.left >= 0 && s.titleBox.right <= (await page.viewportSize()).width + 1);
  return s;
}
async function stop(page) { await page.evaluate(() => { window.seamlessQA.stopped = true; }); }
try {
  if (mode === 'all' || mode === 'ai') for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    const { ctx, page } = await create(viewport, true);
    await open(page, '/ai'); await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(dir, `phase-13e-ai-intro-${viewport.width}x${viewport.height}.png`) });
    const visits = [];
    for (const i of [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0]) {
      const s = await seek(page, i, 1750); visits.push(s);
      if ([2, 4, 5].includes(i)) await page.screenshot({ path: path.join(dir, `phase-13e-ai-${i}-${viewport.width}x${viewport.height}.png`) });
    }
    assert.ok(visits.at(-1).epoch > visits[0].epoch);
    for (const i of [2, 3, 2, 1, 2]) await seek(page, i, 70);
    await page.waitForTimeout(1800); const settled = await state(page, 2); assert.equal(settled.target, 'theme-ai-agents'); assert.ok(settled.ringError < 1); assert.deepEqual(settled.violations, []);
    // Actual pointer drag selection on body copy, not a scripted DOM Range.
    const b = settled.copyBox;
    await page.mouse.move(b.x + 2, b.y + 9); await page.mouse.down(); await page.mouse.move(b.x + Math.min(150, b.width - 5), b.y + 9, { steps: 12 }); await page.mouse.up();
    const selected = await page.evaluate(() => getSelection()?.toString() || ''); assert.ok(selected.length > 3, 'body copy selectable');
    await page.evaluate(() => getSelection()?.removeAllRanges());
    const control = page.locator('[data-control-node="theme-ai-agents"]');
    if (viewport.width > 500) { await control.hover(); assert.equal(await page.locator('[data-node-id="theme-ai-agents"]').getAttribute('data-active'), 'true'); }
    else { await control.tap(); assert.equal(await page.locator('[data-node-id="theme-ai-agents"]').getAttribute('data-active'), 'true'); await control.tap(); }
    await page.mouse.move(5, 5);
    if (viewport.width < 500) {
      const cdp = await ctx.newCDPSession(page);
      for (const [from, to] of [[720, 270], [290, 730]]) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: viewport.width - 12, y: from }] });
        for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: viewport.width - 12, y: from + (to - from) * i / 12 }] }); await page.waitForTimeout(16); }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(350);
      }
      await cdp.detach();
    } else { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); await page.mouse.wheel(0, -400); await page.waitForTimeout(600); }
    await seek(page, 2, 1200);
    results.push({ viewport, visits, selectedText: selected, result: 'PASS' });
    await stop(page); const video = page.video(); await page.close(); await ctx.close();
    const temporary = await video.path(), target = path.join(dir, `phase-13e-ai-${viewport.width}x${viewport.height}.webm`); await video.saveAs(target); if (temporary !== target) await fs.unlink(temporary);
    console.log(`PASS AI ${viewport.width}x${viewport.height}`);
  }
  if (mode === 'all' || mode === 'routes') for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { ctx, page } = await create(viewport);
    for (const route of ['/research', '/research/flood-accessibility', '/projects', '/projects/nothipotro', '/projects/knowledge-workflows', '/leadership', '/learning', '/about']) {
      await open(page, route); const count = await page.locator('[data-branch-persistent="true"]').count();
      const visits = [];
      for (let film = 0; film < count; film++) {
        const n = await page.locator('[data-branch-persistent="true"]').nth(film).locator('[data-film-panel]').count();
        for (const i of [0, n - 1, 0]) visits.push(await seek(page, i, 1100, film));
      }
      if (route.includes('flood-accessibility')) { assert.equal(visits[0].nodes, 7); assert.equal(visits[0].edges, 8); }
      await page.screenshot({ path: path.join(dir, `phase-13e-${route.slice(1).replaceAll('/', '-')}-${viewport.width}.png`) });
      results.push({ route, viewport, visits, result: 'PASS' }); await stop(page);
      console.log(`PASS ${route} ${viewport.width}`);
    }
    // Real route link hit testing/navigation with the transparent graph present.
    await open(page, '/research'); await seek(page, 0);
    await page.locator('.film-subject-link').first().click(); await page.waitForURL('**/research/flood-accessibility');
    await page.waitForSelector('.semantic-focus-tracer', { state: 'attached' });
    assert.equal(await page.locator('.semantic-focus-tracer').count(), 1);
    await ctx.close();
  }
  if (mode === 'all' || mode === 'reduced') for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { ctx, page } = await create(viewport, false, 'reduce');
    await open(page, '/ai'); const visits = [];
    for (const i of [0, 2, 3, 5, 1, 2]) visits.push(await seek(page, i, 800));
    assert.ok(visits.every(s => s.offsets.every(offset => offset === null)));
    await page.screenshot({ path: path.join(dir, `phase-13e-reduced-${viewport.width}.png`) });
    results.push({ viewport, reduced: true, visits, result: 'PASS' }); await stop(page); await ctx.close();
  }
  if (mode === 'all' || mode === 'home') for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { ctx, page } = await create(viewport);
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
    assert.equal(await page.locator('.branch-atmosphere, .semantic-focus-tracer').count(), 0);
    results.push({ home: true, viewport, result: 'PASS', nodes: 38, edges: 50 }); await ctx.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(dir, `phase-13e-${mode}-results.json`), JSON.stringify({ result: 'PASS', results, errors }, null, 2));
  console.log(`PASS ${mode}: ${results.length} scenarios`);
} finally { await browser.close(); }
