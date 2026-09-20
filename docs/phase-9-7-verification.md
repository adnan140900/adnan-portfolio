# Phase 9.7 — Kinetic Knowledge System

Verified 2026-09-13 against the local production build at `http://localhost:3001`. Phase 9.6 semantic idle parameters and Phase 1–9.6 data, routing, D3, Canvas and transition owners were preserved. Nothing was deployed; Phase 10 was not started.

## Implementation record

1. **Files changed.** Added `src/features/kinetic/kinetic-model.ts`, `kinetic-text.tsx`, `knowledge-field.tsx`, `editorial-controller.ts`, `flood-metaphor.tsx`, and `kinetic.css`. Updated `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/globals.css`, `src/components/public-world-page.tsx`, `src/features/motion/scroll-scene.tsx`, `src/tests/graph-domain.test.ts`, and `README.md`. Added this report. No package, lockfile, workspace policy, graph source, idle controller, force adapter or transition-provider edits.

2. **Typewriter architecture.** A reusable character/word primitive uses a deterministic weighted schedule. Punctuation receives longer pauses inside the same duration budget. GSAP mutates decorative token visibility and the current caret marker; no per-character React renders. Full text is server-rendered. Cancellation completes the visual string and removes the caret. Replay can be `once` or `always`, with an explicit key.

3. **Homepage synthesis.** The exact approved headline resolves over 2.25 seconds. Live first-entrance inspection captured the first character and caret, then the completed headline. Word wrappers preserve the final layout while revealing characters. The caret disappears. Back navigation was observed with zero hidden characters and `data-typing=false`; deep links have no homepage delay.

4. **Knowledge-field architecture.** One persistent layout-level field has 11 text spans: up to eight ambient slots and three anticipation slots. No character-node explosion in the field. At most one ambient slot uses oversized typography. Ambient counts decrease with vocabulary size; Nothipotro was observed with only two populated ambient slots, not repeated copies of its three labels. Terms fade, partially type, drift, dissolve and recycle on staggered lifetimes.

5. **Vocabulary sourcing.** The field receives `portfolioGraph`, the existing client-safe adapter result. Home samples the public graph. Research combines its approved view and the explicit Engineering view. Projects, AI, Leadership and Learning use their existing route views; subjects use their own views. About samples major themes and limits ambient display to three. No raw export, approval record, private source, hash, hidden neighbor count or source-note read was introduced.

6. **Relationship fragments.** Every displayed arrow expression is assembled from an actual edge and its two endpoint labels, preserving direction and the exact relation name. Unit tests check each fragment against that edge. Research and AI relationship strings were observed live. The existing test excluding the omitted Hermes/Local AI edge still passes. Decorative label previews can follow a bounded outgoing walk; they do not turn transitive reachability into a new displayed edge.

7. **Depth.** Existing readable editorial foreground and semantic midground remain, with a fixed low-opacity typographic field and diffuse light across the reading experience. Canvas stars are unchanged. No glass panels, image assets or new semantic filler nodes. In live observation, the field adds activity independently of star movement without replacing or obscuring readable copy.

8. **Ghost typography.** Large field terms are exact public labels; section/header ghosts are approved headings or labels (including neutral existing UI headings). They clip within the composition and stay `aria-hidden`. Section ghosts reveal through a clip and a small translation. Two competing large ambient terms found during QA were reduced to one.

9. **Section assembly.** IntersectionObserver starts a scoped sequence: eyebrow, heading wrapper, ghost reveal, status/prose and existing diagram. Prose uses opacity and 3–9px translation, never character typing. Heading entrance wrappers remain separate from the existing GSAP scroll-scrub heading owner. Ordinary content is present before JavaScript and is never made unavailable pending animation.

10. **Flood transformation.** All eight stages were traversed in order on desktop, with matching active headings and metaphor states. One four-path abstract SVG stays in the composition: Question uses a faint foundation; Motivation reveals branches; Method draws the foundation; Assumptions shows dashed conditional marks; Exploration traces a conceptual path; Limitations weakens marks; Validation retains deliberate gaps; Uncertainty separates two bounded alternatives. The figure explicitly says “Conceptual sequence · visual metaphor, not geographic data.” It is independent of the seven-node subject graph and has no semantic node IDs or invented findings. The caption was moved clear of the inspector during QA. Opening the Connections inspector hides this decorative figure so the disclosure takes priority.

