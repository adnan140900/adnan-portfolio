# Phase 9Y — Semantic constellation rebuild

## Scope and recovery

This phase changes presentation and motion ownership, not public content. The existing application was continued in place. No repository metadata is present in this directory (`git status` reports no Git repository), so a Git diff cannot be supplied; no repository was initialized. Existing Phase 1–9X architecture and unrelated work were retained.

The interrupted session left valid source changes and a working production preview. No dependency repair, reinstall, lockfile deletion or policy bypass was necessary. During initial QA, the development server reported an internal Turbopack HMR cell/version panic and slow-filesystem warning. It was stopped, and the normal production build/start workflow was used for verification. The package manifest, lockfile and workspace policy hashes remain unchanged.

## Universe hierarchy: before and after

Previously, deeper semantic nodes used a globally scattered best-candidate distribution, and their motion was substantially slower/smaller than the themes. They could read as background dust rather than meaningful neighborhoods.

The root remains centered at `(520, 290)`. Six primary themes use a deterministic elliptical ring. D3 settles toward these authored anchors rather than allowing its general centering force to erase the ring. It still owns equilibrium and optional desktop drag physics.

All 31 deeper nodes remain visible behind the seven primary controls. Outgoing approved relationships establish reachability. When multiple themes reach a node, its existing public category selects its home region. Local candidate placement reserves label footprints and breathing room around the primary ring. No inferred edge, new category, filler node or public view membership was added. Shared concepts remain in their home neighborhood while real cross-links bridge regions.

| Layer | Radius / opacity | Label opacity |
| --- | --- | --- |
| Adnan | Strongest existing anchor treatment | Primary |
| Six themes | Dominant readable controls | Primary |
| Depth 2 | 2.2 SVG units / 0.64 | 0.52 |
| Depth 3 | 1.45 SVG units / 0.44 | 0.36 |

## Three edge tiers

| Tier | Default opacity | Stroke width |
| --- | --- | --- |
| Root → six themes | 0.58 | 0.78 |
| Theme → major child (`includes`) | 0.39 | 0.65 |
| Tertiary / cross-link | 0.25 | 0.55 |

Strokes are straight, thin and glow-free. Theme preview raises reachable internal edges to 0.60, strengthens the primary incident edge, and reduces unrelated deep edges to 0.10. Public relationship IDs, direction, endpoints and accessible wording are unchanged.

## Depth-band motion

| Band | Horizontal amplitude | Period |
| --- | --- | --- |
| Root / actual view anchor | 0.65 | 65–87 seconds |
| Primary themes | 7–10 | 38–48 seconds |
| Universe depth 2 | 10–13 | 22–30 seconds |
| Universe depth 3 | 12–15 | 18–26 seconds |
| Subject concepts | 10–14 | 22–34 seconds |

Vertical amplitude is 45–70% of horizontal amplitude. Public-ID-derived phase, eccentricity and independent periods keep motion deterministic and bounded. The settling envelope is two active seconds. Tests check that at least 24 deeper nodes move more than five graph units over each sampled five-second interval, while per-frame displacement remains bounded. This is not random wandering.

One existing 30-fps clock owns idle offsets. D3 does not run continuously. Hover/focus and drag stabilization remain; stale keyboard focus no longer permanently freezes a node after blur. The projection bridge composes D3 base + GSAP story + idle offsets for both nodes and their real edge endpoints.

## Flood semantic topology and persistent stage

Flood retains seven nodes and eight actual relationships. The Flood anchor is central; the existing engineering category places Road Networks and Geospatial Analysis in a method region. The research category places disruption/restoration, critical health-service access, exposure and validation/uncertainty in the opposite region. Actual health → disruption and exposure → validation relationships remain visible.

The canonical interactive `KnowledgeGraph` now lives inside `NarrativeFilm` on every public world route. There is no second decorative replacement graph on these routes. Native controls, labels, summaries and Connections disclosures remain on the same constellation throughout the story. The home focus and About editorial films retain their separate decorative projections.

The existing idle clock continues when scrolling stops. The scroll driver writes a separate offset map through the shared projection bridge, so geometry changes do not overwrite idle motion or physics. The graph persists while editorial sections resolve independently.

Entry QA caught a full-width → reading-stage resize at the end of branch formation. Stage layout is now established as soon as the motion preference resolves, independently of the suspended scroll controller. Cinematic entrance waits for the destination preference/layout to be ready. This preserves graph dimensions across the branch-growth handoff; reduced/no-JavaScript content stays in normal flow.

## Flood scroll transformation

