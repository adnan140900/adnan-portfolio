# Phase 9.5 — living universe motion and identity declutter

## Scope and architecture

The Phase 9 repository state was inspected before editing: README, the installed Next.js client-boundary guide, graph physics and projection, route formation, scroll ownership, atmosphere and identity render sites. Initial source hashes all matched. This directory has no Git metadata; the manifest below records task-owned edits rather than a Git diff.

1. Files: created `src/features/motion/semantic-idle-model.ts`, `src/features/motion/use-semantic-idle.ts` and this report. Changed `README.md`, `scripts/verify-public-routes.mjs`, `src/features/graph/physics/story-projection.ts`, `src/features/graph/physics/use-force-graph.ts`, `src/features/graph/physics/types.ts`, `src/features/graph/physics/force-graph-controller.ts`, `src/features/graph/components/knowledge-graph.tsx`, `src/features/motion/visual-refinement.css`, `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`, and `src/tests/graph-domain.test.ts`.
2. Semantic idle: a separate deterministic model and imperative effect publish visual offsets. The shared projection bridge alone composes story and idle transforms with D3 equilibrium, including edge endpoints. React and the semantic graph are not animation clocks.
3. Root: person/view-anchor amplitude is at most 1.2 horizontal SVG units, with smaller vertical displacement. Selected cluster/subject anchors are stabilized; Adnan never visibly orbits.
4. Primary themes: 12–18 horizontal units, elliptical vertical radii of 45–70% of horizontal radius, independent direction and phase, periods of 45–87 active seconds. These are local drifts around each equilibrium, not a rotating carousel around the root.
5. Children: 6–10 horizontal units and smaller vertical radii. No arbitrary wandering or collision-driven idle simulation.
6. No center: the pure model accepts an absent anchor and uses different x/y periods. Current approved views retain their existing actual anchors; no synthetic center or new view was added.
7. Seed: deterministic FNV-style channels derived only from existing public node IDs; separate amplitude, phase, period, eccentricity and direction channels. No wall-clock/random/private seed.
8. Edges: the same base + story + idle sum drives both endpoints; thin straight geometry and relationship attributes remain unchanged. Projection tests cover independent cleanup and coexistence with D3 updates.
9. Formation: the Phase 9 branch sequence is unchanged. Idle suspends while route transition is active, then an eased settling envelope introduces motion. Diagnostics expose formation/settling/living-idle/paused/static without React updates.
10. Interaction: hover, focus, selected/inspected state and drag freeze the node's current phase and settling envelope. Release restores path speed exponentially over roughly 1.5 seconds, without resetting position. Drag coordinates subtract idle/story offsets and preserve the original grab point. Pointer-capture loss ends dragging.
11. Ambient: existing depth drift, twinkle, pointer response and budgets are retained. About now uses the same decorative seed and Canvas component. No assets or semantic filler were introduced.
12. Continuity: cluster and subject graph surfaces share the same idle mechanism and decorative seed; About has ambient life but no invented semantic graph. Density remains view-dependent.
13. Performance: one 30-fps-capped requestAnimationFrame loop per visible graph; cached controls and position maps; no layout reads in idle frames and no per-frame React state. D3 remains settled except normal dragging. Document hiding pauses D3 without recreating equilibrium on return. Idle active-time increments are bounded at 50 ms, with no hidden-time catch-up.
14. Mobile: small/coarse-pointer layouts are static, without idle RAF or cursor physics. Existing touch controls and normal-flow reading/inspector remain.
15. Reduced motion: continuous semantic movement is disabled, including unresolved preference. Offsets are removed; static geometry and native links remain usable. Hidden/offscreen frames stop and resume from their preserved clock.

## Identity inventory (item 16)

Server-rendered body text counts exclude scripts, metadata and attributes, but include approved prose inside collapsed details. Counts were measured on all ten routes before and after editing.

