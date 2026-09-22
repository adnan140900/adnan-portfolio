# Phase 12 — V2 Experience Audit

Date: 2026-09-21

Status: architecture and motion specification only. The Phase 9AA visual implementation remains frozen; this document does not authorize or include the V2 rebuild.

## Executive finding

The approved semantic data and most of the desktop motion machinery are reusable, but the current compact experience is not a portrait composition of the same system. At compact widths the main SVG constellation is hidden and replaced by a separate grid of controls. Several independent policies also equate compact or coarse-pointer devices with reduced motion. The result preserves content and navigation, but loses the topology, living movement, formation choreography, and persistent semantic-stage identity that define the desktop experience.

V2 must separate **motion preference** from **device composition**. Mobile receives the same semantic system and meaningful animation, recomposed for portrait geometry and a smaller rendering budget. Only an explicit reduced-motion preference receives the static experience.

The decode system is structurally sound—deterministic, accessible, fixed-width, centrally scheduled—but its current 1.3–1.95 second durations, low substitution density, and 12 Hz write cadence make it feel sparse and slow. V2 should preserve the controller architecture while replacing the timing and resolution model specified below.

## Current implementation audit

### Compact/mobile gates that suppress parity

| Area | Current path | Current compact behavior | V2 disposition |
| --- | --- | --- | --- |
| Primary graph | `src/features/graph/components/knowledge-graph.tsx`, `src/app/globals.css` | Hides `.force-graph-svg` below 48rem and displays `.mobile-graph-list`, a normal-flow grid unrelated to edge geometry | Replace the visual grid with a portrait projection of the same SVG nodes and edges |
| D3 settlement | `src/features/graph/graph-runtime-policy.ts`, `src/features/graph/hooks/use-force-graph.ts` | Controller and animation require a desktop/fine-pointer query | Permit one bounded settle on compact devices; never run a permanent simulation |
| Semantic idle | `src/features/kinetic/use-semantic-idle.ts` | Requires desktop/fine pointer and clears offsets otherwise | Run bounded mobile parameters whenever motion is allowed |
| Breathing and edge activity | `src/features/kinetic/use-constellation-motion.ts` | Requires desktop/fine pointer; touch movement is ignored | Use the shared clock on mobile and add touch/scroll emphasis semantics |
| Route transition | `src/features/motion/portfolio-transition-provider.tsx`, `src/features/motion/transition-policy.ts` | Compact mode fades/scales the source and fades the target; branch formation is cinematic-only | Add a shorter mobile-cinematic branch-growth mode using the same growth plan |
| Narrative film | `src/features/narrative/narrative-film.tsx`, `src/features/narrative/film-controller.ts` | Desktop uses one persistent stage; compact creates panel-local timelines and static projection copies | Use one persistent portrait stage and one scroll-progress owner per film |
| Semantic projection | `src/features/narrative/semantic-projection.tsx` | Calls `useSemanticIdle(..., mobile ? true : reduced)`, explicitly forcing mobile into static behavior | Pass the actual motion preference; select a portrait geometry profile separately |
| Ambient Canvas | `src/features/ambient/starfield-policy.ts`, `src/features/ambient/ambient-starfield.tsx` | Compact has fewer stars, 12 fps policy, no parallax, and animation disabled | Animate a bounded star field at the mobile budget; keep parallax absent or extremely shallow |
| Knowledge field | `src/features/kinetic/knowledge-field.tsx`, `src/features/kinetic/kinetic.css` | Compact/coarse enters quiet mode and renders only three static slots | Keep a lower-density but living semantic field; static only under reduced motion |
| Decode | `src/features/kinetic/decode-text.tsx`, `src/features/kinetic/decode-model.ts`, `src/features/kinetic/decode.css` | Compact or coarse pointer immediately reveals final text and CSS hides all decode artifacts | Enable decode on mobile; lower glyph cost without disabling the effect |

The compact film path is not entirely motionless: it animates panel titles and geometry with per-panel GSAP timelines, and compact route transitions retain a simple fade. Those motions do not animate the semantic nodes and relationships as one persistent system, so they do not provide parity.

### Decode bottlenecks