The eight exact approved sections remain, with their original item-level mappings. The following are explicitly authorized **presentation emphasis**, not export mutations or research findings:

| Section | Visual emphasis |
| --- | --- |
| Question | Anchor and central health/disruption questions |
| Motivation | Health-service access and disruption/restoration |
| Method | Road Networks and Geospatial Analysis |
| Data and assumptions | Flood Exposure Scenarios, conditional dashed edges |
| Exploratory work | Anchor and Geospatial Analysis |
| Limitations | Receding structures, reduced edge emphasis, conditional treatment |
| Validation | Validation and Uncertainty and its incident relationships |
| Uncertainty | Exposure/validation relationships and bounded divergence |

Only approved edges can be emphasized. Continuous geometry interpolation precedes the section change; the constellation never fades to blank. The caption explicitly identifies this as a visual metaphor, not geographic data. No operational closure, confidence score, travel-time result or restoration finding is invented.

## Editorial typography, layers and route personalities

Foreground reading has a protected right-hand region on enhanced desktop stages. Headings rise at most 18px and body copy 12px through refined masked/fade treatment; they no longer travel 170–260px with the graph. The graph occupies an independent midground. Ambient Canvas points and low-opacity, approved associated vocabulary remain behind both.

Large motion is reserved for background masks/words (120–240px) and composition shifts, not paragraphs. Background vocabulary excludes the active heading and comes from real neighboring public labels. Exact approved scene titles can identify presentation focus without changing the source moment's `topicId`.

Research is analytical and directional; Projects separates/assembles branches; AI uses distributed independent offsets; Leadership has much smaller, calmer offsets; Learning reforms its arrangement through independently phased shifts. About retains quiet ambient presentation. These profiles share the same palette, geometry and controller; they do not create separate design systems.

## Redundancy and interaction audit

The duplicate standalone graph above each public-world film was removed. Graph section headings remain accessible but visually hidden; the labelled graph anchor still provides necessary spatial context. The inspector remains collapsed until requested. Repeated statuses are shown only on their first meaningful occurrence in each route sequence; source status data is untouched. Repeated active-heading ghost words were removed from associated vocabulary.

Universe theme hover/focus reveals the full outgoing reachable neighborhood, including depth-3 concepts. Subject inspection is deliberately local: active node, immediate neighbors and incident edges. Hover/focus now updates an exact approved summary annotation; the permanent inspector follows the same active identity.

Decorative SVG depth layers, generated vocabulary and large background words remain `aria-hidden`. Canonical links/buttons and the relationship disclosure do not depend on the visual layout. Approved narrative prose remains one semantic copy per section.

## Mobile, reduced motion and performance

Desktop grammar was inspected before mobile adaptation. Mobile keeps one canonical, static constellation control layout, followed by normal-flow editorial sections with restrained background vocabulary; no repeated ornamental graph per paragraph. The homepage retains its static unlabelled deeper background. Layout grows with content and does not clip the control list. Mobile progress changes near the reading region rather than when the next section first peeks into view.

Reduced motion retains the full static semantic layout and native navigation. It disables idle drift, large cinematic motion and generated-vocabulary loops. Tests execute the reduced film lifecycle and verify that panels are never hidden/enhanced and observers disconnect. Live operating-system preference switching and screen-reader/device certification are separate manual acceptance checks, not claimed by the unit tests.

No additional RAF clock or permanent physics loop was added. DOM references/maps are cached. Story writes happen through GSAP; idle uses the existing capped clock; React updates occur only for semantic interactions, not every animation frame. Hidden/offscreen/unresolved/reduced/mobile policies retain their pause/static behavior. Scoped timelines, listeners, observers and projection offsets clean up on route/preference changes. The 60-node deterministic D3 regression remains bounded and stopped after handoff.

## Files changed

New files:

- `src/features/narrative/semantic-stage-model.ts`
- `src/features/narrative/semantic-stage-controller.ts`
- `src/features/narrative/semantic-stage.css`
- This report.

Updated files:

- `src/features/graph/universe-depth.ts`
- `src/features/graph/universe-depth.css`
- `src/features/graph/components/universe-depth-layer.tsx`
- `src/features/graph/components/knowledge-graph.tsx`
- `src/features/graph/physics/graph-geometry.ts`
- `src/features/graph/physics/force-graph-controller.ts`
- `src/features/motion/semantic-idle-model.ts`
- `src/features/narrative/film-model.ts`
- `src/features/narrative/film-controller.ts`
- `src/features/narrative/narrative-film.tsx`
- `src/features/transitions/portfolio-transition-provider.tsx`
- `src/components/public-world-page.tsx`
- `src/app/globals.css`
- `src/tests/graph-domain.test.ts`
- `README.md`

