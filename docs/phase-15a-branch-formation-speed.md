# Phase 15A — Faster Branch Constellation Formation

## Scope

Phase 15A changes only the scene-to-scene focus timing of persistent branch and subject constellations. Home Genesis, the Home universe, route-entry branch growth, graph geometry, topology, content, typography, Decode, atmosphere, navigation, reduced motion, and Phase 14A/14B behavior remain unchanged.

## Timing owner

The visible branch-scene reorganization is owned by `branch-focus-controller.ts`, which keeps one persistent SVG alive and moves its presentation camera and semantic focus tracer together. Public world pages use `NarrativeFilm` with `data-branch-persistent="true"`; therefore the 0.60/0.18 second durations in `semantic-stage-controller.ts` are not the owner for these routes. That controller also participates in non-persistent Home narrative behavior and was intentionally left untouched.

The distance-scaled timing calculation now lives in `branch-focus-model.ts` so it can be tested without a browser timeline.

| State | Previous | Phase 15A | Reduction |
| --- | ---: | ---: | ---: |
| Short branch focus change | 280 ms | 210 ms | 25% |
| Long branch focus change | 420 ms | 315 ms | 25% |

The existing `power2.inOut` camera/travel easing and `power1.out` tracer resolve are unchanged. Camera and tracer still share one GSAP timeline, so no independent tracer adjustment was required and no lag was introduced. The initial persistent scene keeps its existing direct stable handoff after route formation; reduced-motion behavior remains immediate and unchanged.

## Regression protections

Focused tests assert the new bounded branch timing and exact 25% reduction. They also freeze the existing Home `genesisDuration` (5.2 seconds), shared route-formation tokens, and the non-persistent 0.60/0.18 second semantic-stage timings. Existing tests continue to protect 38 nodes / 50 relationships globally and Flood's 7 nodes / 8 relationships.

## QA

The reusable `scripts/qa-phase-15a.mjs` matrix inspected all required routes in Chromium desktop, Android-sized Chromium, WebKit desktop, and iPhone-sized WebKit: 32 branch-route scenarios plus four frozen-Home checks.

- Forward and reverse scene selection passed wherever the approved route has multiple scenes. `/research` and `/projects/knowledge-workflows` currently contain one scene, so reverse scene selection is not applicable there; their stable branch stages were still checked.
- Every transitioned tracer settled at opacity 0.64 and stayed aligned to its active SVG star. Maximum measured center error was below 0.001 CSS pixel.
- Active labels remained rendered and readable; incident approved edges remained emphasized with the selected node.
- No node/edge disappearance, `foreignObject`, Next.js error overlay, console error, or page error appeared.
- Flood retained 7 nodes / 8 relationships in every engine and viewport.
- Home retained 38 nodes / 50 relationships with no branch tracer in all four profiles.
- The same timing function is used on wide and compact profiles. No browser-specific timing path was added.

Repository verification passed: `pnpm verify:content`, `pnpm lint`, `pnpm typecheck`, 83/83 tests, `pnpm build`, and `git diff --check`. All eight approved public-content hashes remain unchanged.

## Status

PHASE 15A: PASS — BRANCH CONSTELLATION FORMATION ACCELERATED