- `src/features/kinetic/decode-config.ts` currently defines 1.3s system, 1.65s editorial, and 1.95s major durations, plus a 0.14s cursor hold and 12 fps cadence.
- `src/features/kinetic/decode-model.ts` ignores the frame value. A character can therefore change only as progress crosses a small number of global stages rather than moving through its own deterministic substitutions.
- Editorial candidates use a stride of five and a maximum of three unresolved characters. This is too sparse for titles and section entrances.
- `decodeAllowed` rejects compact contexts, while `DecodeText` immediately settles reduced, compact, hidden, and already-played entrances through one shared condition.
- `src/features/kinetic/kinetic-text.tsx` retains an older, independently gated compact policy. It is currently unused and should be removed or made a thin wrapper around the canonical decode system to prevent policy drift.
- Existing fixed-width cells, preservation of punctuation and whitespace, final accessible text, visibility cleanup, once-per-route behavior, and the two-job scheduler are sound and should remain.

### Reusable foundation

V2 should preserve these verified assets:

- The approved public graph document, adapters, selectors, route policies, and unchanged directed topology.
- Stable D3 settlement and straight geometric edge rendering.
- `story-projection` composition of physical, narrative, and idle offsets.
- Deterministic idle motion with active-time pause/resume and no catch-up jump.
- `semantic-stage-model` route personalities and the existing semantic-stage controller.
- The branch-growth plan derived from real edges.
- The fixed-cell, accessible decode renderer and shared decode scheduler.
- Intersection and document-visibility lifecycle cleanup.

## MOBILE PARITY ARCHITECTURE

### 1. Independent capability profile

Replace boolean `desktop`/`compact` motion gates with a shared runtime profile whose axes remain independent:

```ts
type ExperienceProfile = {
  motionPreference: "unresolved" | "full" | "reduced";
  viewport: "compact" | "wide";
  pointer: "coarse" | "fine";
  performance: "normal" | "constrained";
  visibility: "visible" | "hidden";
};
```

Policy rules:

1. `motionPreference === "reduced"` is the only reason to select the intentionally static experience.
2. `viewport` chooses projection, framing, label density, and choreography—not whether semantic motion exists.
3. `pointer` chooses interaction feedback. Fine pointers get hover; coarse pointers get touch emphasis.
4. `performance` adjusts particles, Canvas DPR, cadence, and decorative amplitude. It must not remove semantic identity.
5. Animation waits until motion preference is resolved and pauses while hidden or offscreen.

### 2. One semantic graph renderer

Render one accessible SVG constellation across viewport sizes. The same node IDs, real edges, node kinds, categories, route controls, importance hierarchy, colors, restrained glow, and straight-line visual language must be present at every width.

The compact visual must not be a card or button grid. Accessible controls can remain DOM buttons or links, but their visual positions must be attached to the projected semantic nodes. A separate visually hidden navigation list may supplement keyboard/screen-reader access; it must not become the visible mobile representation.

### 3. Canonical geometry, portrait projection

Keep one settled canonical graph and project it into the viewport:

```text
approved topology
  -> bounded D3 settle or stable canonical coordinates
  -> normalized semantic coordinates
  -> viewport projection (landscape or portrait)
  -> story offsets
  -> idle offsets
  -> camera/framing transform
```

The portrait projection may use anisotropic scaling, a small rotation, vertical bias, boundary clamping, and mobile-specific label placement. It must not regenerate or alter topology. The center identity remains dominant, primary themes retain the next level of emphasis, and deeper levels remain progressively quieter.

Adaptable properties are: coordinates, orbit aspect, camera crop, label visibility, label collision strategy, drift amplitude, update cadence, Canvas density/DPR, and choreography distances. Invariant properties are: IDs, topology, relationship direction, approved labels, node kind/category, relative importance, palette semantics, selected/focus state, geometric edges, and accessibility names.

### 4. Living mobile motion

For normal motion preference:

- Run semantic idle at 24 fps with approximately 50–65% of desktop amplitudes.
- Preserve independent node phases, subtle breathing, and restrained edge activity.
- Use one shared clock for a visible graph. Write only transforms and opacity imperatively; do not set React state per frame.
- Freeze or damp the selected node during direct interaction, then blend back without elapsed-time catch-up.
- Keep D3 as a finite settlement step. No viewport runs a permanent physics simulation.
- Pause completely when the graph is offscreen, the document is hidden, or a route transition owns the scene.

Touch semantics:

