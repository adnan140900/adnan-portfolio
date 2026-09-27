# Phase 14A — Mobile legibility and semantic spacing

Work is isolated on `phase-14a-mobile-legibility`, created from the current Phase 13E merge on `origin/main`. This phase changes compact presentation only. Public content, graph topology, authoritative coordinates, routes, Home choreography and desktop composition are unchanged.

## Real-device issues addressed

The Phase 13E compact graph showed six to nine labels at once. The 390×844 baseline reproduced the reported failures: Leadership, Learning, Research and AI contained one to three measurable label intersections, while the active graph-to-title clearance fell to roughly 28px. The Phase 14A policy reduces visible semantic ink rather than removing nodes or shrinking the network.

## Compact label policy

`compact-label-policy.ts` assigns a deterministic presentation priority:

1. active node;
2. active parent;
3. route root;
4. direct semantic neighbor;
5. primary anchor;
6. supporting/context node.

At most four labels can remain visible. Supporting and unrelated context labels stay as nodes and relationships but do not paint text. The active label is exempt from suppression and therefore always wins. Parent/root and direct-neighbor labels are admitted only when they fit without colliding with an already accepted higher-priority label.

The resolver sorts by semantic priority and stable node ID, so identical geometry always produces identical output. It uses screen-space bounds after projection and a five-pixel collision buffer. A shared safe inset suppresses non-active labels that approach the editorial boundary. No graph node moves, no edge changes, and no random jitter is used.

The existing single branch focus controller applies the policy on focus and SVG resize. It reuses the one existing `ResizeObserver`; there is no observer per node and no animation-frame collision loop. CSS opacity removes only visual ink. Interactive graph controls now carry explicit accessible names, and the existing relationship descriptions remain available to assistive technology.

## Projection, tracer and spacing

The compact portrait projection uses 62% of canonical horizontal displacement instead of 48%, with a safe 44-unit clamp. This modestly increases usable width without changing topology or the canonical D3 solution. Vertical projection remains unchanged.

The Phase 13D tracer remains authoritative. Its active label receives the highest collision priority and retains its existing tracer-aware offset. Nodes, idle motion, incident-edge emphasis and reframe timing are unchanged.

Compact branches use shared spacing tokens, `svh` for stable browser-chrome composition, and a reading band just beyond the graph zone. Sparse projections (four nodes or fewer) use the same full graph scale with an earlier reading band; this avoids a large blank interval without route-specific rules. Dense cases retain more separation. Measured graph-ink-to-title clearance across the mobile matrix is 44.6–85.6px; sparse Nothipotro is 44.6–52.8px and dense Research/Flood is 44.8–49.9px.

## Editorial and navigation refinements

Compact scene titles now use `clamp(1.8rem, 7.8vw, 3.15rem)`, measuring 28.8–33.5px across the required devices, with a 14ch maximum measure. This is an approximately 10–15% reduction from the previous 32.4–38.7px range. Compact body copy remains 15.2px with the existing comfortable line height.

Route intros receive more deliberate bottom breathing room and a slightly smaller responsive heading. Ghost vocabulary is reduced to 0.008 opacity. The local reading falloff is slightly stronger but remains an unbordered radial attenuation rather than a card or panel.

The primary horizontal rail remains native and single-line. Inactive indices and labels are quieter, the index/title gap is clearer, active items remain strongest, and active-item centering is unchanged. Primary and semantic-index links measure at least 44px high. Horizontal scrolling and native page scrolling remain enabled.

## Route results

| Dense benchmark | Sizes | Visible labels | Graph/title gap | Intersections | Overflow |
| --- | ---: | ---: | ---: | ---: | ---: |
| Research · Flood Accessibility | 4 | 4 | 44.8–49.9px | 0 | 0 |
| Flood · Validation | 4 | 3 | 64.9–80.5px | 0 | 0 |
| Projects · Nothipotro | 4 | 3 | 57.7–67.5px | 0 | 0 |
| Nothipotro · Student Learning Needs | 4 | 2 | 44.6–52.8px | 0 | 0 |
| AI · AI Agents | 4 | 2 | 54.6–63.8px | 0 | 0 |
| Leadership · Public Speaking | 4 | 3 | 61.6–73.9px | 0 | 0 |
| Learning · Learning Through Projects | 4 | 2 | 58.0–67.8px | 0 | 0 |
| About · Flood Accessibility | 4 | 4 | 73.2–85.6px | 0 | 0 |

The four sizes are 360×800, 390×844, 412×915 and 430×932. Every active label is visible; each scene retains its immediate readable context while all original nodes and edges remain mounted.

## Reduced motion, desktop and Home

Reduced motion uses the same compact label resolver and transparent universe, with no animated reframe. Its active label, collision and overflow checks pass.

At 1440×900 and 1920×1080, no compact-label attributes are applied and the Phase 13E desktop CSS is unaffected. Desktop comparison captures retain the accepted constellation, typography and tracer composition.

Home remains outside the branch policy. Normal and reduced-motion Home checks retain 38 nodes, 50 relationships, no compact branch labels and no horizontal overflow. Genesis, dissolution/reconstruction, Decode Typewriter and idle ownership are unchanged.

## QA evidence

- `scripts/qa-phase-14a.mjs` exercises 37 browser scenarios with zero console or page errors.
- `docs/qa/phase-14a-results.json` contains geometry, label, accessibility, touch-target and overflow results.
- Required 390×844 and 360×800 captures are retained for Leadership/Public Speaking, Learning Through Projects, Research/Flood, Projects/Nothipotro and AI Agents.
- All eight requested routes are also captured at 412×915 and 430×932.
- Desktop comparison captures are retained at 1440×900 and 1920×1080.
- `phase-14a-mobile-traversal-390x844.webm` is retained locally and remains ignored by Git.

Automated compact QA uses Chromium touch emulation. It can validate geometry, collision, touch targets, scrolling and runtime errors, but cannot reproduce every Android font-rendering, address-bar or OEM browser difference. Final physical-device review remains the release gate.

## Final verification

- `pnpm verify:content`: PASS — all eight approved SHA-256 hashes match.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS — 80/80 tests.
- `pnpm build`: PASS — all ten public routes and the not-found route statically generated.
- Dependency and public-content diffs: none.

PHASE 14A: PASS — MOBILE LEGIBILITY STABILIZED

## Owner-approved release copy update

During final release preparation, the owner directly authorized replacement of the Home introduction with the multiverse headline, supporting statement, and invitation stored in `content/public-export/profile.json`. The About biography, route copy, graph content, topology, and Phase 14A mobile system remain unchanged. The approved-content baseline was updated only for `profile.json` after this explicit authorization.

The exact published Home copy is:

> YOU’VE ENTERED THE MULTIVERSE OF ADNAN
>
> Every node is a fragment of who I am —<br>
> projects, research, ideas, stories, and obsessions.
>
> **Choose a node to begin exploring.**

The authorized `profile.json` SHA-256 changed from `f12f53de06708280343713a0ed8d98dbe3b82ac913e90ee844a006b1a3aa6b50` to `5b63cc4be9050ec14cbdca4b3b14c07b22ed97da0e81e65362bd4ce8ab4dd9c6`. All seven other approved baselines are unchanged.

Production-build browser QA passed at 1440×900, 360×800, 390×844, 412×915, and 430×932 with no browser errors or horizontal overflow. The headline remained larger than its supporting copy, the CTA computed at weight 700, and every scroll reconstruction returned to 38 nodes and 50 relationships at progress zero. Evidence is recorded in `docs/qa/phase-14a-home-copy-results.json` and the matching `phase-14a-home-multiverse-*.png` captures.