| Occurrence | Before | After |
| --- | --- | --- |
| Header wordmark, every route | Full name | Approved graph root label: Adnan |
| Header accessible home-link label | Full name + home | Adnan home |
| Footer, every route | Full name | Approved root label: Adnan |
| Homepage identity eyebrow | Full name | Unchanged, sole primary full-name identity |
| Homepage About link | About + full name | About |
| Homepage four current-focus headings | Full name four times | Current focus four times; prose unchanged |
| Root inspector summary | Approved full-name biography, expanded | Same exact summary in collapsed native Profile disclosure |
| Root label/title/Connections | Adnan | Unchanged |
| About heading | Full name, following About eyebrow | About; redundant eyebrow removed |
| About biography | Approved full-name opening | Unchanged |
| Layout document-title default/template | Full name | Unchanged metadata |
| About metadata title | Full name | Unchanged metadata |
| Route transition overlay | Existing graph labels, no full name | Unchanged |
| Next route announcement | Document title may contain full name | Retained for accessible route context, not visible branding |

| Route body | Before | After |
| --- | ---: | ---: |
| `/` | 9 | 2 (one primary identity + collapsed approved summary) |
| `/about` | 4 | 1 (biography) |
| `/research` | 2 | 0 |
| `/research/flood-accessibility` | 2 | 0 |
| `/projects` | 2 | 0 |
| `/projects/nothipotro` | 2 | 0 |
| `/projects/knowledge-workflows` | 2 | 0 |
| `/ai` | 2 | 0 |
| `/leadership` | 2 | 0 |
| `/learning` | 2 | 0 |

17. Homepage: one prominent full-name occurrence; approved supporting prose retained. No nearby duplicate identity heading.
18. Graph root: Adnan remains the exact approved label. Profile disclosure preserves the original summary rather than rewriting it.
19. About: one About title, unchanged introduction and biography; no stacked full-name heading.
20. Chrome: header/footer use the existing public root label. No logo, alternate identity or commercial branding was invented.

## Verification and boundaries

Final practical checks and command results are recorded below. Source content, topology, adapters, schemas, package declarations and build policy are outside this change. Phase 10 and deployment are not started.

21. Commands: final `pnpm lint` passed without warnings; `pnpm typecheck` passed; all 31 tests passed with zero failures/skips; `pnpm build` passed and statically prerendered all ten public routes. Two added tests cover deterministic bounded paths, distinct phases, root/child limits, no-center behavior, interaction pause/release and runtime policy. The projection regression now checks additive idle/story offsets and independent reset. The 60-node D3 fixture still passes (17.3 ms cold / 13.2 ms warm in the final run).
22. Routes: `node scripts/verify-public-routes.mjs http://localhost:3001` passed all ten HTTP-200 routes, expected exact approved prose, one H1, asset-free output, and identity occurrence counts. Engineering still returns 404. The script now accepts an optional preview origin, avoiding edits when development occupies port 3000. The task-owned production process was restarted normally on 3001 after rebuilding; the development process was preserved.
23. Leak scan: 226 application/generated-output files scanned; all 12 matches were existing framework Fetch/React `credentials` and Next `freshnessPolicy` identifiers. No private-content match was found within this scoped scan. No vault or external content directory was accessed.
24. Integrity: all eight initial and final SHA-256 checks matched. Graph remains 38 nodes / 50 edges. Package, lockfile and workspace-policy hashes match Phase 9. No assets, dependencies, content edits or policy bypasses.