- A press gives immediate node and incident-edge emphasis.
- A routed node keeps normal single-tap link activation; the press phase supplies preview feedback without creating a two-tap accessibility trap.
- A non-routed node can toggle a persistent selected state until another node or the background is tapped.
- Keyboard focus produces the same incident-edge emphasis and readable labels.
- Scroll-driven films may emphasize a scene's semantic region, but scroll must never be required to activate links.

### 5. Mobile semantic films

Current Focus and each subject world should own one persistent portrait semantic stage, not a static projection copied into each text panel. Use one scroll-progress owner per film to drive the existing semantic-stage model through portrait-specific offsets and camera framing.

The portrait stage can occupy roughly 38–46svh and remain sticky or contained while accessible prose flows normally. Scene progress must move real nodes and real relationships, update emphasis, and run eligible heading decode. Panel-local copies may remain only as nonvisual accessibility descriptions if needed.

This applies uniformly to Research, Flood Detection & Aid Distribution, AI & Technology, Projects, Leadership, and Learning. Flood must retain its exact seven-node/eight-edge semantic view. No subject may substitute a generic illustration for its approved topology.

### 6. Mobile scene and route transitions

Add a `mobile-cinematic` route policy. It uses the same real-edge branch-growth plan as wide layouts, with shorter distances, fewer simultaneous decorative effects, and less camera travel. The target graph should form as anchor → branch → child → secondary branches; it must not simply fade in as a completed graph.

Back navigation, interrupted navigation, and browser history must cancel cleanly and leave the destination in a settled, accessible state.

### 7. Canvas and decorative budget

Normal compact profile target:

- 80–140 ambient stars, selected by viewport area and performance class.
- Device-pixel ratio capped at 1.25.
- 24 fps maximum; constrained devices may use 12–18 fps for decoration while semantic motion remains legible.
- No pointer parallax on coarse devices. Use deterministic low-amplitude drift.
- Fewer particles and no expensive full-canvas compositing loops.
- Draw once only for reduced motion.

### 8. Performance contract

- Mobile animation budget: 24 fps; desktop semantic budget: 30 fps.
- One animation clock per visible graph and one scroll-progress owner per active film.
- No permanent D3 simulation, per-frame React renders, or viewport-wide layout reads inside ticks.
- Animate compositor-friendly transforms and opacity; batch SVG attribute writes.
- Pause hidden/offscreen work and disconnect all observers, tickers, and GSAP contexts on unmount.
- Retain all semantic nodes and edges; selectively reduce labels and decorative particles instead of deleting meaning.
- Decode scheduler remains capped at two concurrent jobs.

### 9. Reduced-motion contract

Reduced motion is a separate profile, not the mobile profile. It receives final readable text immediately, settled graph geometry, visible relationships, no idle drift, no branch-growth timeline, draw-once Canvas, and ordinary route navigation. Content, topology, controls, focus states, and hierarchy remain identical.

### 10. Mobile parity acceptance criteria

At representative 360px, 390px, and 430px widths with normal motion enabled:

- The visible graph uses the same semantic node and edge set as its wide counterpart.
- Adnan → primary themes → deeper nodes → approved relationships remains visually readable.
- The visible grid fallback is absent.
- Nodes breathe and drift within bounds; edges remain attached.
- Touch and keyboard focus visibly emphasize incident relationships.
- Ambient Canvas and eligible decode entrances animate within budget.
- Current Focus and subject films move one persistent semantic stage through their approved scenes.
- Route entry visibly forms the destination graph from real relationships.
- There are no layout shifts, trapped two-tap links, offscreen animation leaks, or horizontal overflow.

With reduced motion enabled, all of the above semantics remain present but animation is static. Automated tests must additionally prove that public-content hashes, route policy, node/edge counts, relationship directions, and Flood's seven-node/eight-edge topology remain unchanged.

## DECODE V2 MOTION SPEC

### Timing targets

| Tier | Default | Allowed range | Intended use |
| --- | ---: | ---: | --- |
| System | 0.60s | 0.45–0.80s | Navigation, compact labels, status text |
| Editorial | 0.80s | 0.60–1.00s | Section and scene headings |
| Major | 1.05s total | Generally below 1.20s | Home identity and rare major entrances |

The major total includes a 0.06–0.08 second cursor/final hold. Compact devices use the same defaults or at most 10% shorter durations; they do not skip the effect.

### Resolution choreography

Use a 24 Hz shared visual cadence. Each candidate cell receives a seeded, deterministic substitution sequence and cadence so the `frame` input materially changes selected unresolved glyphs without producing random per-frame soup.

