# Phase 5 visual-direction requirements

Status: implemented in Phase 5. See README.md for architecture and verification scope.

These user-specified corrections take precedence over conflicting Phase 4 visual choices. Preserve the existing graph data model, relationship semantics, routing, D3/GSAP ownership boundaries, accessibility, mobile behaviour, and reduced-motion architecture. The desired direction is **dark + precise + geometric + luminous**, rather than a soft, neon, glowing interface.

## A. Geometric connections

Replace curved relationship edges with straight lines and, where appropriate, angular or segmented connections that form geometric constellation structures. Use thin, restrained strokes, very low default opacity, and minimal glow.

Avoid large Bézier curves, strongly glowing lines, and rounded flowchart styling. Stars and nodes should provide the primary luminous emphasis; relationships must not read as thick glowing strokes. Preserve relationship meaning internally and accessible semantic navigation.

## B. Network growth on Research entry

Prototype a visible branch-growth sequence that expands outward from the selected Research star:

1. Research becomes the anchor star.
2. A primary connection grows outward from that anchor.
3. A child star resolves at the connection endpoint.
4. Additional branches extend in different directions.
5. Additional child stars appear at their endpoints.
6. Secondary relationships can then propagate, where they exist in the graph data.
7. Labels resolve during or after node formation.

The sequence should read as `star → branch → star → branches → constellation`. Do not reveal the entire Research constellation with a single fade or rely on an `old graph → fade → new graph` impression.

GSAP owns reveal sequencing; D3 owns stable final geometry. Growth must resolve into the real semantic graph and its actual relationships without inventing decorative semantic edges. Retain transition interruption cleanup, direct-route consistency, keyboard navigation, and the existing mobile and reduced-motion fallbacks. Reduced motion must provide the complete graph without requiring spatial branch animation.

## C. Richer perceived universe density

Improve the decorative Canvas distribution so the seven-node placeholder view feels like part of a larger universe. Use more far-depth points, mid-depth stars, subtle decorative clusters, occasional faint dust or noise, and distant points suggesting greater scale.

Do not add meaningless semantic nodes to fill space. Decorative stars remain outside the graph data, inaccessible to keyboard focus, and absent from assistive-technology navigation. Design the atmosphere around an eventual 30–60 curated semantic nodes while keeping the current sparse dataset visually rich.

Preserve adaptive density for mobile and lower-power devices, bounded rendering resolution, hidden-tab pausing, and the existing separation between Canvas atmosphere and semantic SVG/DOM controls. Validate both seven-node readability and the intended future scale.

## D. Reduced glow

Reduce the current default glow on both nodes and edges. Reserve luminous emphasis mainly for focused or selected stars and occasional active relationships. Default marks should remain precise and restrained; even active connection glow should be extremely subtle.

Maintain visible keyboard focus and readable active labels while avoiding thick halos, excessive bloom, neon edges, or a glowing UI appearance.

## Acceptance checks for implementation

- Both `/` and `/research` use geometric, thin relationships with very low default opacity.
- Research entry visibly grows branches from its anchor and resolves child stars at endpoints before the full constellation is present.
- The ambient universe gains depth and density without changing semantic node counts merely for decoration.
- Default glow is visibly reduced; focus and selection remain clear.
- D3 owns final geometry, GSAP owns sequencing, and React retains semantic state and navigation.
- Direct entry, reverse navigation, keyboard use, mobile layouts, reduced motion, and transition cleanup remain functional.
- Runtime profiling checks the richer Canvas atmosphere and growth sequence for obvious regressions, including the future 30–60-node scale.
- Required lint, typecheck, focused tests, production build, and route/runtime checks pass after implementation.

## Scope and sequencing

These are required visual corrections for Phase 5. The public export pipeline, real story routes, and subject transitions remain future work; Phase 5 implements only placeholder motion scenes. Do not access or import the private Obsidian vault.