## Verification ledger

The final regression pass, including the formation-layout correction, has clean lint, successful TypeScript checking, **48/48 tests**, and a successful production build with all ten public routes statically generated. Ten approved routes plus the intentional Engineering 404 passed again against that final build. Leak scan inspected 245 files and found 12 matches, all framework Fetch `credentials` and Next `freshnessPolicy` identifiers, not private content. All eight approval hashes were rechecked successfully.

Desktop captures inspected at 1440 × 960: Universe idle, Research and AI keyboard-focus neighborhood previews, Flood Question/Method/Validation/Uncertainty, AI, Learning and Projects. Captures are inline in the task tool outputs, not new website assets. Flood Validation retained changing semantic offsets through a measured 38.375-second stopped-scroll interval; AI through 46.98 seconds. Universe samples showed sustained live movement after 25 and 43 active seconds.

Final-build interaction checks:

- Actual pointer-hover captures for Research and AI, with context menus dismissed before capture. Research correctly reveals Flood plus its four research concepts and the two shared engineering methods; unrelated neighborhoods recede.
- A further **54.513-second universe idle interval** retained changing deep-node offsets and a stable primary hierarchy.
- At the 390 × 844 viewport override (375px usable width after scrollbar), all ten routes have `scrollWidth === clientWidth`, one H1, and no cinematic desktop enhancement. All graph routes report `idlePhase: static`.
- Mobile Projects and Flood Method screenshots show readable prose, accessible controls, restrained background terms, and no horizontal clipping. Browser error log remained empty.
- Ordinary Flood scrolling was observed over **33.707 seconds**, moving from Method through subsequent sections to Uncertainty. The same seven nodes/eight edges persisted, the idle clock kept advancing, and exposure/validation emphasis and conditional edges changed with the narrative.
- The destination SVG measured exactly `(left: 0, top: 189.4375, width: 912, height: 698.875)` both during subject branch formation and after its handoff. No end-of-entry resize remained.
- Keyboard focus on Geospatial Analysis displayed its exact approved summary and marked only Flood Accessibility as its immediate neighbor; unrelated concepts were not marked as neighbors.
- A cold reload of the Flood Method hash resolved to scene 2. Browser Back restored Flood Method after visiting AI, and Forward restored AI with its seven-node graph.
- The AI Hermes scene emphasized Hermes and its actual adjacent concepts; Local AI remained lower-emphasis, not an invented neighbor.
- Research entry was interrupted while its cinematic transition was active by selecting Learning. Learning won, returned to living idle, and left zero busy/cinematic markers. The final browser error log was empty.

## Warnings and completion

No known visual or semantic blocker remains in the exercised desktop/mobile paths. This is not a claim of full device, assistive-technology or performance certification. Live OS reduced-motion switching was not available through the browser controls; reduced behavior was covered by lifecycle tests and static-policy review. Screenshots and timed observations were captured inline rather than as a recorded video. Git diff verification is unavailable because this directory has no Git metadata.

Production preview is available at `http://localhost:3001/`, started with `pnpm start --port 3001`. The existing dependency files remain byte-for-byte unchanged. No Phase 10 work or deployment was performed.

## Source hashes

All eight release-file SHA-256 values match the existing approval gate:

```text
ai.json          2debe89c32b7eb33ae8e8d65fc5752ae1870c5c41b84bd8967654dd270df5602
graph.json       36ad5eba997172b8fe174c1be808717a90a2e508a16c5551593d32c0a612b8c3
leadership.json  0954e882ddce91bd4c42fabde00db9b5c93ce417575974c32d1b8b0fd208fa18
learning.json    a1f2056dc4bac374016ce681488e779698479a18eea1b129ed6970a2da034051
manifest.json    9d189624aab8d19aa799067e4c0b9dc4e305af5c8ece229fd12ca226ee88c98c
profile.json     f12f53de06708280343713a0ed8d98dbe3b82ac913e90ee844a006b1a3aa6b50
projects.json    6b87b8522c874470bcaa683693f1dc5a760150037d50c67da269497f4a30257d
research.json    b59c1ea77a6a3e5f5bee4bfb929f6a93e32f39f999baf5fc936a280d014d3d2d
```

Graph count: **38 nodes / 50 approved relationships**. No private sources accessed, no new claims, assets or dependencies, no deployment and no Phase 10 work.

PHASE 9Y: PASS — SEMANTIC CONSTELLATION SYSTEM REBUILT