| Progress | State |
| --- | --- |
| 0–12% | Acquire: reveal the fixed-width field with 55–80% of system candidates unresolved; editorial titles use roughly 35–55% |
| 12–45% | Reconstruction: rotate two to four deterministic substitutions per selected cell and resolve staggered chunks |
| 45–72% | Semantic lock: the word is already readable; approximately 15–30% of selected cells remain active |
| 72–88% | Tail: resolve the final one or two cells and retire custom marks |
| 88–100% | Final: exact accessible copy is fully visible; optional restrained cursor hold completes |

Suggested concurrency limits:

- System labels: no more than 55–80% of eligible alphanumeric cells unresolved at entry.
- Editorial titles: 4–8 concurrently active candidates, bounded by title length.
- Major titles: 8–14 candidates, staged so the identity becomes readable before the tail.
- Custom SVG marks: maximum four at once on wide layouts and two on compact layouts. Unicode substitutions may carry the remaining activity.
- Whitespace and punctuation never mutate. Body paragraphs never decode.

### Determinism and readability

Derive each cell's sequence from stable inputs such as text, index, tier, and route key. A cell advances at its own seeded cadence, not from unbounded randomness. Replaying the same eligible entrance produces the same sequence, and the final DOM text is always the approved source string.

The text must be decipherable by the midpoint. Decode is an entrance accent, not a content-obscuring loading state. It must preserve fixed cell measurements and introduce no layout shift.

### Lifecycle and accessibility

- Run once per intended route or scene entrance; do not restart due to incidental rerenders.
- Permit normal-motion compact/coarse contexts.
- Settle immediately only for reduced motion, hidden/offscreen cancellation, already-played entrances, or teardown.
- Preserve one accessible final string; intermediate glyphs and custom marks remain `aria-hidden`.
- Keep at most two jobs active. A higher-priority major entrance may preempt or settle a lower-priority decorative job.
- Visibility loss, route cancellation, and unmount synchronously restore final text and release ticker ownership.

### Decode V2 tests

Replace the existing compact-static contract with tests that prove:

- Compact normal-motion entrances produce intermediate deterministic states and the exact final string.
- Reduced motion resolves immediately at every viewport width.
- Frame progression changes unresolved glyphs deterministically while punctuation and whitespace remain fixed.
- Tier durations remain inside the target ranges and major completion stays below 1.2 seconds.
- Editorial/major concurrency and custom-mark caps are honored on compact and wide profiles.
- Text is substantially readable by 50–55% progress and has at most two unresolved tail cells after 78%.
- The scheduler never exceeds two jobs and cleans up synchronously.

## Tests whose current expectations must change

The current suite intentionally locks several Phase 9AA fallbacks. V2 implementation must revise, not work around, these contracts:

- Decode test: compact currently resolves instantly.
- Ambient policy test: mobile currently remains static.
- Graph runtime test: mobile currently creates no physics controller and never animates.
- Transition test: compact currently selects a simple fallback rather than formation choreography.

Topology, schema, source-content, route, projection-boundary, deterministic-idle, cleanup, and no-continuous-D3 tests remain valid and should be expanded across portrait profiles.

## Recommended implementation sequence

1. Capture current desktop and reduced-motion characterization tests and reference screenshots.
2. Introduce the independent capability profile; remove `compact` from all reduced-motion decisions.
3. Implement Decode V2 in the pure model and shared controller, then enable compact entrances.
4. Unify the graph renderer and add deterministic portrait projection and label policy.
5. Enable mobile semantic idle, breathing, edge activity, touch emphasis, and the bounded Canvas clock.
6. Replace panel-local mobile projections with one persistent Current Focus portrait stage.
7. Apply the same portrait stage architecture and route personalities to every subject world.
8. Add mobile-cinematic real-edge formation and cancellation behavior.
9. Run accessibility, performance, reduced-motion, viewport, route-history, and content-integrity verification.

Implementation should be staged behind explicit policy boundaries so desktop and reduced-motion baselines can be checked after every step. Phase 12 stops at this audit and specification; no V2 implementation has been started.

## Audit verification

- `pnpm test`: passed, 54/54 tests.
- `pnpm verify:content`: passed; all eight approved public payload hashes match the release manifest.
- No approved content, topology, production source, dependencies, or lockfiles were changed by this audit.
