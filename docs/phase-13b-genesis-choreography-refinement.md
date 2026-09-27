# Phase 13B — Genesis choreography refinement

PHASE 13B: PASS — UNIVERSE-FIRST REPLAYABLE EXPERIENCE COMPLETE

## Scope and hierarchy

Built on the existing, uncommitted Phase 13A work in `improvement-v2`. The SVG/DOM semantic graph, Canvas atmosphere, D3 coordinate owner, shared projection bridge, and original idle system remain in place. Public text and JSON, fonts, routes, node coordinates, 38 nodes and 50 directed relationships are preserved. No dependencies were added; no merge or deployment was performed.

The desktop graph now occupies 74% of the hero width, with the editorial annotation occupying 22%. The headline is `clamp(34px, 2.7vw, 44px)`, measuring 38.88px at 1440×900. Body copy is 13.12px with the existing sans font. On compact screens the headline is `clamp(21.6px, 5.65vw, 25.6px)`; the universe uses 76% of the hero height beneath the compact annotation. There are no cards or glass panels. The existing wording remains complete, including the introduction and About link.

The Knowledge Field's largest ghost word is hidden while the hero intersects the viewport. Smaller annotations are attenuated to 20% of their original opacity. The existing ambient clock continues, so leaving the hero restores the same field without restarting its loops. The independent opening signal is omitted to keep node convergence first.

## Decode Typewriter

`decode-typewriter-model.ts` supplies a deterministic moving acquisition window across the exact approved text. Future cells remain visually hidden while retaining their final width. At most three incoming cells occupy the window; a character passes through up to three glyph states, then locks to its final character. Locked text never scrambles again during the cycle.

`decode-controller.ts` runs this presentation mode through the existing shared 24-fps GSAP ticker. Home headline duration is 2.3 seconds. The thin caret is attached to the current character cell and disappears after the existing 70ms finishing hold. It does not blink permanently. The same custom SVG paths and Phase 12C editorial optical sizes are used. The complete static text remains in the screen-reader layer; the changing duplicate is aria-hidden.

Each element has one cancellable scheduler owner. Replay jobs bypass the session completion set and do not add entries to it. The two-job foreground cap remains. A completed or cancelled job releases its owner and ticker subscription, clears the caret, and restores all final characters. React does not render animation frames.

## Entry and reconstruction

Fresh Home Genesis now lasts 5.2 seconds:

| Time | Event |
| --- | --- |
| 0–2.03s | ID-seeded semantic fragments converge; labels resolve near arrival |
| 1.85s | Small identity Decode begins |
| 2.03–2.35s | All nodes settled; calm before relationships |
| 2.35s | Root relationships begin their staggered path draw |
| 2.4s | Headline Decode Typewriter begins |
| 3.0s | Primary branches begin |
| 3.7s | Deeper branches begin |
| 4.35s | Bridges/cross-domain relationships begin |
| 4.65s | Introduction and About link fade into view |
| 5.2s | Final edge completes; original idle resumes |

Phase 13A's native-scroll RAF still maps an absolute scroll position to node displacement and edge progress. The interval is now `max(320px, min(heroHeight × .82, viewportHeight × .82))`. The surface receives bounded 38%-of-interval translation as it leaves the hero, giving fragment trajectories longer to remain visible. There is no pin spacer or scroll interception.

Scatter vectors are larger (wide base reach 310–640 SVG units; compact 175–395), constrained to each graph's own territory using the already-rendered authoritative coordinates. Seeded tangential bends, a broader apparent scale range, and greater retained early opacity make travel visible. Full scatter opacity is 0.46–0.86 of each node's original presentation. All real nodes remain mounted. Final scale and displacement return exactly to one and zero.

On downward scroll, bridges retract first, followed by deep branches, primary branches and root relationships. This ordering gives the requested root-first construction when reversed. All edges are gone by progress .34; nodes do not move until .42. Labels recede in depth order near this handoff. There is an .08-progress calm interval with settled nodes and no lines. Each group also staggers individual edges. Returning upward therefore shows nodes first, calm, root lines, primary branches, deeper branches and bridges. The ordering is deterministic on every cycle.

## Replay lifecycle and hysteresis

