# Phase 14B — WebKit SVG node compatibility

## Confirmed root cause

The production `KnowledgeGraph` placed each interactive primary node inside an SVG `<foreignObject>` nested below transformed `<g>` elements. The link/button, star, and label were HTML descendants while edges and depth nodes were native SVG. This exactly separated the owner-reported failure: WebKit displaced the foreignObject controls toward the SVG origin while native SVG relationships, depth circles, and text retained their authored coordinates. Phase 14A projection values were not changed.

## SVG-native architecture

Interactive nodes now remain inside the existing hierarchy:

`data-force-node` → `data-story-position` → `data-scene-body` → SVG-native control.

The visible control uses native `<circle>`, `<text>`, and `<tspan>` elements. There is no interactive `foreignObject`. The accepted core, halo, label, selected, neighbor, active, focus, and tracer vocabulary is reproduced in `svg-node-control.css`. A transparent SVG circle supplies at least a 44px rendered hit target in the smallest branch-stage measurement without changing the visible star size.

No second graph, D3 simulation, animation loop, browser fork, or user-agent rule was introduced.

## Accessibility and routing

Routed nodes are native SVG `<a href>` links with explicit accessible names. Existing cinematic transition requests still intercept ordinary unmodified activation; the real `href` remains as the robust navigation fallback. Non-routed nodes are focusable SVG groups with `role="button"`, `aria-pressed`, and explicit Enter/Space activation. Pointer, touch/pen preview, drag suppression, focus-visible treatment, node inspection, and the existing annotation behavior remain attached to the same `data-control-node` contract.

## Projection and controller preservation

Base D3/projected coordinates remain SVG `transform="translate(x y)"` attributes on `data-force-node`. The nested `data-story-position` group remains the sole bridge for story, idle, and Home-universe offsets. The compatibility repair changed no coordinates and added no coordinate integration.

All controller-facing attributes remain present: `data-force-node`, `data-node-id`, `data-story-position`, `data-scene-body`, `data-control-node`, `data-active`, `data-neighbor`, `data-idle-held`, and `data-transition-anchor`. Semantic idle, Genesis/dissolution, route transitions, branch focus, the tracer, and compact label resolution continue to query those contracts. Branch tracer radius measurement now reads the native circle radius directly.

## Automated WebKit results

Playwright WebKit 26.6 passed the required matrix:

| Viewport | Result |
| --- | --- |
| iPhone 7 equivalent · 375×667 | PASS |
| iPhone 12 Pro Max equivalent · 428×926 | PASS |
| iPad Air 5 portrait · 820×1180 | PASS |
| iPad Air 5 landscape · 1180×820 | PASS |

Home was captured at fresh load, Genesis mid-state, formed rest, partial dissolution, and full reconstruction. Every final and reconstructed state contained 38 nodes and 50 relationships, zero foreignObjects, no horizontal overflow, and seven distinct primary controls. Control centers differed from their authoritative composed SVG origins by at most `0.000026px`; edge endpoints differed from their semantic node centers by at most `0.000045px`. Primary control spread occupied 35.3–45.7% of graph width and 29.3–55.9% of graph height, explicitly rejecting origin clustering. The smallest retained Home hit target measured 61.27px.

WebKit branch QA passed `/research`, `/projects`, `/ai`, `/leadership`, and `/learning`. Each stage retained its active semantic node, 1–4 compact labels, attached edge endpoints, aligned native controls, and a minimum 44.52px hit target. Tracer centers remained aligned to active nodes within `0.000012px`. A separate WebKit keyboard activation followed the real SVG Research link through the existing cinematic route lifecycle to `/research`.

## Chromium regression comparison

Chromium passed at 390×844 and 1440×900 with the same exact geometry assertions, topology, Home lifecycle, accessible links, keyboard-operable non-routed controls, and zero browser errors. Comparison against the retained Phase 14A Chromium captures shows the same approved coordinates, hierarchy, centered Home composition, labels, and graph/title relationship. Differences are limited to the SVG-native rendering mechanism and deterministic SVG label wrapping.

## Verification and content integrity

- `pnpm verify:content`: all eight approved SHA-256 hashes unchanged and passing.
- Global topology: 38 nodes / 50 relationships.
- Flood projection: 7 nodes / 8 relationships.
- Phase 14A compact label resolver, mobile spacing, navigation rail, and persistent branch architecture remain covered by the existing suite.
- No public JSON, dependency, lockfile, route, or content change was made.
- QA evidence: `docs/qa/phase-14b-results.json` and the lightweight `phase-14b-*.png` captures.
- No WebM was created or retained.

## Physical-device limitation

Playwright WebKit exercises the WebKit rendering engine and now catches the coordinate-collapse class numerically, but it does not certify physical iOS/iPadOS. Final release acceptance still requires owner verification on the known iPhone 7, iPhone 12 Pro Max, and iPad Air 5 devices that exposed the production failure.

PHASE 14B: PASS — WEBKIT GRAPH POSITIONING STABILIZED
