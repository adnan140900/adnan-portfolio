# Phase 9.6 — living motion tuning

## Scope

Only semantic idle parameter ranges, the settling duration and their focused tests changed. Phase 9.5 projection, ID seeding, stabilization, D3 equilibrium, formation choreography, frame cap, visibility handling, static policies and identity presentation remain intact. No dependencies, assets, public-content changes, topology changes or deployment.

Files changed: `src/features/motion/semantic-idle-model.ts`, `src/features/motion/use-semantic-idle.ts`, `src/tests/graph-domain.test.ts`, `README.md`, and this new report.

## 1–8. Parameter changes

| Parameter | Phase 9.5 | Phase 9.6 |
| --- | --- | --- |
| Primary-theme horizontal radius | 12–18 SVG units | 16–22 SVG units |
| Primary-theme x period | 45–87 active seconds | 24–48 active seconds |
| Child horizontal radius | 6–10 SVG units | 8–12 SVG units |
| Child x period | 45–87 active seconds | 20–42 active seconds |
| Vertical radius | 45–70% of horizontal | Unchanged |
| Root/view-anchor horizontal radius | 1.2 SVG units | Unchanged |
| Root/view-anchor x period | 45–87 active seconds | Unchanged |
| Anchored non-root y frequency / x frequency | 1 | 1.08–1.18, public-ID-derived |
| Independent no-center y frequency / x frequency | 1.13–1.37 | Unchanged |
| Settling envelope divisor | 8 active seconds | 4 active seconds |
| Interaction release speed time constant | 1.5 seconds | Unchanged |
| Semantic frame cap | 30 fps | Unchanged |
| Ambient drift/twinkle | Phase 9.5 values | Unchanged |

The amplitude increase deliberately uses the conservative end of the requested ranges. Shorter periods provide most of the velocity increase. The settling envelope retains its smoothstep and eased speed multiplier, so full amplitude arrives gradually rather than jumping at the nominal four-second boundary. Selected anchors remain comparatively heavy/stabilized. No formation timing changed.

Actual universe-theme values from the compiled model:

| Theme | x radius | y radius | x period (seconds) |
| --- | ---: | ---: | ---: |
| Research | 17.71 | 10.13 | 31.17 |
| Engineering | 21.44 | 9.84 | 28.53 |
| AI & Technology | 17.45 | 10.13 | 40.95 |
| Projects | 17.59 | 8.09 | 32.47 |
| Leadership | 21.19 | 12.11 | 25.20 |
| Learning | 21.58 | 10.49 | 24.69 |

Phases and directions are unchanged from their deterministic public-ID channels. The y period is x period divided by the frequency ratio, giving gently changing bounded paths rather than identical ellipses or a synchronized carousel.

## Verification

Final browser observations and regression results follow below. The pure five-second fixture checks that at least four themes move more than five SVG units over each sampled five-second interval, while their per-50-ms steps remain below 0.5 units. This supports velocity tuning but does not replace a real-browser perceptual check.

### 9. Perceptibility and clock observation

The production build was observed in the actual browser at desktop sizes, including 1440 × 1000. The homepage was observed for more than 20 seconds; Research and Learning each received timed 20-second observation windows. These were normally advancing browser clocks, not the previously throttled Phase 9.5 session:

- Homepage checkpoint: 6.024 wall-clock seconds / 6 active seconds. Five unheld themes moved 13.22–28.09 screen pixels; Adnan moved 0.29 px. Another theme was interaction-stabilized. The larger geometric change is readily distinguishable over this short interval, while individual frame steps remain small.
- Research checkpoint: 6.046 wall-clock seconds / 6 active seconds. Children moved 5.69–16.20 screen pixels; the selected Research anchor moved 0.00 px. The full observation covered 20.066 wall-clock seconds / 20.4 diagnostic active seconds (the diagnostic is published periodically, not on every frame).
- Learning: 20.018 wall-clock seconds / 20.4 diagnostic active seconds; the constellation remained in living idle with clear labels.

The practical short-interval result is visibly more active geometry without increasing travel to large viewport distances. Observation combines browser views and live rendered-position/clock measurements; it is not a high-frame-rate video or broad perceptual certification. One shared-tab sample changed routes during measurement and was discarded; subsequent measurements used a separate QA tab.

### 10–14. Motion and interaction checks

- Sampled homepage, Research and Learning label-box audits found no overlaps, no horizontally clipped labels and no horizontal overflow. Rendered straight paths had zero detached endpoints. No amplitude reduction was needed after these checks.
- Research selection held Road Networks at exactly `translate(7.7696424103965676 4.126917728389457)` across a five-second interval while neighbors moved. Dragging completed without a detached edge, clipping or collision. After both pointer and focus left a node, its offset resumed changing; the existing eased release is unchanged. Leaving the pointer over it correctly continues stabilization even when keyboard focus moves elsewhere.
- No independent wobble/curve/elastic treatment was added to edges. No synchronized direction, runtime randomness or carousel transform was introduced. Existing pointer response is unchanged; no conflict appeared during the selection/drag checks.
- D3 remains responsible only for equilibrium and normal drag physics. The existing capped 30-fps imperative loop and projection bridge remain; no frame cap increase, new per-frame React updates or permanent D3 simulation.
- Mobile Research at 390 × 844: idle phase `static`, Canvas `running=false`, `aria-busy=false`, no horizontal overflow. Native navigation and readable content remain.
- Reduced-motion/unresolved/mobile/hidden/offscreen policy tests pass unchanged. Actual OS reduced-motion switching remains outside this small tuning pass.
- Back to Research and Forward to Learning restored correct URLs, non-busy graphs, zero overlay opacity and one story trigger. Interrupting an active Research formation with About navigation left About usable with zero overlay opacity and no graph residue. Browser runtime-error logs were empty.

### 15–17. Regression, integrity and disposition

- `pnpm lint`: passed with no warnings. `pnpm typecheck`: passed. `pnpm test`: **32 passed**, zero failed/skipped. `pnpm build`: passed; all ten public routes statically generated.
- The expanded range test exposed an old test assumption that the first adapted node was the root. The test now uses the approved graph's explicit `rootId`. This was a fixture correction, not a production graph or motion change; the final suite passed.
- `node scripts/verify-public-routes.mjs http://localhost:3001`: all ten routes passed HTTP 200, one H1, exact approved prose and identity counts, and asset-free assertions; `/engineering` remained 404.
- Public-output scan: 226 files, 12 reviewed framework-only `credentials`/`freshnessPolicy` matches; no private-content match within the scan's scope.
- All eight public-export SHA-256 hashes matched before and after work. The unchanged exact hashes remain listed in the Phase 9.5 report. Graph remains **38 nodes / 50 relationships**. No approved content or dependency changes.
- Usage-limit recovery preserved code, checks and the running production server. Only the final mobile check and report were resumed; no reinstall, rollback or restart of completed implementation was required.
- No Phase 9.6 blocker remains. Warnings are limited to the observation scope above and the intentionally deferred broad device/assistive-technology QA. Phase 10 was not started. Nothing was deployed.

PHASE 9.6: PASS — LIVING MOTION RETUNED
