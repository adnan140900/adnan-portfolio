# Phase 9 — cinematic visual refinement

## Scope and visual audit

Before editing, all ten public routes were inspected at desktop 1440 × 1000 and mobile 390 × 844. Research keyboard entry, Flood subject entry, node inspection, parent return, and Flood scroll scenes were also inspected. The eight approved public-export hashes matched before work and after each interrupted-session recovery.

Weakest areas: the homepage placed most graph navigation below the fold; supporting labels had very low contrast; identical sans-serif headings lacked editorial hierarchy; About felt detached from the universe; prose and graph labels shared space; the inspector competed with reading; long labels needed more physical clearance. The existing geometric connections, content boundary, and motion ownership were sound and retained.

## Refinements

1. Typography: warm/off-white local-system serif display faces, restrained sans-serif reading text, monospaced metadata/status. Approved wording is unchanged. Long headings wrap intentionally; compact SVG labels wrap at word boundaries without abbreviation.
2. Universe: near-black layered background, a shared decorative field across routes, predominantly far-depth stars, reduced point radii, independent slow twinkle frequencies, slower drift, no external assets or decorative semantic IDs.
3. Node hierarchy: primary/featured/supporting core sizes, distinct root typography, precise default cores, restrained selected/focused bloom. Label readability no longer depends on hover.
4. Connections: exact straight semantic endpoints retained; strokes refined to 0.65 px, restrained default/active opacity, no glow. Existing proposed/checking dashes remain.
5. Expansion: the existing graph-derived plan now schedules each child’s outgoing branches after its formation. Cross-links settle after discovery branches. Stars emerge from small scale after branch arrival; labels resolve afterward. No extra relationships are manufactured.
6. Pointer: slower, smaller layered parallax; optional desktop proximity emphasis and dragging retained. SVG screen-matrix conversion keeps dragging aligned in narrower graph regions. No touch pointer effect.
7. Routes: native links, direct-route content, history and latest-navigation cancellation retained. Whole-page fade was removed; cinematic source/overlay/destination handoff remains guarded. Persistent desktop navigation marks the current route or parent location.
8. Subject worlds: dedicated reading column and reserved annotation space; no card grid or dashboard chrome. About uses a spatial two-column editorial layout. Leadership uses calmer title scale. Project status and research limits remain visible.
9. Flood: eight approved stages remain in order, with section numbering, restrained title settling, bounded camera changes, geometric relationships and compact conceptual snapshots. No section-to-node mappings or geographic/operational claims were invented.
10. Pacing: architectural section rules, longer line-height, controlled line length, clearer statuses, more deliberate spacing. Long prose remains fully available, never animation-gated.
11. Mobile: static lower-density Canvas, touch-safe controls, two-column idea navigation, normal-flow inspector, wrapped diagram labels, readable single-column narrative. Short desktop screens also receive an unpinned annotation band.
12. Reduced motion: static geometry and full native navigation remain. No required spatial transitions, parallax or drift. Unresolved preference does not start motion.

## File manifest

Created:

- `src/features/motion/visual-refinement.css`
- `src/features/graph/graph-labels.ts`
- `src/components/layout/primary-navigation.tsx`
- `docs/phase-9-verification.md`

Changed:

- `README.md`
- `src/app/globals.css`
- `src/components/public-world-page.tsx`
- `src/components/layout/site-header.tsx`
- `src/features/atmosphere/starfield-policy.ts`
- `src/features/atmosphere/ambient-starfield.tsx`
- `src/features/graph/components/knowledge-graph.tsx`
- `src/features/graph/physics/graph-geometry.ts`
- `src/features/graph/physics/force-graph-controller.ts`
- `src/features/graph/physics/use-force-graph.ts`
- `src/features/motion/motion-tokens.ts`
- `src/features/motion/story-model.ts`
- `src/features/motion/story-scene-controller.ts`
- `src/features/motion/story-diagram.tsx`
- `src/features/transitions/branch-growth-plan.ts`
- `src/features/transitions/portfolio-transition-provider.tsx`
- `src/tests/graph-domain.test.ts`

No content adapters, schema, public JSON, routes, package declarations, lockfile or dependency-build policy were changed. No dependencies were installed. No files were removed. There is no Git metadata in this directory, so this is an implementation manifest, not a Git-generated diff.

