# Phase 13C — Universe-centered Home and global scene replay

## Scope and preservation

Work continues on `improvement-v2`, preserving the existing uncommitted Phase 13A/B work. No deployment, merge, commit, push, package installation, public-content change, or private-vault access. All eight approved export hashes match. The public graph remains 38 nodes and 50 directed relationships across the same ten routes.

Authoritative D3 geometry, compact projection coordinates, graph hierarchy, source labels, ambient rendering, idle parameters, route navigation, and typography families are unchanged. Only presentation framing and bounded reveal ownership change.

## Home composition

The server-rendered order is now universe → identity → compact headline → approved introduction → About. `home-universe-frame` groups graph and copy without duplicating either. Desktop graph surface is centered at 88% available width, with a 65svh drawing region (bounded 28–48rem) and 2rem of extra label clearance. A 1.10× presentation zoom enlarges the existing SVG without changing its approved viewBox, aspect ratio, or internal geometry. At 1440×900 the stage is 617px high and the semantic envelope occupies roughly 70% of viewport width. Text is centered, constrained, and below the graph rather than alongside it.

Compact composition uses the same order: a 66svh graph region, bounded 27–40rem, then the smaller editorial block. It retains the approved portrait projection and label hierarchy, not an alternative static mobile graph.

Normal-motion Home has one 105svh native-scroll interval after the opening frame. CSS sticky keeps the real graph visible through that bounded interval; no scroll locking, JavaScript pin spacer, or content relocation. After it ends, the unchanged Current Focus narrative continues. Reduced motion and no-JavaScript rendering omit this extra interval. This small increase in Home scroll length is deliberate: without it, the new text-below layout carried the fragments out of view before their return could be perceived.

## Genesis, Decode Typewriter, and scroll return

Genesis remains a time-driven 5.2-second graph sequence. Nodes settle by 2.03s, labels resolve, and ranked edges begin at 2.35s. Identity now starts at 3.6s and the accumulating headline at 4.1s, in the later edge construction. The paragraph and CTA use their restrained fade from 5.1s. The headline retains its 2.3-second duration, approximately 25 resolved characters/second, and its stable completed prefix. Only incoming characters use the existing approved Decode glyph family. Assistive technology always receives complete final text.

Home dissolution remains a direct absolute-scroll projection, not a triggered playback. The interval is approximately 1.05 viewport heights. Edges fully retract before nodes travel; labels reduce by semantic depth, with a calm unconnected interval. Primary/deep fragments retain near-full scale and brightness through early/mid displacement; final recession is weighted toward the end. Destinations remain ID-seeded and reversible. Returning to zero removes all temporary transforms, opacity, label filters, and edge dash overrides, handing the existing idle owner back its unchanged geometry.

The existing fully-departed hero latch is preserved: partial reversals do not restart the headline. Full departure followed by meaningful return creates one new text cycle.

## Shared replay architecture

- `scene-replay-model.ts`: pure activation epochs, latest-job tokens, direction-aware scene selection, and node/label/edge timing.
- `film-controller.ts`: the existing ScrollTrigger timeline remains the sole narrative scroll owner. It publishes scene identity and epoch. Its existing environment observer also handles route introductions and whole-film entry/exit; no observer per title or character.
- `scene-replay-controller.ts`: one bounded 1.65-second foreground reconstruction job. It cancels old work before starting new work, including handoffs between separate films on About, and uses the existing shared two-job Decode scheduler. Titles get priority over decorative vocabulary.
- `DecodeText`: film-owned text registers its final string and mode in DOM metadata, bypassing its standalone one-shot observer. Home retains its separate hero cycle. Unrelated one-shot safety gates are not blindly removed.
- Nested `data-scene-body` wrappers own only temporary scale, local translation, and opacity. The existing story/idle projection bridge owns coordinates and edge endpoints. D3 is never restarted for replay.
- Semantic-stage edge rendering cooperates with the temporary drawing owner and restores the current scene's normal solid/conditional-dash treatment afterward.

Every activation follows nodes (0–0.55s) → labels (0.55–0.85s) → settle → ranked edge drawing (1–1.65s). Scene copy receives a brief filter reveal, not typewriting. Titles use the existing Decode duration. Completed jobs release their temporary styles and resume the existing idle clock. Nothing periodically replays while stationary.

Scene transitions use a ±0.08 timeline-unit dead band around the former active-index boundary. A small reverse wheel movement therefore cannot toggle epochs. Whole-film entry and exit have distinct viewport reading bands, including a return to the route introduction; this enables Research's single-scene film to replay without navigating away. Intro titles re-arm after fully leaving the viewport. Reduced motion may update identity internally but never starts a reconstruction job.

The compact timeline now ends at `bottom bottom`, not the unreachable `bottom top`. This corrects a pre-existing range issue exposed by Leadership's eleven scenes: its final scene could otherwise remain unselected at the document's maximum scroll. No extra mobile route spacer or scroll interception was added.

Cancellation covers rapid scene changes, film departure, document hiding, responsive teardown, route teardown, and preference switching. Tokens invalidate superseded completions. Backgrounding does not rebuild the film effect or reset its epochs. Ambient Canvas and permanent breathing are not restarted.

## Subpage composition audit

Existing route layouts and title sizes remain intact. AI alone receives a conservative 1.12× desktop presentation scale inside its existing semantic region. The viewBox, semantic coordinates, node sizing hierarchy, and editorial column remain unchanged. Compact AI retains its existing portrait framing; other stages retain their existing scale where enlargement would crowd labels or prose.

The actual approved AI film includes Research Workflows as well as Hermes, Local AI, AI Agents, Knowledge Management, and Local and Cloud Trade-offs. QA must traverse all six scenes, preserving the additional approved scene rather than changing content to match the brief's illustrative list. AI & Technology's opening title is also replayable.

