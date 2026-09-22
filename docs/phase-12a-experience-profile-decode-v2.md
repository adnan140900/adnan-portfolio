# Phase 12A — Experience Profile + Decode V2

Date: 2026-09-21  
Branch: `improvement-v2`  
Scope: experience-policy foundation and Decode V2 only. No mobile graph rebuild, merge, deployment, or production modification was performed.

## Branch safety

The required branch did not exist. It was created from the current production `main` baseline before source changes. All Phase 12A work remains in the `improvement-v2` working tree. `main` was not modified or merged.

The Phase 12 V2 audit remains at `docs/phase-12-v2-experience-audit.md` and is the architecture authority for this implementation.

## ExperienceProfile implementation

`src/features/experience/experience-profile.ts` defines independent runtime dimensions:

```ts
type ExperienceProfile = {
  motionPreference: "unresolved" | "full" | "reduced";
  viewport: "compact" | "wide";
  pointer: "coarse" | "fine";
  performance: "normal" | "constrained";
  visibility: "visible" | "hidden";
};
```

`ExperienceProfileProvider` owns the media-query, hardware-budget, and document-visibility listeners once at the application root. The server and first hydrated render use an unresolved profile with readable final content and neutral/static geometry. Kinetic systems start only after the provider resolves normal motion; reduced motion stays static.

The old `usePrefersReducedMotion` hook is retained only as a compatibility adapter over the centralized profile. It no longer registers an independent media-query listener.

## Compact/reduced conflations removed

- **Decode:** compact viewport and coarse pointer no longer settle text immediately. Decode consumes motion preference, visibility, viewport timing, and played state independently.
- **Decode CSS:** only the actual `prefers-reduced-motion: reduce` query forces final visual copy. Compact/coarse media queries no longer hide glyphs or the terminator.
- **Ambient Canvas:** normal-motion compact devices animate at a 24 fps target. Compact controls density and DPR; constrained performance lowers density and cadence to 12 fps; reduced motion alone disables animation.
- **Knowledge field:** compact mode now runs the living field with CSS-selected lower density. Performance controls cadence. Reduced/unresolved/hidden state controls whether it is quiet.
- **Constellation ambient motion:** the motion clock no longer requires a desktop/fine-pointer query. Coarse pointer disables pointer proximity only, not breathing or ambient edge activity.
- **Graph runtime policy:** motion preference, viewport renderer support, and pointer dragging are explicit independent decisions.
- **Semantic idle:** the pure policy receives motion preference and renderer readiness separately. Compact renderer readiness is a Phase 12B concern, not an alias for reduced motion.
- **Route transitions:** reduced/unresolved preference selects the reduced mode; viewport independently selects current wide or compact composition. Coarse pointer does not select reduced mode.
- **Narrative film:** the film receives only the actual motion preference as its reduced flag. Compact GSAP composition remains animated.
- **Semantic projection:** mobile is no longer passed as `reduced=true`. Its current panel-local renderer is explicitly marked as not idle-capable until Phase 12B.

## Remaining mobile-specific gates reserved for Phase 12B

These gates are intentionally retained because removing them requires the prohibited mobile graph/narrative rebuild:

- The visible compact graph is still the existing mobile grid; the SVG force renderer remains the wide-layout renderer.
- D3 controller creation and semantic idle projection remain gated by current renderer readiness (`viewport === "wide"`). This is not a motion-preference decision.
- Panel-local compact semantic projections remain static while the compact film titles and geometry retain their existing GSAP motion.
- Compact route entry retains the existing short animated transition rather than wide branch-growth choreography.
- `film-controller.ts` and semantic-stage CSS retain compact/coarse composition queries. They choose layout and scroll choreography, not reduced-motion behavior.
- `kinetic.css` retains selective compact slot hiding as a density budget; the remaining slots continue to animate.

Phase 12B must replace the mobile grid with the portrait projection, provide one persistent compact semantic stage, and enable compact real-edge formation. No attempt was made to partially implement those systems here.

## Decode V2

### Timing and cadence

| Tier | Wide total | Compact total | Target |
| --- | ---: | ---: | --- |
| System | 0.60s | 0.552s | 0.45–0.80s |
| Editorial | 0.80s | 0.736s | 0.60–1.00s |
| Major | 1.05s | 0.966s | ≤1.20s |

Each total includes the 0.07s final terminator hold. The existing shared GSAP ticker now paints at approximately 24 Hz and still owns at most two jobs. No per-character loop and no per-frame React state were introduced.

### Candidate density and stages

- System selects approximately 70% of eligible alphanumeric cells.
- Editorial selects approximately 48%, bounded to 4–8 candidates where the title length permits.
- Major selects approximately 68%, bounded to 8–14 candidates where the title length permits.
- Acquire holds the selected field through 12% progress.
- Reconstruction resolves staggered chunks from 12–45%.
- Semantic lock reduces the active set through 45–72%; text is substantially readable by the midpoint.
- Tail reaches at most two unresolved cells around 78%.
- Final exact copy is established at 88%, leaving the short terminator hold.

Whitespace and punctuation never enter the candidate set. Body copy is not decoded.