## Practical checks

All ten refined openings were visually reviewed at desktop and mobile. The 390 × 844 route sweep reported no horizontal overflow. Mobile Learning inspection confirmed the graph ends 40 px before the normal-flow inspector. Native Connections disclosure keyboard activation and compact Flood diagram readability were checked.

A desktop label-box sweep found three overlaps in Research, Flood and Learning; conservative D3 label clearance resolved them. Inspector and story-column separation were then refined, including short-screen and expanded-disclosure space. Desktop Research and Flood entries returned to idle, with overlay opacity zero, no cinematic marker, and one route ScrollTrigger. Road Networks selection updated the inspector and emphasized its real relationship.

Contrast calculations against the brightest base surface `#121b1d`: primary 14.43:1, secondary 9.22:1, muted 6.17:1, graph labels 10.64:1, status 9.80:1, focus 12.96:1. These are palette checks, not a full rendered-pixel accessibility certification. Focus rings and native disclosure focus were visually checked.

Ambient work is capped at 900 Canvas points and 24 fps desktop, with existing hidden/offscreen pause and pixel-ratio caps. No ambient DOM-star array, per-frame React state, Three.js, or new effects library was added. The 60-node deterministic D3 fixture passed (one local sample: 18.2 ms cold / 13.4 ms warm); this is not broad performance profiling.

The focused suite adds branch dependency/cross-link ordering, exact label wrapping, and static/capped ambience policy tests. Before the final production gate, lint, TypeScript and all 29 tests passed.

## Recovery, warnings and boundaries

Usage-limit interruptions stopped the local server and invalidated command sessions; code edits survived. The server/checks were resumed without reinstalling dependencies, deleting lockfiles, rewriting content, or bypassing build policy. First development compilation caused browser navigation timeouts; the route subsequently returned HTTP 200 and a live tab was recovered. Next reported slow local filesystem startup. Final production results are recorded below.

Actual OS reduced-motion emulation is not exposed by the preview controller. Live preference switching, full screen-reader behavior, broad browser/device coverage and detailed performance profiling remain Phase 10 work. System font availability may change exact line breaks across platforms; no external font asset was introduced.

No private knowledge source was accessed. No assets, new claims, semantic nodes, semantic edges, analytics, deployment, or hosting work were added. Phase 10 has not been started.

## Final production gate

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 29 passed, zero failed or skipped. Final 60-node sample: 17.2 ms cold / 12.6 ms warm.
- `pnpm build`: passed; all ten approved routes statically prerendered.
- `node scripts/verify-public-routes.mjs`: passed on the existing port-3000 development preview. The same assertions were rerun against port 3001 with an in-memory fetch URL substitution (no script/source changes): all ten routes HTTP 200, exactly one H1, expected approved prose, no image/video assets; `/engineering` HTTP 404.
- Production startup: `pnpm start --port 3001` passed. Port 3000 was occupied by this project's existing `next dev` process; it was identified and left running. The initial default-port production start failed with `EADDRINUSE`; a direct `pnpm exec next` attempt did not resolve its executable, so the normal package start script was used successfully. No installation or dependency repair was needed.
- Production browser checks: Research entry, browser Back and Forward, interruption of an active Flood entry by Learning navigation, and parent return all settled on the correct route. Each inspected endpoint had `aria-busy="false"`, zero overlay opacity, and one story ScrollTrigger; the interrupted endpoint had no cinematic entry marker. Runtime error log was empty. Desktop Engineering dragging moved the visible node without changing route or leaving busy state.
- Final 1280 × 720 homepage inspection: no horizontal overflow; inspector begins below the graph region (approximately y=761), preserving separation from Projects and other labels.
- Public-output scan: 223 source/generated files inspected, 12 matches reviewed. All were framework Fetch/React `credentials` or Next `freshnessPolicy` identifiers; no private-content leak was found within the scan's scope.
- All eight immutable public-export SHA-256 hashes matched again. `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` hashes remain unchanged; no new dependency or build-policy exception was introduced.

No Phase 9 blocker remains. Phase 10 should begin with the browser/device and assistive-technology matrix, live reduced-motion preference switching, and measured performance profiling—not additional visual features or deployment.
