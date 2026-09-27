# Phase 13D — Persistent branch constellations and semantic focus

Work continues on `improvement-v2`, preserving the pre-existing uncommitted Phase 13A–13C work. No deployment, merge, commit, dependency change, route change, or public-content edit.

## Presentation ownership

`NarrativeFilm` declares `data-branch-persistent`. All public world/subject films and the two existing About narrative stages opt in; Home's hero and Current Focus keep their existing owners and replay policy.

`film-controller.ts` creates one `branch-focus-controller.ts` instance for each persistent stage. The existing `KnowledgeGraph` SVG, controls, nodes and edges remain mounted throughout the film. Scene activation selects a semantic subject; it never calls D3 or writes authoritative base coordinates. Compact mode uses one ScrollTrigger with panel thresholds measured at refresh, keeping native wheel/touch scrolling and choosing the scene in the reading band beneath the sticky graph. Desktop keeps its established sticky composition and text timeline.

`scene-replay-controller.ts` still manages activation epochs, Decode/typewriter, vocabulary and copy reveals. For branch stages it never acquires graph bodies, labels or edges and never sets `data-scene-revealing` on the graph. This removes repeated node formation, whole-edge drawing and idle suspension. Home's existing graph reveal path is unchanged.

## One tracer and semantic camera

One aria-hidden SVG circle is created per stage. Its target is an approved visible node ID. It subscribes to the existing `story-projection.ts` bridge, so D3 publication, presentation offsets and semantic idle all move the ring with the actual rendered star. There is no separate permanent tracer clock, per-node observer, duplicate graph, or restarted physics simulation.

Focus changes take 280–420 ms based on travel distance. The previous timeline is killed before retargeting, starting from the ring's current presentation position. The ring contracts slightly and dims during travel (especially long moves), then draws its outline over the final 30% of the transition. Its settled opacity is 0.64 with a 1 CSS-pixel stroke and no glow, rotation or pulse. The radius is the rendered core radius plus 8 CSS pixels on wide profiles or 5 on compact profiles. One ResizeObserver recalibrates the screen-space margin. The ring follows existing idle without adding its own breathing cycle.

The camera moves the same complete constellation by an absolute offset capped at 5.5% of stage width/height in either direction. Opposite focus positions therefore span at most 11%. It is computed from base geometry, excluding previous camera and idle offsets. Repeated scrolling cannot accumulate displacement. It neither replaces nor restarts the approved idle system.

Active nodes use full emphasis, direct neighbors 0.86, and other route nodes 0.64. Incident approved edges use opacity 0.76; the rest stay present at 0.34. Pointer/keyboard inspection retains its existing override. Active labels become strongest, neighbor labels clearer, and unrelated labels stay visible. The active label receives a small presentation-only gap when needed to clear the tracer.

## Semantic mapping and route coverage

Focus resolves an exact approved label matching the scene title, otherwise the existing scene topic or retained Flood editorial emphasis. It does not infer mappings from prose or modify source IDs. Incident edges are selected only from actual relationships whose endpoints are both visible.

| Route/stage | Persistent scope and focus |
| --- | --- |
| `/ai` | The same 7-node/8-edge AI view through Hermes, Local AI, AI Agents, Research Workflows, Knowledge Management, and Local and Cloud Trade-offs. AI & Technology remains the route introduction and graph anchor, not an invented additional prose scene. |
| `/research` | The approved Research view, focused on the discussed research item. |
| `/research/flood-accessibility` | The same 7-node/8-edge view for all eight sections; one target chosen from the existing Flood presentation associations. |
| `/projects` | The existing project view follows the approved project subject. |
| `/projects/nothipotro` | The existing subject view remains intact; headings without a more specific node retain their approved item topic. |
| `/projects/knowledge-workflows` | The existing workflow view follows exact topic labels or the approved item mapping. |
| `/leadership` | The same leadership view follows the actual discussed practice/organization. |
| `/learning` | The same learning view follows the actual subject. |
| `/about` | Existing identity and Current Focus films each own one persistent projection and one tracer; no scene-specific SVGs. Current Focus shows its complete union using deterministic stable presentation coordinates rather than overlapping scene layouts. |