11. **Anticipation.** Keyboard focus on Research was observed to hold its idle position and display Flood Accessibility, Road Networks, and Road Disruption and Restoration, all reachable through approved outgoing edges. Pointer and focus share the preview controller; keyboard focus has priority. Existing hover/focus stabilization is unchanged. Preview labels are smaller and quieter than the large ambient term.

12. **Reactive semantic geometry.** Explicit graph-control and story-item IDs drive real incident-edge emphasis and slight unrelated-star dimming. No prose analysis, added forces or invented connections. Original story projection still owns position and keeps endpoints attached; the regression tests pass. Geometry response is presentation-only in this phase.

13. **Subject entry.** Header and first-section assembly runs independently of, and can overlap, existing route formation. Editorial assembly completes in roughly 0.85–1.15 seconds on desktop. Nothipotro was observed during `aria-busy=true` with its anchor visible and the first editorial section assembling, followed by completed branches. Native deep links start with usable server-rendered copy; there is no new navigation wait or scroll lock.

14. **Personalities.** Behavioral tokens vary lifetime and drift rather than palette: Research structural (22s base / 16px), Projects branching (20s / 26px), AI distributed (18s / 30px), Leadership conversational (30s / 12px), Learning evolving (16s / 24px), About quiet (36s / 10px). Slots add staggered lifetime offsets. Existing graph formation supplies actual branching; no alternate theme system was created.

15. **AI.** Live inspection showed faint generated labels and exact public relationship strings. No fake code, binary rain, terminal colors, circuit assets or robot imagery.

16. **Learning.** Observed route-specific evolving vocabulary, ghost headings and staged section prose. The field continues independently while reading; this is not a skills matrix.

17. **Projects/Nothipotro.** Projects uses its actual approved branches and relation vocabulary. Nothipotro retains its developing status, Audience-first Design and Student Learning Needs. Knowledge Workflow Experiments retains its separate public connections. No claim of a mature or validated product was added.

18. **Microdetails.** A transient headline caret, progressive relationship text, staggered status/eyebrow reveal, and 4px link-arrow extension provide small accents. There are no permanent blinking cursors across the page.

19. **Light.** One static radial light texture moves by transform over a 48-second alternate cycle at very low contrast. No animated color stops, rainbow, strong purple gradient or new texture asset.

20. **Mobile.** All ten public routes were checked at 390 × 844: no horizontal overflow, one H1 each, field mode `compact`, field clock disabled. Three static fragments, no hover listeners, no headline typing, no continuous light/metaphor animation. Foreground section entrances reduce to small, short opacity/translation changes. The existing static graph/mobile list policy remains. A 1366 × 768 check also retained the short-desktop unpinned stage and no horizontal overflow.

21. **Reduced motion.** Source-reviewed preference lifecycle: headline immediately complete; field static; no editorial GSAP context registered; no continuous light or metaphor animation; existing static semantic policy preserved. Reduced-motion CSS also forces headline-token visibility. Existing reduced-motion policy tests pass. Live OS preference switching was not available through this preview's controls and remains a manual acceptance check, not an observed result.

22. **Accessibility.** Native browser accessibility-tree inspection showed one completed homepage heading string and no floating field/ghost terms. The decorative visual copy is `aria-hidden`, not a live region. Native semantic headings, links, navigation, focus indicators, disclosures and approved prose remain. Keyboard anticipation and activation worked. Full screen-reader/device acceptance remains outside this limited preview audit.

23. **Performance.** Field DOM writes are capped at 12 fps, using one RAF clock, cached elements and transform/opacity/text updates. React changes remain at route/scene boundaries, never animation frames. No new ScrollTriggers, continuous D3 simulation, per-frame layout reads in the field, or new dependency. History/cancellation checks retained one field, 11 pooled spans and one existing route ScrollTrigger. This is a bounded implementation and practical check, not a heap or battery benchmark.

