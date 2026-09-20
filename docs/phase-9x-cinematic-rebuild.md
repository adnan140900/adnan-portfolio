# Phase 9X — Cinematic narrative rebuild

Completed and verified locally on 2026-09-14. This is a presentation rebuild, not a content release. No deployment or Phase 10 work was performed.

## 1. Original presentation problems

The previous system repeated large ghost headings, foreground headings, status chrome, prose, and empty vertical space. Current Focus repeated the same identity four times; Flood was eight similarly structured article sections. Decorative motion did not materially recompose the viewport.

## 2. Storyboard

[The storyboard](phase-9x-storyboard.md) was written before structural implementation. It defines initial frames, scene states, typography, geometry, transitions, and exits for home/focus, Flood, Projects, and mobile focus. The implemented grammar uses open, atlas, distributed, convergent, wide, and split compositions.

## 3. Current Focus: old versus new

Old: four independent editorial sections with repeated Current Focus chrome.

New: one entrance followed by Flood Accessibility → Geospatial Analysis → AI & Technology → Public Speaking. Titles are exact public graph labels. The four approved statements appear unchanged, once each per page. Desktop retains one visual stage; mobile uses intentionally different normal-flow scene compositions. About shares the current-directions film after its identity sequence.

## 4. Repeated-heading removal

Current Focus is no longer a giant repeated background word, repeated slide title, or repeated current-work badge. Default constellation heading duplication is visually suppressed while its semantic accessible label remains. The inspector is a collapsed native disclosure. World introductions have one prominent title, not an eyebrow/title/ghost-title trio. The ambient vocabulary excludes the current H1; film-associated vocabulary excludes the active title, topic itself, and person node.

## 5. Semantic progress

Each film exposes native anchors named after its scenes and exactly one `aria-current="step"` once active. Desktop activates the appropriate scene without scrolling through every intermediate paragraph. Mobile anchors seek normal-flow panels. Modifier clicks retain native behavior. Offscreen progress labels remain horizontally reachable by keyboard/touch; automatic centering does not move the list while hovered or focused. Compact mobile counts supplement topic names rather than replace them.

## 6. Persistent-stage architecture

`NarrativeFilm` server-renders semantic content once. Once preference is resolved, `registerFilm` progressively enhances large, fine-pointer viewports. CSS sticky owns the stage; one scoped ScrollTrigger owns its timeline. There are no pin spacers, body locks, duplicated prose slides, or React updates per frame. A single desktop SVG survives every conceptual state. The independent canonical constellation retains navigation, inspection, D3, formation, and accessible relationship semantics.

## 7. Scroll transformations

The same node-position proxies interpolate between authored layouts, with existing edge endpoints updated from the same coordinates. An open constellation becomes a left analytical grid, then a distributed field and convergent arrangement. Overlapping text handoffs avoid a blank stage. Scrolling backward scrubs the same timeline rather than trying to undo one-shot animations. Native scene seeking and initial hash entry select a readable portion of the requested scene.

## 8. Camera system

The decorative SVG camera has its own transform owner. Composition scales range from 0.87 to 1.15 with lateral/vertical recentering; exit pulls back to 0.8. This is separate from canonical graph camera, pointer, D3, idle, and route-travel transforms. Film points never mutate D3 equilibrium or public topology.

## 9. Large-scale typography

Scene headings enter from 220–260px away and leave by 170–180px, with masks and vertical displacement. Associated oversized terms reveal across the scene and move 120–240px. Body movement is limited to 38px with a short readable reveal, and text sits over a soft dark reading mask. Mobile titles move at a smaller 55px scale while preserving normal document flow.

## 10. Background semantic typography

Words are exact approved labels, selected through actual incident relationships with outgoing neighbors preferred. Person identity is not reused as giant scene wallpaper. Flood uses its existing section headings as contextual terms. These associations are presentation choices, not new section-to-node mappings. The retained headline synthesis still works; the autonomous knowledge field pauses and is suppressed while a film is visible, yielding to scroll-controlled vocabulary.

## 11. Mobile Current Focus rebuild

At 390 × 844, focus panels start at 85svh and can expand for prose. Flood uses left-aligned title/right geometry; Geospatial Analysis uses right-aligned title/left analytical geometry; AI uses centered type/distributed geometry; Public Speaking reorders the geometry into a convergent composition. Paragraphs remain visible independently of the scrub. There is no desktop pinning or cinematic camera on mobile. The original duplicated heading/status stack is not mounted.