| Source | Unchanged SHA-256 |
| --- | --- |
| ai.json | `2debe89c32b7eb33ae8e8d65fc5752ae1870c5c41b84bd8967654dd270df5602` |
| graph.json | `36ad5eba997172b8fe174c1be808717a90a2e508a16c5551593d32c0a612b8c3` |
| leadership.json | `0954e882ddce91bd4c42fabde00db9b5c93ce417575974c32d1b8b0fd208fa18` |
| learning.json | `a1f2056dc4bac374016ce681488e779698479a18eea1b129ed6970a2da034051` |
| manifest.json | `9d189624aab8d19aa799067e4c0b9dc4e305af5c8ece229fd12ca226ee88c98c` |
| profile.json | `f12f53de06708280343713a0ed8d98dbe3b82ac913e90ee844a006b1a3aa6b50` |
| projects.json | `6b87b8522c874470bcaa683693f1dc5a760150037d50c67da269497f4a30257d` |
| research.json | `b59c1ea77a6a3e5f5bee4bfb929f6a93e32f39f999baf5fc936a280d014d3d2d` |

25. Warnings: the managed in-app preview throttled animation frames despite reporting a visible document. Motion therefore advanced more slowly than wall time under the deliberately capped active clock, and locator stability/short URL waits occasionally timed out; fresh DOM observations and keyboard activation were used rather than disabling safeguards. Smooth 30-fps perception, live OS reduced-motion switching and a broad device/assistive-technology matrix are not certified here. No full-name wording was removed from source or approved prose; metadata and accessible route announcements intentionally retain document identity.
26. Blockers: none remaining for Phase 9.5; the broader frame-rate/device and assistive-technology acceptance remains a separate Phase 10 gate.
27. Phase 10 entry: first verify continuous motion on real browser/device frame clocks, then live reduced-motion/visibility changes, keyboard/screen-reader behavior and performance profiling. Do not add features or deploy automatically.

## Practical browser observations

- Homepage was observed across multiple intervals exceeding 60 wall-clock seconds, through settling into living idle. D3 equilibrium transforms were unchanged between samples while visual offsets and straight edge angles changed. Root displacement remained very small. Scene commits did not increase per animation frame.
- The final production homepage sample reached 89.96 active idle seconds with one scene commit, zero label overlaps, zero detached edges, zero horizontal clipping and no overflow. This later observation ran with a normally advancing preview clock; earlier throttled-session limitations are retained above for transparency.
- Expanded Research was observed for more than 30 wall-clock seconds after formation and reached living idle. Selecting Road Networks held its offset exactly at `(-0.9450358157470042, 1.6002567645655434)` across samples while Flood and other neighbors continued moving. A desktop drag completed with no detached edges, clipping, collision or runtime error.
- At desktop 1440 × 1000, Projects and Nothipotro reached living idle. Learning and Flood showed progressing offsets and clear labels. About showed the shared decorative field, one About heading, and its unchanged biography. The sampled label-box checks found zero overlaps or horizontal clipping; the rendered path checks found zero detached endpoints.
- Homepage graph activation into every routed primary theme was verified on desktop: Research, Projects, AI & Technology, Leadership and Learning. The guarded formation completed, returned to non-busy state, and handed off to settling. Existing successful subject formation into Nothipotro was also checked.
- Back to Projects and Forward to Nothipotro returned to the correct routes with `aria-busy="false"`, overlay opacity zero and one route story trigger.
- An active Research formation (`aria-busy="true"`, idle phase `formation`) was interrupted using About navigation. About became usable with overlay opacity zero, no graph or story-trigger DOM residue, and its ambient Canvas running. The browser runtime-error log was empty.
- At mobile 390 × 844, homepage and all five routed theme entries were checked: idle phase stayed `static`, graph busy state cleared, and no horizontal overflow was reported. Canvas was static. Engineering selection remained on `/` and updated its inspector. Native Profile disclosure keyboard activation revealed the exact approved summary with no overflow.
- Reduced/unresolved, coarse-pointer, hidden, offscreen and formation gating are covered by the focused policy tests. Actual OS preference switching and cross-browser visibility events were not simulated through private browser state.
- After the usage-limit interruption, the existing code and both local servers were intact. Source hashes and all production route assertions were rerun successfully; no reinstall, rebuild-from-scratch, rollback, content change or policy exception was required.

Phase 9.5 is complete. No Phase 10 work or deployment was performed.
