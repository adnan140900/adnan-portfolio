# Phase 13E — Seamless branch universe and editorial scale

Continues the existing work on `improvement-v2`. No deployment, merge, commit, dependency change, public-content edit, route change or authoritative coordinate change.

## Removing the graph panel

The Phase 13D graph already remained mounted, but its local Canvas, shell vignette, film-stage background and compact opaque sticky background combined into a visible rectangle. Phase 13E removes those visual boundaries only inside `.branch-universe` routes.

`branch-universe.css` makes the film stage, semantic stage and graph shell transparent. Their pseudo-element backgrounds, section rules, graph progress rule, box shadows and masks are removed. SVG and logical-stage overflow is visible; the page still clips at its outer viewport boundary to prevent horizontal overflow. Native graph inspection remains available in its existing supported layout rather than becoming the content presentation.

## Layer ownership

1. `BranchAtmosphere` owns one page-wide atmospheric layer from route introduction through the narrative. Its sticky child is one viewport tall, so the existing `AmbientStarfield` never allocates a document-height bitmap. It uses the same seed, drawing implementation, budgets and motion-preference policy. Scene changes do not replace the canvas.
2. The existing Phase 13D SVG, nodes, real relationships, idle offsets and focus tracer remain the midground. `KnowledgeGraph` explicitly accepts page-level atmosphere ownership; Home keeps the default local atmosphere. No second graph is rendered.
3. Editorial headings, prose and links occupy the foreground. Ghost vocabulary is reduced to opacity 0.018 on desktop and 0.014 on compact layouts.

The atmosphere wrapper has no pointer interaction. Its star drift/twinkle remains controlled by the existing Canvas owner. It does not add a second motion engine or an additional per-scene observer.

## Readability and pointer access

Wide layouts place the graph beside a narrower editorial column. Short desktop layouts now also use columns rather than a tiny centered graph above a viewport-wide heading. Compact text flows naturally in front of the shared environment. A soft elliptical falloff immediately behind body copy reduces local visual competition without an opaque backing, border, rounded rectangle or glass effect. It never hides the entire graph or resets node/edge emphasis.

The graph stage, SVG empty area and tracer use `pointer-events: none`. Actual graph controls and the existing inspector explicitly opt back into pointer events. Editorial text and links do likewise, with text selection enabled. The falloff is noninteractive. Native wheel/touch scrolling is retained.

The controller still uses the same active-node mapping, 280–420 ms tracer transitions and bounded camera offsets. A CSS reading-band fraction aligns short desktop native-flow scene selection with the text column. Reduced-motion anchor offsets follow that same column. These are layout measurements, not semantic changes.

The branch replay visibility threshold also follows the new reading region: the first short-desktop scene now reveals when it first becomes readable and replays on return. Home retains its existing thresholds.

A browser test exposed a nonnumeric ring radius during route travel when an outgoing control temporarily had no computable width. The existing tracer measurement now ignores detached SVGs and uses finite size/scale fallbacks. Targets, timing and settled ring dimensions are unchanged.

## Editorial scale

Measured on `/ai`, in CSS pixels:

| Viewport | Route title before → after | Scene title before → after | Body after |
| --- | --- | --- | --- |
| 1440×900 | 100.8 → 74.88 | 54.72 → 41.76 | 16 |
| 1366×768 | 95.62 → 71.03 | 96 → 42.35 | 16 |
| 390×844 | 46.8 → 35.1 | 46.8 → 35.1 | 15.2 |
| 430×932 | 51.6 → 38.7 | 51.6 → 38.7 | 15.2 |

The regular desktop/mobile reductions are approximately 24–26%. The short-desktop 96px heading was an oversized fallback; correcting its composition required a larger reduction to match the other desktop view. It is not a uniform font-size multiplier. Titles use a controlled 22ch maximum measure and remain within their editorial column. Desktop prose stays at 16–18px across the responsive range. Status metadata retains its separate smaller scale.

## Route coverage and responsive behavior

The shared transparent treatment covers `/ai`, `/research`, `/research/flood-accessibility`, `/projects`, `/projects/nothipotro`, `/projects/knowledge-workflows`, `/leadership`, `/learning` and both existing About narrative scopes. About also uses one page atmosphere instead of a separate background treatment.

Compact graphs remain sticky and transparent. A single initial flow offset supports their composition; graph-height padding is not repeated before every scene. Sections use a reduced 72svh minimum rather than the old 80svh. Content can extend naturally when it needs more height. The graph remains behind the editorial layer as text scrolls through it.

Reduced motion receives the same continuous atmosphere and transparent stages, with static camera offsets and direct focus indication. It does not restore panel backgrounds. Home is outside the `.branch-universe` scope and retains its centered universe, local Canvas, Genesis, node-first/edge-second sequence and scroll dissolution/reconstruction.

## Verification and evidence

- All eight approved public-content SHA-256 hashes match. Global graph remains 38 nodes/50 relationships; Flood remains 7/8.
- `pnpm lint`, `pnpm typecheck`, all 75 `pnpm test` checks, and `pnpm build` pass.
- All ten public routes return HTTP 200 with one H1 and expected approved prose. No invented Engineering route.
- Browser audit checks one persistent canvas, retained semantic DOM, unchanged base transforms, visible nodes/edges, no graph Genesis replay, one tracer per stage and subpixel settled alignment.
- Computed backgrounds are transparent, logical stages have visible overflow, empty-stage/tracer hit testing is disabled, and document width stays within the viewport.
- AI traversal covers all six approved narrative scenes forward and backward, plus rapid reversals. The AI & Technology introduction remains the existing route heading rather than an added content scene.
- Actual drag selection checks body copy, hover/tap checks semantic controls, and real Research-to-Flood link navigation checks foreground input through the transparent layers. Compact recordings include native touch direction reversal.
- All other branch routes and About scopes are checked on desktop and compact. Reduced motion is checked at both sizes. Home is checked through repeated 38/50 dissolution/reconstruction cycles.
- All 24 browser scenarios pass: four recorded AI viewports, sixteen other-route/viewport combinations, two reduced-motion cases and two Home regressions. No console or page errors were captured.

Retained production AI recordings and corresponding screenshots:

- [1440×900](qa/phase-13e-ai-1440x900.webm)
- [1366×768](qa/phase-13e-ai-1366x768.webm)
- [390×844](qa/phase-13e-ai-390x844.webm)
- [430×932](qa/phase-13e-ai-430x932.webm)

Machine-readable evidence is in `docs/qa/phase-13e-*-results.json`. `scripts/qa-phase-13e.mjs` accepts `PLAYWRIGHT_MODULE`, `QA_ORIGIN`, and `QA_MODE` (`ai`, `routes`, `reduced`, `home`, `all`). Browser tooling is external and no dependency was added.

## Limits

Compact verification uses Chromium touch emulation, not physical iOS/Android hardware. Readability uses composition and a localized CSS falloff rather than runtime per-edge collision masks. About retains its two existing persistent semantic scopes and its prior policy of omitting a tracer when the scene topic is outside the identity projection. The final visual result still benefits from the user's perceptual review on their display.

PHASE 13E: PASS — SEAMLESS BRANCH UNIVERSE COMPLETE
