# Phase 6 — Subject Worlds & Storytelling Framework

Scope: Universe → Research → Flood Accessibility, with public-safe structural placeholders only. No private vault, research source, export pipeline, or Phase 7 implementation was accessed or added.

## Files

Created:

- `src/app/research/flood-accessibility/page.tsx`
- `src/features/transitions/subject-context-nav.tsx`
- `src/features/graph/physics/story-projection.ts`
- `src/features/motion/story-model.ts`
- `src/features/motion/story-scene-controller.ts`
- `src/features/motion/story-diagram.tsx`
- `docs/phase-6-verification.md`

Changed:

- `README.md`
- `src/app/globals.css`
- `src/components/layout/site-footer.tsx`
- `src/data/graph/portfolio-graph.json`
- `src/features/graph/types.ts`
- `src/lib/graph/parse-graph-document.ts`
- `src/features/graph/components/knowledge-graph.tsx`
- `src/features/graph/physics/graph-geometry.ts`
- `src/features/graph/physics/svg-graph-adapter.ts`
- `src/features/graph/physics/force-graph-controller.ts`
- `src/features/motion/story-scenes.ts`
- `src/features/motion/scroll-scene.tsx`
- `src/features/motion/motion.css`
- `src/features/transitions/types.ts`
- `src/features/transitions/transition-state.ts`
- `src/features/transitions/transition-policy.ts`
- `src/features/transitions/portfolio-transition-provider.tsx`
- `src/tests/graph-domain.test.ts`

The directory has no Git metadata; `git status` reports “not a git repository.” This is an implementation manifest, not a Git-generated diff. Existing work was extended in place. No dependency repair, installation, project recreation, or lockfile deletion was needed. `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` remain unchanged. No tsx/esbuild/testing package was added; the lockfile's optional Next Playwright peer metadata is not a newly installed test runner.

## Architecture

The existing route-transition state machine now accepts subject entry/exit intents. Forward entry uses the same graph-derived branch-growth plan, with Flood as the anchor and D3's stable destination coordinates. Reverse subject navigation reforms Research; Universe navigation stays a normal link. Semantic routing is independent of animation success.

Source/overlay visibility is exchanged synchronously. At the destination, one timeline timestamp hides the overlay and reveals the actual anchor. A newer normal link cancels an earlier delayed navigation before Next processes the click. Direct-entry timelines also clean up on route changes.

The subject projection has nine nodes (anchor plus eight concepts) and ten conceptual edges. The five editorial scenes are question, network, hypothetical disruption, alternate conceptual path, and validation/uncertainty/next steps. No copy asserts a measured result or real usable route.

`StoryMoment` carries active/supporting node IDs, emphasized/weakened edge IDs, bounded visual offsets/camera, placement, and copy. `ScrollScene` provides semantic sections and enter/leave callbacks; one controller owns GSAP/ScrollTrigger. The projection bridge combines D3 base coordinates with visual scene offsets and rebuilds connected edge endpoints without writing into D3 nodes.

Desktop composition alternates editorial negative space and active-star numbering. Compact diagrams derive only from the same graph relationships. Mobile is an ordinary vertical story, no pinned camera or D3 controller, with three or four concepts per scene illustration. Reduced motion returns before GSAP registration: static geometry and simple scene-boundary opacity/focus updates, no camera offsets, drift, or parallax.

## Verification

Verified in the local in-app browser:

- Direct subject URL and refresh render the correct nine-node subject and all five scenes.
- Research → Flood branch growth and Flood → Research return complete with idle state.
- During entry, the destination anchor remains hidden while the shared overlay is visible; after handoff the overlay is hidden and the anchor is visible.
- All five scroll scene identities activate; the disruption weakens the direct service edge, the next scene emphasizes the alternative chain, and the final scene brings validation/uncertainty forward.
- Browser Back returns to Research; Forward restores Flood Accessibility.
- Native link activation with Enter works in both subject directions; controls retain accessible names and native keyboard semantics.
- Universe navigation works. Interrupting subject entry with a newer Universe click ends on `/`, `aria-busy=false`, overlay opacity zero, no transition document marker, and one active route scroll controller.
- Mobile at 390 × 844 has no horizontal overflow, a static (unpinned) stage, all five compact diagrams, and persistent parent/Universe navigation. Temporary viewport override was reset.
- Browser error log contained no application errors during these checks.

Reduced-motion policies and the early-return code path were inspected; focused tests cover reduced capability selection, static physics policy, scene presentation, and hidden/offscreen motion policies. This browser controller does not expose OS reduced-motion emulation or reliable hidden-tab simulation. Actual OS preference changes, hidden-tab resumption, and screen-reader announcement quality remain manual acceptance checks; they are not claimed as browser-tested here.

## Performance observations

Local development-browser samples, not cross-device guarantees:

| Work | Observed |
| --- | --- |
| Subject D3 warmup | 9 nodes, approximately 1.2 ms, bounded 90 ticks |
| Future-scale D3 fixture | 60 nodes: 16.4 ms cold, 12.6 ms warm in the final test sample |
| Desktop atmosphere | 543 decorative stars, 30 FPS budget, approximately 1 ms mean Canvas draw |
| Mobile atmosphere | 80 stars, 12 FPS budget; `running=false` when the stage is offscreen |
| Story projection | Approximately 0.062 ms cumulative mean per measured timeline update |
| React scene updates | 7 scene commits versus 267 visual timeline updates in one five-scene pass (includes initialization) |
| ScrollTrigger lifecycle | One active route controller after entry, return, and interruption |

Counters are bounded cumulative diagnostics, not unbounded trace buffers. Geometry projection caches element references and performs no layout reads in its frame loop. React state is set only on scene boundaries; GSAP writes transforms/styles and the projection bridge writes SVG coordinates directly. No full browser layout trace or React DevTools profiling session was captured, so these measurements do not prove absence of every possible layout/render cost. Real-device profiling and representative dense visual fixtures remain necessary.

## Automated checks

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 18 passed, zero failures, using TypeScript compilation and Node's built-in runner.
- `pnpm build`: passed; `/`, `/research`, and `/research/flood-accessibility` are statically prerendered.
- `pnpm start`: ready on port 3000; all three routes returned HTTP 200.
- Production browser: direct subject entry, Flood → Research, and Research → Flood passed; final state had `aria-busy=false`, overlay opacity zero, one scroll controller, and no browser error logs.

The development server was stopped before building, then replaced with the production server. The prior browser tab retained an error page from that restart, so production verification used a fresh preview tab. The production server was left running; for later development, stop it before running `pnpm dev` on the same port.

Tests include graph parsing/reference validation, universe/cluster/subject state, route-aligned subject initialization, reduced/mobile policies, guarded enter/exit/cancel lifecycle, real-edge branch traversal, deterministic 60-node settling, five valid subject scenes, weakened/alternate path semantics, invalid story references/offsets, and D3/scene projection attachment/reset without physics mutation.

## Known limits and recommended Phase 7

- This proves a storytelling framework, not a real research narrative or a road/flood model.
- Only one subject route exists. Broader content, additional sections, and a sanitized export pipeline are intentionally absent.
- Local counters are useful smoke profiling, not a mobile hardware performance certification.
- Add browser regression tests for native history, preference changes, transition interruption, screen readers, and real-device layout before expanding the route family.
- Agree on a reviewed public-content contract and visually validate a representative 30–60-node fixture before any separately authorized export integration.

Do not begin Phase 7 automatically.