## 12. Flood rebuild

All eight approved sections remain: Question, Motivation, Method, Data and assumptions, Exploratory work, Limitations, Validation, Uncertainty. One seven-node/eight-edge public projection transforms through their compositions. Edge dashing and opacity change as visual emphasis only. The caption explicitly calls this a visual metaphor, not geographic data. No alternate roads, closure evidence, validated findings, or section-level mappings were invented. The final inspected SVG had zero detached endpoints.

## 13. Representative cluster and route changes

Projects uses open/emergent geometry followed by a distributed workflow frame. Research uses an analytical composition. AI cycles distributed, split, wide, and analytical states; its Local AI frame was captured and compared. Leadership favors convergent, open, and split layouts. Learning assembles analytical/distributed/open/wide states. Nothipotro moves from open to convergent; the single approved Knowledge Workflows scene uses an analytical frame without inventing more prose. About has an identity film followed by current directions and approved contacts.

## 14. Implementation manifest and obsolete presentation removed

Created:

- `src/features/narrative/film-model.ts`
- `src/features/narrative/film-geometry.tsx`
- `src/features/narrative/film-controller.ts`
- `src/features/narrative/narrative-film.tsx`
- `src/features/narrative/narrative.css`
- `docs/phase-9x-storyboard.md`
- `docs/phase-9x-cinematic-rebuild.md`

Updated:

- `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/globals.css`
- `src/components/public-world-page.tsx`
- `src/features/graph/components/knowledge-graph.tsx`
- `src/features/kinetic/knowledge-field.tsx`, `src/features/kinetic/kinetic.css`
- `src/tests/graph-domain.test.ts`
- `scripts/verify-public-routes.mjs`
- `README.md`

Removed the replaced presentation renderers/controllers:

- `src/features/motion/scroll-scene.tsx`
- `src/features/motion/story-scene-controller.ts`
- `src/features/motion/story-diagram.tsx`
- `src/features/kinetic/editorial-controller.ts`
- `src/features/kinetic/flood-metaphor.tsx`

Public story contracts/adapters and legacy pure models remain for compatibility and tests. Old article components are not mounted; route verification explicitly rejects the old `story-moment` markup. Some historical CSS/model definitions remain inert. There is no `.git` metadata in this workspace, so deleted source files cannot be restored through this checkout's Git history; no repository was initialized or reset.

## 15. Accessibility and navigation

One H1 per route; one semantic paragraph copy; labelled sections and native progress links; decorative SVG/terms marked `aria-hidden`; visible focus indicators; no scroll trap. Inactive desktop panel links leave sequential Tab order, while progress links provide direct access to each scene. Focusing content in another panel seeks it. Without enhancement, all content is normal-flow SSR. Canonical relationship inspection stays available in the native constellation disclosure.

Runtime checks confirmed keyboard Research-star entry, Back to home/Forward to Research, direct focus hash entry at scene 2, mobile pointer and Enter seeking, and subject-entry interruption by primary navigation to AI. The interrupted destination settled at `/ai` with no busy graph, no active transition, and no body overflow lock. All ten direct routes and the unapproved `/engineering` 404 were also checked over HTTP.

## 16. Reduced motion

Reduced motion uses the new scene layout, static topic typography, and static SVG compositions without a film timeline or sticky enhancement. A focused test executes the actual reduced controller branch, verifies that panels are not hidden/enhanced, and verifies both observer cleanups. Existing graph/route reduced-motion policy tests also pass. Live OS preference switching was not available through the preview controls; full screen-reader and real-device acceptance remains manual, not claimed as completed.

## 17. Performance and lifecycle

Existing GSAP/SVG/CSS/Canvas only. One desktop ScrollTrigger per film; mobile one per panel. Cached targets and batched point/edge writes avoid per-frame layout reads and React renders. Scoped media/context cleanup removes owned triggers, styles, listeners, observers, and pending hash RAF. Visibility handlers pause scrub work; the ambient field pauses offscreen/during films. Existing capped Canvas and semantic-idle budgets remain. The 60-node D3 regression settled in approximately 17.1ms cold/11.9ms warm in the final test run; this is a local diagnostic, not a device performance guarantee.

## 18. Screenshot comparison

Captured and visually inspected inline in the task (not stored as new website assets): desktop hero; focus scenes 1, 2, 3 and the convergent fourth frame; Flood early/middle/late; AI Local AI; mobile hero; mobile focus 1, 2, 3; mobile Flood Method.