If a scene's semantic target is absent from its projection, the tracer is hidden rather than placed on an invented point. This applies to some About identity headings. The surrounding graph remains visible. About retains two narrative scopes; it was not rebuilt into a new page-wide composition.

## Mobile, reduced motion and accessibility

Compact branches use a bounded sticky graph beneath the existing navigation, with normal-flow narrative text. The previous bottom mask is removed for branch stages so deep nodes remain visible. Labels are optically scaled in CSS pixels for the shorter graph viewport. Touch is still native, and coarse pointers do not imply reduced motion.

Reduced motion keeps the graph visible, updates semantic emphasis and places the tracer directly, with zero camera displacement and no Decode animation. The existing native links, buttons, relationship text, headings and `aria-current` scene navigation remain authoritative. The tracer is a visual supplement, not an additional interactive or screen-reader control.

The focus controller disposes its tween, observer, projection subscription, circle and temporary presentation styles on route/preference cleanup. Document hiding settles a pending focus move and suspends text replay. Scene changes do not remount React graph elements or create new D3 controllers.

## Verification and retained evidence

- `pnpm verify:content`: all eight SHA-256 hashes match; 38 global nodes and 50 directed relationships remain unchanged.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: 75 tests passing, including real semantic focus/incident-edge selection, bounded absolute camera offsets, and branch replay exclusion from graph ownership.
- `pnpm build`: all ten public routes statically generated successfully.
- AI browser benchmark: desktop 1440×900 and touch-emulated compact 390×844, every scene forward and backward, rapid `AI Agents → Research Workflows → AI Agents → Local AI → AI Agents` changes, native wheel/touch direction changes, and idle continuation.
- Per-frame browser checks assert one persistent SVG and tracer, retained node DOM identity, no graph Genesis markers, no hidden nodes/edges, unchanged base coordinates, correct incident-edge emphasis, and subpixel settled tracer alignment.
- All eight requested branch/subject routes plus both About stages checked forward/backward in both viewport classes.
- Reduced-motion desktop/compact checks verify direct focus changes and zero presentation displacement.
- Home desktop/compact regression checks verify 38/50 geometry, repeated dissolution/reconstruction, and no branch tracer.
- Navigation from AI to Projects during a focus change and browser Back verified with one tracer and no runtime errors.
- Final production preview: all ten public routes return HTTP 200 with the expected approved prose and one H1. The AI recordings were repeated against the final production build on port 3000. Browser suites report 24 passing scenarios and zero console/page errors; package, lockfile, workspace policy and public JSON diffs are empty.

Recordings:

- [AI desktop traversal and reversals](qa/phase-13d-ai-desktop.webm)
- [AI compact traversal and touch reversal](qa/phase-13d-ai-mobile.webm)

Screenshots and machine-readable results are retained alongside the recordings in `docs/qa/phase-13d-*`. The standalone QA script accepts `PLAYWRIGHT_MODULE` (an external installed Playwright/Core path), `QA_ORIGIN`, and `QA_MODE` (`ai`, `routes`, `reduced`, `home`, or `all`). No browser-test package was added to the application.

## Practical limits

Mobile verification uses Chromium touch emulation, not physical iOS/Android hardware. Reduced motion intentionally skips camera/ring travel. The existing route-entry transition remains separate; persistence applies within the established route narrative. About keeps its two existing semantic scopes and omits the tracer where a topic is outside the identity subset. Root labels retain the approved typeface/hierarchy while active subjects receive the focus treatment.

PHASE 13D: PASS — PERSISTENT BRANCH CONSTELLATIONS COMPLETE