### Deterministic per-cell sequencing

Candidate order, resolution order, glyph sequence, and custom-mark selection use stable hashes of the approved text, tier, replay/route key, and character index. Each unresolved cell advances through up to four deterministic substitutions at its own two-to-four-frame cadence. Frame progression now visibly changes glyph states, but the same inputs at the same frame always return the same output.

The exact source string always wins at completion or cancellation.

### Custom glyph budget

- Wide system decode: at most four simultaneous custom SVG marks.
- Compact system decode: at most two simultaneous custom SVG marks.
- Editorial decode: at most two custom marks at either width.
- Remaining active candidates use the existing Unicode geometric pool.

The geometric/archaic six-mark identity and signature terminator were preserved.

### Mobile decode behavior

Normal-motion mobile runs the same Decode V2 model and shared scheduler. It uses the compact duration factor and two-mark cap, but preserves the same accessible final string, fixed cells, glyph language, and deterministic reconstruction.

At 390px, live QA confirmed system, editorial, and major entrances were active. The editorial Research capture reported two active custom marks and settled to the exact `Research` string.

### Reduced motion, hidden state, and cancellation

- Reduced motion renders exact final copy immediately at compact and wide widths.
- Unresolved preference renders final content while waiting; it does not start kinetic work.
- Document visibility is part of the shared profile. Hiding the document cancels decode and restores final copy.
- Route cancellation, component teardown, preemption, and leaving an active film panel synchronously settle the exact string and release ticker ownership.
- Completed replay keys do not restart on rerender.

## Scheduler and policy drift

The two-job foreground scheduler remains authoritative. A third simultaneous request settles immediately without creating another ticker job. The controller clears glyph state, blur, opacity, and intermediate text synchronously on completion.

`src/features/kinetic/kinetic-text.tsx` had no consumers and maintained an obsolete independent compact/reduced policy. It was removed. `DecodeText`, `decode-model`, and `decode-controller` are now the single decode implementation.

## Accessibility and layout stability

- Server output and the first hydrated render contain readable final copy.
- One screen-reader string contains the exact approved source text.
- Every intermediate visual glyph and SVG mark remains `aria-hidden`.
- Fixed character cells and word wrappers preserve width and wrapping; every tested intermediate frame has the exact final character count.
- Punctuation and whitespace remain unchanged.
- Reduced motion has no glyph cycling, terminator animation, or intermediate visual copy.

## Tests

The focused Node/TypeScript suite increased from 54 to 57 tests. New and updated coverage proves:

- Compact/coarse normal-motion profiles can decode.
- Coarse pointer does not imply reduced motion.
- Reduced, unresolved, hidden, and already-played entrances settle.
- Experience dimensions remain independent.
- Decode density, deterministic frame progression, midpoint readability, two-cell tail, exact final copy, and constant character count.
- System/editorial/major duration bounds and compact timing.
- Wide/compact custom SVG caps.
- Scheduler two-job cap, synchronous cancellation, cleanup, and replay protection.
- Mobile ambient motion remains active within compact and constrained budgets.
- Graph renderer readiness, pointer dragging, transitions, and motion preference are separate policies.

## Visual observations

Live browser captures were inspected at normal speed:

- Desktop system mid-decode: dense system activity was visible without changing surrounding layout.
- Desktop major mid-decode: the homepage headline reconstructed across multiple simultaneous cells and remained recognizable during the sequence.
- Desktop editorial mid-decode: the Research title used controlled serif-preserving substitutions.
- 390px mobile system/major mid-decode: both jobs were active rather than immediately settled.
- 390px mobile editorial mid-decode: exactly two custom marks were active.
- 390px mobile final: exact `Research` copy, stable layout, and functional content/navigation.

The new effect is more active and finishes materially faster. No Next.js error overlay, browser warning, or console error was observed on `/` or `/research`.

## Content integrity and regression

- `pnpm verify:content`: PASS; all eight approved file hashes match.
- Approved graph: unchanged at 38 nodes and 50 directed relationships.
- Public JSON files: unchanged.
- Routes: all ten approved public routes remain intact; production build prerendered all route pages.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, 57/57.
- `pnpm build`: PASS with Next.js 16.3.4; 13 static pages generated including the not-found route.
- Browser runtime: PASS on `/` and `/research`, desktop and 390px compact viewport.
- `git diff --check`: PASS.
- Dependencies and lockfile: unchanged.

## Phase 12B blockers and handoff

The policy foundation is ready. Phase 12B must supply the missing renderer capabilities before compact devices can receive complete graph/narrative parity:

1. One responsive semantic SVG instead of the visible mobile grid.
2. Canonical-to-portrait graph projection with boundary and label policy.
3. Compact D3 settlement handoff and semantic idle offsets on the portrait SVG.
4. Persistent portrait Current Focus and subject stages instead of panel-local static copies.
5. Touch emphasis connected to real nodes and incident edges.
6. Mobile-cinematic branch formation using real-edge growth plans.

No Phase 12B work was started.

## Result

**PHASE 12A: PASS — EXPERIENCE PROFILE AND DECODE V2 COMPLETE**