24. **Cleanup.** Field cleanup cancels RAF, removes pointer/focus/visibility/media listeners, resets owned presentation attributes and reverts the route-scoped editorial context/observer. It preserves React-owned slot positions. Headline cleanup kills its timeline and completes tokens. Hidden-document handling pauses field and editorial work; the headline cancels to complete. The preview visibility control did not change `document.hidden`, so that control could not serve as a genuine hidden-tab test; this branch was source-reviewed. Rapid Research-entry cancellation by Projects navigation was observed to settle on Projects with no busy flag, overlay state, duplicate field or console error.

## Verification and disposition

25. **Tests/build.** `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed. **36 tests passed; zero failed/skipped.** Four new tests cover deterministic text/punctuation timing, adapter-only vocabulary/exact directed fragments, bounded approved-descendant previews, and distinct bounded personalities/eight Flood states. The existing graph/physics/motion/content regressions also passed. All ten public routes remain statically generated. No new dependency, install, dependency repair or policy bypass was needed.

26. **Routes/history.** `node scripts/verify-public-routes.mjs http://localhost:3001` passed all ten routes: HTTP 200, one H1, approved prose and identity checks, no image/video assets. `/engineering` remains 404. Live checks covered first homepage entrance/idle, Research focus and formation, all eight Flood stages, Projects, Nothipotro entry, AI, Learning and About. Back restored complete headline text without replay; Forward restored Research without an active transition. Latest-navigation-wins cancellation passed. No browser console errors were returned in the checked sessions. The final production server is left running on port 3001.

27. **Leak scan.** `node scripts/scan-public-output.mjs` scanned 243 application/generated files. Its 12 matches were reviewed framework-only `credentials` / `freshnessPolicy` strings, not private content. No new leak channel was found within the script's scope. No vault was accessed. This is not an exhaustive third-party security certification.

28. **Source integrity.** All eight SHA-256 values matched before work, during each build/start gate, and in final verification. Graph remains **38 nodes / 50 edges**. Approved prose, labels, summaries and topology are unchanged. `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` hashes also remain identical to the pre-phase baseline.

29. **Blockers.** No implementation or automated-check blocker remains.

30. **Warnings/scope.** The directory has no Git repository metadata (`git status` reports “not a git repository”), so no Git diff or commit could be produced; the explicit file manifest above records this phase's edits. True hidden-tab behavior, live OS reduced-motion switching, long-session heap profiling, physical touch hardware and full assistive-technology acceptance remain manual checks. Browser observations used the local in-app browser, not a cross-browser/device matrix. Existing server-owned session restarts loaded each newly verified production build; unrelated servers and dependency state were not changed.

31. **Phase 10 recommendation.** Begin, only on request, with real-device/browser accessibility and motion-preference acceptance, genuine background-tab suspension tests, and long-session performance profiling. Review perceived motion with the user before adding anything else. No deployment or Phase 10 implementation was performed.

### Immutable public export hashes

| File | SHA-256 |
| --- | --- |
| ai.json | `2debe89c32b7eb33ae8e8d65fc5752ae1870c5c41b84bd8967654dd270df5602` |
| graph.json | `36ad5eba997172b8fe174c1be808717a90a2e508a16c5551593d32c0a612b8c3` |
| leadership.json | `0954e882ddce91bd4c42fabde00db9b5c93ce417575974c32d1b8b0fd208fa18` |
| learning.json | `a1f2056dc4bac374016ce681488e779698479a18eea1b129ed6970a2da034051` |
| manifest.json | `9d189624aab8d19aa799067e4c0b9dc4e305af5c8ece229fd12ca226ee88c98c` |
| profile.json | `f12f53de06708280343713a0ed8d98dbe3b82ac913e90ee844a006b1a3aa6b50` |
| projects.json | `6b87b8522c874470bcaa683693f1dc5a760150037d50c67da269497f4a30257d` |
| research.json | `b59c1ea77a6a3e5f5bee4bfb929f6a93e32f39f999baf5fc936a280d014d3d2d` |

PHASE 9.7: PASS — KINETIC KNOWLEDGE SYSTEM COMPLETE