## Verification

Status: **PHASE 13C: PASS — UNIVERSE-CENTERED GLOBAL REPLAY COMPLETE**

Final source validation:

- `pnpm verify:content`: PASS, all eight immutable SHA-256 hashes match (also enforced in build/start).
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, 72 tests. Includes epochs, hysteresis, latest-job cancellation, cross-film handoff, reduced bypass, node-first choreography, structural Home ordering, typewriter timing, 38/50 topology, and exact geometry restoration.
- `pnpm build`: PASS, all ten approved routes prerendered, plus framework not-found output.
- Final production smoke: all ten routes HTTP 200; Home has 38 semantic nodes and 50 relationships; navigation during dissolution and back succeeds with no page errors. Mobile Leadership reaches active index 10 of 11, completes its reveal, and leaves zero Decode jobs.
- Dependency manifests, pnpm lockfile/workspace policy, authoritative geometry/projection modules, public-content adapter, and approved JSON have no new diff.

Home checks passed at 1920×1080, 1440×900, 1366×768, 1024×768, 360×800, 390×844, and 430×932. Automated bounding-box checks confirm centered framing, copy below the graph, dominant graph height, no horizontal overflow, and no clipped visible labels. The compact hierarchy intentionally hides some deep labels; those zero-area labels are not mistaken for clipping. Screenshots are retained as `qa/phase-13c-home-WIDTHxHEIGHT.png`.

Both desktop and mobile completed **five full dissolve/reconstruct cycles** with exact base-transform restoration, 38/50 counts, attached edge endpoints, and one new headline replay per cycle. The suite checks a stopped mid-scroll state, calm unconnected return interval, aggressive partial reversals, and native touch swipes. The final recordings and production screenshot were visually inspected.

AI completed all six approved film scenes forward → reverse → forward, plus return to the opening title, without reload. Epochs and Decode-run counters increased on re-entry, with no job left running afterward. All-route checks include stationary/jitter non-replay, meaningful backward re-entry, rapid jumps, graph endpoint consistency, unique node identities, and released temporary styles.

| Route | Film scenes | Desktop | Compact/touch |
| --- | ---: | --- | --- |
| `/` | Current Focus: 4; separate hero | PASS | PASS |
| `/about` | Identity: 3; Current Focus: 4 | PASS | PASS |
| `/research` | 1 | PASS | PASS |
| `/research/flood-accessibility` | 8 | PASS | PASS |
| `/projects` | 2 | PASS | PASS |
| `/projects/nothipotro` | 2 | PASS | PASS |
| `/projects/knowledge-workflows` | 1 | PASS | PASS |
| `/ai` | 6, plus opening | PASS | PASS |
| `/leadership` | 11 | PASS | PASS |
| `/learning` | 7 | PASS | PASS |

Reduced-motion Home, AI, and About remain readable without temporary scattering/formation. Live preference switching releases body transforms and relationship drawing. No-JavaScript Home shows the graph and complete headline without the extra sticky runway. Animated glyphs remain inside the `aria-hidden` visual duplicate, with complete final text provided separately to assistive technology.

Machine-readable evidence is retained in `qa/phase-13c-home-results.json` (hero/viewports/AI) and `qa/phase-13c-results.json` (route matrix/reduced motion). Both final suites complete successfully with empty console/page-error arrays. Resumed route records retain earlier successful checks as well as reruns; the final per-route checks are authoritative.

## Issues found and repaired during QA

1. Mobile's inherited hero overflow rule blocked sticky containment. The hero now permits sticky positioning while the graph shell retains its visual bounds.
2. Single-scene films needed a meaningful return-to-introduction boundary, not only a fully offscreen exit.
3. Fast crossings between About's two films could exhaust the two-job Decode budget. New foreground ownership synchronously cancels the departing film before allocating jobs; a focused regression test covers it.
4. The compact timeline's old end position made Leadership's final scene unreachable. The bounded end now matches the available scroll range.
5. Presentation zoom needed additional bottom clearance for the lowest Home labels. Framing now reserves that clearance without moving their semantic coordinates.

QA assertions were also scoped to the film being tested, so the legitimately scattered Home hero is not reported as a stale narrative transform. Hidden compact labels are excluded from visible-label clipping checks.

Required retained recordings:

- `qa/phase-13c-home-desktop.webm`
- `qa/phase-13c-home-mobile.webm`
- `qa/phase-13c-ai-replay.webm`
- `qa/phase-13c-route-replay.webm`

The reproducible browser script uses `PLAYWRIGHT_MODULE` for existing external tooling, `CHROME_PATH` for Chrome if needed, and `QA_ORIGIN` (default `http://localhost:3000`). Run `node scripts/qa-phase-13c.mjs` with that external tooling available. It never installs packages. Optional `QA_FROM`/`QA_UNTIL` stage bounds and `QA_REPORT` support focused reruns without discarding earlier evidence.

## Known compromises

- QA uses desktop Chrome and Chrome touch/viewport emulation, not physical iOS/Safari or assistive-technology certification.
- Home gains the bounded 105svh motion interval so the complete scatter remains visible. It is absent in reduced-motion/no-script output; normal page narrative resumes after it.
- The conservative route enlargement is desktop AI only. Compact routes keep their existing portrait composition and safe prose region; there is no global title-size or graph-layout redesign.
- Decorative vocabulary can resolve immediately if the existing shared Decode budget is occupied. Foreground scene titles have priority; work is never queued to animate late in the wrong scene.
- No long-running idle loop was added. Existing idle/ambient behavior is preserved by ownership and cleanup, rather than by running a five-minute wall-clock screenshot test.
