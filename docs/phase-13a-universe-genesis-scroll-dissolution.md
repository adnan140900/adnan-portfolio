# Phase 13A — Universe Genesis + Scroll Dissolution

Implemented on `improvement-v2`. No deployment, commit, dependency, public JSON, route, text, typography, graph-topology, or authoritative-coordinate change.

## Ownership and lifecycle

`src/features/universe/universe-motion-model.ts` is a pure presentation model. Node IDs seed independent field vectors, a restrained tangential bend, scale and opacity. All 38 actual semantic nodes participate; no surrogate particle graph is created.

`universe-motion-controller.ts` uses one temporary three-second GSAP entry clock and an event-coalesced native-scroll RAF. It never starts another physics simulation or a permanent idle loop. The existing projection bridge composes base geometry, story offsets, weighted idle offsets and temporary universe offsets for nodes and edges. The body wrapper adds scale/opacity without altering D3 coordinates. Canvas atmosphere is untouched.

- Fresh Home document: scattered nodes converge during the first 1.73 seconds. Labels resolve by 1.88 seconds. The first edge starts at 1.9 seconds; staggered relationship drawing completes at three seconds.
- Rest: every added body transform, opacity, label filter, edge dash override and surface translation is removed. The universe offset map is empty and idle weight is exactly one. Existing semantic idle resumes with its original parameters.
- Scroll: the current native scroll position directly determines progress. There is no smoothing queue, replay, accumulated delta, scroll-jacking, pinning, or content spacer. Reversing direction uses the same absolute function.
- Early scroll cancels Genesis and immediately seeks the equivalent scroll frame. Internal Home returns do not replay Genesis; hard reloads do.
- Route transition, cleanup or control interaction releases temporary graph presentation. Focus restores readable controls; navigation keeps its existing owner. Listeners, observers, RAF and entry tween are disposed on unmount/preference/viewport changes. Hidden tabs pause the entry clock.

The former compact-only Home branch reveal is replaced, not run alongside Genesis. Other routes retain their existing branch/transition behavior.

## Scroll choreography

The interval begins at the existing hero below the header and spans `max(240px, min(55% of hero height, 65% of viewport height))`. Measured QA distances: approximately 460px desktop and 431px compact. The graph surface receives a bounded 22%-of-interval visual translation while departing; layout and subsequent sections remain unchanged.

| Progress | Presentation |
| --- | --- |
| 0 | Existing complete constellation and idle |
| 0.015–0.24 | Primary relationships retract toward their actual source |
| 0.10–0.32 | Secondary relationships retract |
| 0.18–0.38 | Tertiary relationships retract |
| 0.12–0.52 | Deep, then secondary, then primary labels progressively disappear |
| 0.40–1 | Nodes scatter, shrink and dim into the existing atmosphere |
| 1 | Deterministic, stationary semantic fragments; no connections |

SVG normalized dash progress retracts existing straight paths. All edges are hidden before displacement begins. In reverse, all nodes reach their base coordinates before any relationship draws. The frozen pre-scroll idle offset is smoothly weighted out/in during displacement, then its clock resumes at rest. No coordinate integration occurs, so repeated cycles cannot accumulate drift.

Compact full-motion devices use the same semantic sequence with shorter seeded field vectors. Touch is not treated as reduced motion. Reduced-motion devices have no Genesis/scatter controller and retain the complete static constellation while the page scrolls naturally. A CSS preference/scripting gate prevents a pre-hydration assembled-graph flash; reduced-motion and no-JavaScript views remain visible.

## Verification

- `pnpm verify:content`: all eight immutable SHA-256 checks passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 65 passed, including three new Genesis, reversible model and projection-reset tests.
- `pnpm build`: passed; all existing public routes prerendered successfully.
- Browser QA: Chrome at 1440×900 and touch-enabled mobile emulation at 390×844. Each recording includes fresh entry and a five-second rest. Dissolution recordings additionally include slow native wheel scrolling, a two-second mid-scroll hold, full scatter, reconstruction, restored idle, and rapid reversal cycles. Mobile additionally exercises CDP touch swipes with momentum/reversal.
- Assertions check 38 nodes/50 relationships, all edges absent before node scatter, unchanged transforms/idle clock during a hold, unchanged authoritative coordinates after repeated cycles, and removal of temporary presentation at rest.
- Reduced motion, switching to full motion, navigation during dissolution, single-tap graph navigation, internal Home return, and isolation from Research passed. No browser console/page errors were reported by the recorded runs.
- Additional checks: scroll interruption during Genesis resolves immediately to scroll ownership; returning to zero restores rest. With JavaScript disabled the semantic graph remains visible.
- Recording review found and fixed the initial SSR flash; all four recordings were regenerated after that fix. An optional-recorder CommonJS lint issue was corrected by using the existing ESM tooling convention.
- Mobile frame review exposed stale desktop depth endpoints in the shared projection cache after compact geometry resolved. The physics handoff now refreshes the authored depth coordinates (never during scroll). An extended unit regression and browser checks assert that all 50 edges attach to their current node endpoints. This corrects alignment without changing any approved node position or relationship.

Mobile verification is browser emulation, not a physical iOS/Android device performance certification. The existing idle/atmosphere continue at rest; no five-minute physical-device soak is claimed.

## Retained artifacts and reproduction

- [Desktop Genesis](qa/phase-13a-genesis-desktop.webm)
- [Mobile Genesis](qa/phase-13a-genesis-mobile.webm)
- [Desktop reversible scroll](qa/phase-13a-scroll-dissolution-desktop.webm)
- [Mobile reversible scroll](qa/phase-13a-scroll-dissolution-mobile.webm)
- [Machine-readable browser results](qa/phase-13a-results.json)

Run the existing application with `pnpm dev`. The optional `node scripts/qa-phase-13a.mjs` recorder uses an already-installed Playwright tool and Chrome, without adding application dependencies. Set `PLAYWRIGHT_MODULE` to that tooling module if it is not normally resolvable; `QA_ORIGIN` defaults to `http://localhost:3000`. Recordings are deliberately exempted from the general video ignore rule by four exact filenames.

The user-provided interaction principle informs formation/reversal only. No galaxy, spiral, external artwork, branding, or reference particle arrangement was copied.
