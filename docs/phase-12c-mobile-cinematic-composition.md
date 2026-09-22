# Phase 12C — Mobile Cinematic Composition

Branch: `improvement-v2`

Scope: visual composition and mobile navigation only. Phase 12A/12B experience profiling, Decode V2 timing, unified graph, portrait projection, touch behavior, reduced motion, route formation, public content, and graph topology remain authoritative.

## 1. First viewport redesign

The mobile opening is composed as one viewport-height scene. The identity, compact editorial headline, atmospheric field, and semantic universe now share the first screen instead of appearing as successive stacked blocks. At 390×844, the graph is visible without scrolling.

## 2. Mobile navigation redesign

The wrapped desktop menu was replaced at compact widths by a single-line semantic index rail. A stable identity link sits beside a horizontally scrollable numbered route strip. Every destination remains a native Next.js link with a minimum 44px target and one-tap activation.

## 3. Active-route orientation

The current route receives a restrained underline and brighter type. Nested subject routes keep their parent cluster marked with `aria-current="location"`; direct routes use `aria-current="page"`. The active item automatically scrolls into the visible portion of the rail.

## 4. Hero/graph integration

The hero copy occupies the foreground while the live constellation rises through the midground beneath it. The graph is not attached to text transforms and retains independent D3/idle behavior. Ambient stars remain the background layer.

## 5. Stage-height strategy

Compact semantic stages now use route-owned `svh` variables rather than one universal block: Flood 50, AI 48, Learning 46, Projects 44, Current Focus 44, Leadership 40, and Identity 50. Clamp limits protect short and tall phones.

## 6. Label hierarchy changes

Compact labels use local semantic importance rather than a global size increase. Active labels are strongest, immediate neighbors become readable, and unrelated depth labels recede so dense scenes remain legible.

## 7. Active-neighborhood behavior

Story and projection controllers expose active/neighbor state as data attributes. CSS uses those states to strengthen nearby labels and incident semantic regions without changing node IDs, relationships, physics, or source content.

## 8. Dead-space reductions

Mobile panel padding, negative stage overlap, intro spacing, and scene height now respond to the route. Empty gaps created by desktop-derived dimensions were removed while intentional separation between narrative events remains.

## 9. Current Focus compositions

The four focus scenes retain distinct `atlas`, `split`, `distributed`, and `convergent` compositions. Compact title alignment and stage overlap make Flood structured, Computational analytical, AI distributed, and Leadership calmer instead of forcing one repeated template.

## 10. Flood

Flood remains the benchmark structured system with exactly seven nodes and eight edges. Its taller stage makes the approved research topology readable without adding or remapping content.

## 11. AI

The AI stage uses the denser 48svh frame and active-neighborhood hierarchy to present AI & Technology, Hermes, Local AI, agents, research workflows, knowledge management, and trade-offs as one controlled semantic field.

## 12. Projects

Projects uses a compact branching composition. Nothipotro and Knowledge Workflow Experiments remain connected to their approved descendants, with directional geometry carrying meaning instead of project-card UI.

## 13. Leadership

Leadership uses the calmest stage height and restrained vocabulary while keeping Public Speaking, Toastmasters, Structured Feedback, Model United Nations, preparation, and negotiation spatially present.

## 14. Learning

Learning uses a taller exploratory stage and alternating title alignment. Existing branches can enter the portrait frame from different directions without changing approved topology.

## 15. About

The identity intro and semantic projection now overlap into a coherent opening composition. Adnan and the six approved themes occupy the upper/middle field while biography begins adjacent to the system, eliminating the detached ornament-and-gap pattern.

## 16. Typography

Compact display scale, line height, paragraph width, navigation type, and section spacing were tuned independently from desktop. The headline remains prominent but no longer consumes the complete first viewport.

## 17. Glyph optical alignment

Decode glyphs now have tier-specific optical boxes and baselines. System marks use a 0.82em box; editorial marks use a smaller 0.70em box with a serif-aligned baseline and restrained stroke. Accepted Decode V2 timing remains 0.60s system, 0.80s editorial, and 1.05s major.

## 18. Scroll rhythm

Compact film progress now maps through the full sticky narrative (`bottom top`), improving alignment between the visible prose panel and semantic state. Route-owned scene heights shorten uneventful scroll runs without increasing distraction.

## 19. Reduced motion

Reduced-motion visitors receive the same integrated hero, route context, complete semantic graph, readable labels, and content order in a static layout. No information or navigation depends on animation.

## 20. Accessibility

Navigation retains a semantic `nav` landmark, full accessible route names, page/location state, visible keyboard focus, and native links. Visual abbreviations are hidden from assistive technology. Touch targets remain single-tap and no pointer handler prevents navigation.

## 21. Viewport QA

Automated browser inspection covered 360×800, 390×844, 430×932, 412×915, and 393×852. Each viewport reported a 60px one-line header, a visible first-viewport graph with seven primary nodes, zero horizontal overflow, a visible active About item, seven About projection nodes, and no console/page errors.

## 22. Recording/perceptual QA

A retained 390×844 WebM journey covers homepage first load, universe reveal, navigation use, Current Focus, Research, Flood, AI, Projects, Nothipotro, Leadership, Learning, and About: `docs/qa/phase-12c-mobile-cinematic.webm`. The complete recorded run finished without console or page errors. Perceptual checks confirmed immediate graph identity, route-specific density, readable active regions, and a coherent About opening.

## 23. Desktop regression

The Phase 12C layout changes are compact-media-query scoped except for the shared Decode glyph optical correction and semantic state attributes. Desktop graph architecture, route layouts, transitions, and content were not redesigned.

## 24. Tests/build

Focused tests protect the mobile semantic SVG (no grid fallback), approved routes, native-link/single-tap navigation, accessible active state, one persistent semantic stage, reduced-motion layout availability, tier-specific glyph sizing, accepted Decode timing, exact content, and topology. `pnpm verify:content`, `pnpm lint`, `pnpm typecheck`, all 62 Node tests, and `pnpm build` passed. The production server returned HTTP 200 with the application shell on all ten approved routes.

## 25. Source integrity

All eight approved public-content hashes remain verified. The semantic dataset remains exactly 38 nodes and 50 directed relationships. No route, public prose, content mapping, node, edge, or dependency was added or changed in Phase 12C.

## 26. Remaining visual issues

The horizontal route rail intentionally relies on native horizontal scrolling when every destination cannot fit; the active route is automatically centered, but first-time users may not immediately discover every off-screen destination. This is a minor affordance trade-off, not an accessibility or routing failure. Final testing found no blocking mobile composition issue.

PHASE 12C: PASS — MOBILE CINEMATIC COMPOSITION COMPLETE
