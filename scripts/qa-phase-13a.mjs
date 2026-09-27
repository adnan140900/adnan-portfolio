/* Optional local browser QA; Playwright is tooling, not an application dependency.
   Set PLAYWRIGHT_MODULE to an installed playwright-core module when not resolvable. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const loadTool = createRequire(import.meta.url);
const { chromium } = loadTool(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:3000";
const directory = path.resolve("docs/qa");
const reports = [];
const errors = [];
const rootSelector = '.discovery-hero [data-graph-root]';

async function snapshot(page) {
  return page.locator(rootSelector).evaluate(root => ({
    phase: root.dataset.universeMotion,
    progress: Number(root.dataset.universeProgress),
    distance: Number(root.dataset.universeScrollDistance),
    idle: root.dataset.idleSeconds,
    base: [...root.querySelectorAll('[data-force-node], [data-universe-node]')].map(e => e.getAttribute('transform')),
    offsets: [...root.querySelectorAll('[data-story-position]')].map(e => e.getAttribute('transform')),
    bodies: [...root.querySelectorAll('[data-universe-body]')].map(e => [e.getAttribute('transform'), e.getAttribute('opacity')]),
    labels: [...root.querySelectorAll('[data-universe-body] text, [data-universe-body] .knowledge-star-label')].map(e => e.style.filter),
    edges: [...root.querySelectorAll('[data-force-edge], [data-universe-edge]')].map(e => [e.style.strokeDashoffset, e.style.visibility, e.getAttribute('d')]),
  }));
}
async function seek(page, fraction) {
  const { distance } = await snapshot(page);
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), distance * fraction);
  await page.waitForTimeout(80);
}
async function assertEndpoints(page) {
  const errors = await page.locator(rootSelector).evaluate(root => {
    const points = new Map([...root.querySelectorAll('[data-force-node], [data-universe-node]')].map(node => {
      const base = node.transform.baseVal.consolidate()?.matrix;
      const offset = node.querySelector('[data-story-position]').transform.baseVal.consolidate()?.matrix;
      return [node.dataset.nodeId || node.dataset.universeNode, { x: (base?.e || 0) + (offset?.e || 0), y: (base?.f || 0) + (offset?.f || 0) }];
    }));
    return [...root.querySelectorAll('[data-force-edge], [data-universe-edge]')].flatMap(edge => {
      const a = points.get(edge.dataset.source), b = points.get(edge.dataset.target);
      const start = edge.getPointAtLength(0), end = edge.getPointAtLength(edge.getTotalLength());
      return Math.hypot(start.x - a.x, start.y - a.y) > 0.02 || Math.hypot(end.x - b.x, end.y - b.y) > 0.02 ? [edge.dataset.edgeId] : [];
    });
  });
  assert.deepEqual(errors, [], 'all relationships attach to the current authoritative node positions');
}
async function wheelTo(page, fraction, duration = 2500) {
  const { distance } = await snapshot(page);
  const current = await page.evaluate(() => window.scrollY);
  const steps = Math.ceil(duration / 50);
  for (let step = 0; step < steps; step++) {
    await page.mouse.wheel(0, (distance * fraction - current) / steps);
    await page.waitForTimeout(50);
  }
}
async function touchSwipe(page, fromY, toY) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 340, y: fromY }] });
  for (let i = 1; i <= 18; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 340, y: fromY + (toY - fromY) * i / 18 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

(async () => {
  await fs.mkdir(directory, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const mobile of [false, true]) {
      const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
      const device = mobile ? 'mobile' : 'desktop';
      for (const mode of ['genesis', 'scroll-dissolution']) {
        const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile, recordVideo: { dir: directory, size: viewport } });
        const page = await context.newPage();
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.goto(origin, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'genesis');
        const initial = await snapshot(page);
        assert.equal(initial.bodies.length, 38); assert.equal(initial.edges.length, 50);
        assert.ok(initial.edges.every(e => e[1] === 'hidden'));
        await page.waitForFunction(() => document.querySelector('.discovery-hero [data-graph-root]')?.dataset.universeMotion === 'rest');
        await page.waitForTimeout(5000);
        const rest = await snapshot(page);
        await assertEndpoints(page);
        assert.ok(rest.bodies.every(b => b[0] === null && b[1] === null));
        assert.ok(rest.edges.every(e => e[0] === '' && e[1] === ''));
        if (mode === 'scroll-dissolution') {
          await wheelTo(page, 0.53, 3200);
          await page.waitForTimeout(200);
          const midway = await snapshot(page);
          await page.waitForTimeout(2000);
          const stopped = await snapshot(page);
          assert.deepEqual(stopped.offsets, midway.offsets, 'no lag or idle displacement while holding scroll');
          assert.equal(stopped.idle, midway.idle);
          assert.ok(stopped.edges.every(e => e[1] === 'hidden'));
          await wheelTo(page, 1, 2400);
          await page.waitForTimeout(1300);
          await wheelTo(page, 0, 4000);
          await seek(page, 0);
          await page.waitForTimeout(5000);
          const restored = await snapshot(page);
          await assertEndpoints(page);
          assert.deepEqual(restored.base, rest.base);
          assert.deepEqual(restored.bodies, rest.bodies);
          assert.deepEqual(restored.labels, rest.labels);
          assert.equal(restored.phase, 'rest');
          assert.ok(restored.edges.every(e => e[0] === '' && e[1] === ''));
          for (const fraction of [0.4, 0, 0.8, 0.2, 0.7, 0.3, 1, 0, 0.8, 0]) await seek(page, fraction);
          assert.deepEqual((await snapshot(page)).base, rest.base);
          if (mobile) {
            await touchSwipe(page, 650, 300);
            await page.waitForTimeout(120);
            await touchSwipe(page, 280, 680);
            await seek(page, 0);
            assert.equal((await snapshot(page)).phase, 'rest');
          }
          await page.waitForTimeout(1200);
        }
        const video = page.video();
        await page.close(); await context.close();
        const temporary = await video.path();
        const destination = path.join(directory, `phase-13a-${mode}-${device}.webm`);
        await video.saveAs(destination);
        if (temporary !== destination) await fs.unlink(temporary);
        reports.push({ device, mode, nodes: 38, edges: 50, file: path.basename(destination), result: 'PASS' });
        console.log(`${device} ${mode}: PASS`);
      }
    }
    // Reduced motion, re-entry, interrupted navigation and deep-link isolation.
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: 'networkidle' });
    assert.equal((await snapshot(page)).phase, undefined);
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
    assert.ok((await snapshot(page)).bodies.every(b => b[0] === null && b[1] === null));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(250);
    assert.equal((await snapshot(page)).phase, 'scroll');
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Research', exact: true }).tap();
    await page.waitForURL('**/research');
    assert.equal(await page.locator('[data-universe-motion]').count(), 0);
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Universe', exact: true }).tap();
    await page.waitForURL(origin + '/');
    await page.waitForTimeout(200);
    assert.notEqual((await snapshot(page)).phase, 'genesis');
    await seek(page, 0);
    await page.waitForTimeout(100);
    await page.locator('.discovery-hero [data-control-node="topic-research"]').tap();
    await page.waitForURL('**/research');
    assert.equal(await page.locator('[data-universe-motion]').count(), 0);
    await context.close();
    assert.deepEqual(errors, []);
    console.log('Reduced motion, single-tap graph navigation, internal return, and Home-only isolation: PASS');
    await fs.writeFile(path.join(directory, 'phase-13a-results.json'), JSON.stringify({ reports, errors, regression: 'PASS' }, null, 2) + '\n');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