The focus frames differ in title alignment, reading region, graph distribution, and camera—not merely paragraph text. Flood changes from an open right-hand constellation to a split dashed network and a wide final layout with a bottom title/top-right prose. Mobile changes title alignment and geometry placement while retaining readable copy. Testing caught and corrected competing ambient text, a visible progress scrollbar, mobile anchor seeking, and sticky subject breadcrumbs obscuring film navigation.

## 19. Timed perceptual observation

Observed 34.49 seconds of homepage + Current Focus with ordinary incremental scrolling and intermediate screenshots. The first sampled node changed from x≈754 to x≈475 over a 379px scroll, then to x≈195 over the next increment; later camera scale moved from 1.0 through 0.92 to 1.15. The visual world changed materially through the sequence without a blank geometry reset.

Observed 33.37 seconds of Flood with ordinary incremental scrolling from early through final sections, capturing early/middle/late frames. The same network visibly rearranged and changed emphasis throughout. Follow-up keyboard reverse seeking returned from scene 7 to scene 1 with one active progress item and attached endpoints. These were live observations, not an exported video recording or independent human usability study. The final breadcrumb/vocabulary corrections did not change the timed motion geometry.

## 20. Automated and runtime verification

Final commands completed successfully:

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass, no lint errors |
| `pnpm typecheck` | Pass |
| `pnpm test` | 41 passed; 0 failed/skipped |
| `pnpm build` | Pass, all ten public routes statically generated |
| `node scripts/verify-public-routes.mjs http://localhost:3001` | Ten HTTP 200s, approved prose, one H1, no old article markup/assets; Engineering 404 |
| `node scripts/scan-public-output.mjs` | 241 files inspected; 12 matches reviewed as framework Fetch/React `credentials` and Next `freshnessPolicy`, no detected private content |
| `pnpm verify:content` | All eight immutable SHA-256 hashes match |
| 390 × 844 browser sweep | All ten routes: no horizontal document overflow, one H1, no desktop film enhancement |
| Final browser error log | No captured errors |

New tests cover focus identities/exact prose, eight Flood sections without mappings, real-edge projection/bounded deterministic geometry, reversible progress, and the reduced-motion lifecycle. Existing physics, formation, route, public-schema, and privacy-boundary regressions remain.

## 21. Source and dependency hashes

38 nodes and 50 relationships remain unchanged. Final public-file hashes:

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

`package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` match the pre-work hashes:

```text
package.json        44C2F8C2B6B6BEDFF2EB0E53459BB0D9BA6B3738691710D4D4C849BC4AABC26D
pnpm-lock.yaml      FAA0F74926D5FC9928F154B8AB86A5EC705DE410248851B34412A2831D6166A3
pnpm-workspace.yaml 57864D9FDAF79EDBA655B7B38C0D0F6716903CF6049144304E83422483376DB2
```

No installation, dependency repair, lockfile deletion, or dependency-build-policy bypass was needed. No testing framework was added; tests still compile TypeScript and use Node's built-in runner.

## 22. Warnings and recovery

The usage interruption did not require restarting the implementation. The in-flight production build completed successfully; its exit result was collected on continuation. The production server was restarted on port 3001 after final builds. A browser wait timed out during Research entry; reinspection showed successful navigation, and subsequent Back/Forward checks completed. No user files were reset and no unrelated dependencies were reinstalled.

There is no Git/worktree diff available because this directory has no Git metadata. Verification therefore uses explicit file inspection, tests, runtime checks, and immutable/dependency hashes rather than claiming a clean Git diff. Browser screenshots and timed observations cover representative desktop/mobile layouts, not all browsers, zoom levels, hardware, or assistive technologies. True hidden-tab lifecycle and live OS reduced-motion switching were not independently exercised in this preview; lifecycle code and policy tests were checked. The privacy scan is scoped and heuristic, not a security certification.

## 23. Blockers and handoff

No remaining implementation blocker was found for this phase. Real-device, live reduced-motion, assistive-technology, and broader performance acceptance remain explicit manual scope. The local production preview runs at `http://localhost:3001/`; keep its terminal alive. To run again: `pnpm build`, then `pnpm start --port 3001` (or `pnpm dev --port 3001` for development, after stopping the production server).

No Obsidian vault was accessed. No assets, claims, relationships, public JSON changes, deployment, or Phase 10 work were added.

PHASE 9X: PASS — CINEMATIC NARRATIVE REBUILD COMPLETE