Graph reconstruction has no play-once gate and remains a direct function of scroll progress. The fresh-document Genesis gate governs only time-driven entry.

Hero text uses a separate boundary latch:

- Progress **≥ .92** arms the next reveal and advances its cycle identity exactly once.
- Returning through **.40** makes the small identity eligible.
- Returning through **.18** consumes the armed latch and starts the headline reveal.
- Returning through **.04** restores the supporting text and returns the lifecycle to active.
- Another cycle cannot begin until progress reaches .92 again.

Tiny scroll changes and midway direction reversals never restart the graph or headline. At rest, no timer re-arms typing or Genesis. The original idle clock is the sole semantic micro-motion owner.

Home Current Focus titles opt into scene replay. They re-arm only once their distance from the scene's timeline center reaches .85 scene units, or the film meaningfully leaves the viewport. Re-entry requires the panel to be current and visible. A current-index boundary alone does not re-arm typing, preventing jitter near scene transitions. The story timeline, semantic projections and background loops retain their existing owners. Decorative field resolves and unrelated route-entry text keep their previous policies.

## Compact, accessibility and cleanup

Compact normal-motion devices receive convergence, sequential relationships, typewriter and repeatable dissolution/reconstruction. Native touch and momentum scrolling remain available. Reduced motion shows the full graph and text immediately, without scatter, typing or an animated cursor. The CSS hydration gate also keeps a no-JavaScript document readable.

Scene observers and reveal jobs are disposed on route/unmount and motion/viewport changes. Hidden documents settle typing; the entry clock retains its visibility handling. Existing focus/click release restores readable controls before navigation. Back/Forward cannot retain an old cursor or running typing job.

## Verification and evidence

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (68 tests), `pnpm build`: passed.
- Build-time immutable-content verification: all eight SHA-256 checks passed. Existing public routes prerender successfully.
- New focused tests cover progressive character lock, five cycles of hysteresis with partial reversals, replacement/cancellation of one-owner Decode jobs, and an idle scheduler with zero jobs after cleanup. Existing geometry/order tests were updated for the deliberate root-first reconstruction order.
- Automated browser QA and retained recordings: final results are in [phase-13b-results.json](qa/phase-13b-results.json).
- Desktop and compact recordings each passed two complete replay cycles; the stress recording passed five additional complete cycles plus rapid reversals. All 38 nodes/50 edges restored, authoritative coordinates remained exact, endpoints remained attached, the caret was removed and shared Decode job count returned to zero after every cycle. No browser errors were recorded. Home Current Focus backward title replay, reduced-motion switching, navigation and Back also passed.
- Visual review covered the recorded entry sequence and all four requested resting sizes. The graph is the larger visual subject in every capture; the compact layouts have no document-level horizontal overflow.
- Requested resting screenshots: [1440×900](qa/phase-13b-rest-1440x900.png), [360×800](qa/phase-13b-rest-360x800.png), [390×844](qa/phase-13b-rest-390x844.png), [430×932](qa/phase-13b-rest-430x932.png).
- [Desktop recording](qa/phase-13b-desktop.webm), [mobile recording](qa/phase-13b-mobile.webm), [five-cycle stress recording](qa/phase-13b-replay-stress.webm).

The optional `scripts/qa-phase-13b.mjs` uses an existing Playwright installation supplied through `PLAYWRIGHT_MODULE`; `QA_ORIGIN` defaults to localhost:3000. It asserts counts, exact base-coordinate restoration, attached edge endpoints, no residual transforms/caret/jobs, mid-scroll holds, partial reversals, bounded replay counts, Home focus-title replay, reduced-motion cleanup, route navigation and Back.

## Known compromises

The calm interval during scroll is spatial, not a timed pause: very fast native scroll or an instant jump seeks directly to the corresponding frame. Adding a time delay would break Phase 13A's direct reversible scroll contract. The headline typing is time-driven only after the meaningful return threshold; graph reconstruction never waits for it.

Compact captures and momentum/reversal tests use Chrome device emulation, not physical iOS/Android hardware. No five-minute physical-device soak is claimed. The persistent RAFs at rest belong to the pre-existing idle and atmosphere; this phase's typing scheduler releases its ticker when jobs finish, and the scroll RAF schedules only when needed.
