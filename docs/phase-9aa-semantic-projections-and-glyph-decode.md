# Phase 9AA — Semantic projections and signature decode

## 1. Decorative meshes replaced

Removed `film-geometry.tsx` and the arbitrary `filmPoint`, `filmCamera`, and full-graph fallback model. Home focus and About no longer render unlabeled, decorative 38-node meshes. Canvas decorative stars remain atmospheric points, not semantic relationships. Public-world KnowledgeGraph stages are preserved.

## 2. Home projection architecture

`semantic-projection-model.ts` follows real edges from the approved scene topic, filtering by public categories and bounding traversal to eight nodes. Identity mode follows only the person's actual `has-theme` edges. Traversal can follow an incoming edge for context; it does not reverse or invent the stored relationship. Every rendered edge is the original graph object, and accessible descriptions retain source → relation → target order.

One persistent desktop SVG contains the union of selected scene IDs. The active scene reveals only its subset. Stable authored coordinates are presentation geometry, not claims about geography or scientific outcomes. Scroll offsets and idle offsets compose through the existing projection bridge. Public-world D3 ownership is unchanged.

## 3. Current Focus subsets

| Scene | Real nodes | Real edges |
| --- | --- | --- |
| Flood | Flood Accessibility; Road Networks; Road Disruption and Restoration; Access to Critical Health Services; Flood Exposure Scenarios; Validation and Uncertainty; Geospatial Analysis | 8 |
| Computational/geospatial | Geospatial Analysis; Engineering; Python and Geospatial Learning; Road Networks; Civil & Environmental Engineering; Environmental Systems; Computational Civil Engineering; Learning | 7 |
| AI | AI & Technology; Hermes; Local AI; AI Agents; Research Workflows; Knowledge Management; Local and Cloud Trade-offs | 8 |
| Communication | Public Speaking; Leadership; Toastmasters; Model United Nations; Structured Feedback; MUN Policy Preparation and Negotiation | 7 |

Node counts are 7/8/7/6. Computational context includes the actual intermediate Engineering and Learning nodes, rather than inventing shortcuts among the requested examples. No prose-derived connections are added.

## 4. About

Biography projects Adnan centrally with Research, Engineering, AI & Technology, Projects, Leadership and Learning: seven nodes, six `has-theme` edges. Biography remains the reading layer. About retains its separate approved focus sequence, also using semantic subsets. Identity headings stay quiet; background vocabulary may decode occasionally.

## 5. Motion and hierarchy

Reuses `useSemanticIdle`, including deterministic phases, bounded amplitude, settling, offscreen/hidden pause, and static compact/reduced policy. One visible desktop projection has one capped 30-fps clock. No running D3 simulation or React frame loop was added. SVG node and edge endpoints use the same base + story + idle coordinates. Anchors use opacity 1/radius 5, immediate neighbors 0.78/3.4, context 0.54/2.4; anchor-incident edges use 0.58 and cross/context links 0.28, with thin straight 0.8-unit strokes and no glow. Projection handoffs complete at scene boundaries, avoiding faint outgoing-node residue when a scene is selected.

## 6. Timing

Central timings: system 1.3s, editorial 1.65s, major first Home entrance 1.95s; cursor hold 0.14s. Final characters arrive by 91% of the resolve duration. Navigation and graph emergence do not wait for typography.

## 7. System mode

More heavily symbolic than editorial, using a curated geometric pool and sparse original SVG substitutions. Deterministic stage changes replace frame-by-frame symbol churn. Existing scheduler capacity remains two concurrent jobs and at most 12 writes per second.

## 8. Editorial mode

Retains the current serif. At most three character cells substitute a smaller geometric mark. Stages progressively reduce the unresolved set to one and then none. Blur-to-sharp is reduced to a maximum 0.7px, and opacity resolves from 0.78 to 1. Existing masks and independent small title motion remain. Body prose never decodes. Fixed final character cells prevent layout shifts.

## 9. Unicode pool

System: △ ▽ ◇ ⊙. Editorial: ◇ △. Deliberately excluded more exotic mathematical/alchemical-looking candidates and the old terminal alphabet. The shared ambient vocabulary uses this same pool.

## 10. Original SVG system

Six original paths in `decode-config.ts`: split triangle, open diamond, offset orbit, branch index, three-station orbit, paired arc. Each uses a 24-unit box, thin square-ended strokes, currentColor and no fills. `decode-glyph.tsx` renders them inline; no image assets or fonts are downloaded.

## 11. Selection rationale

Simple constructed geometry suggests instrument/diagram notation without claiming historical, cultural, religious or semantic meaning. Custom SVG paths avoid font fallback for the distinctive marks. The four common Unicode shapes are monochrome and baseline-compatible in the tested production fallback stacks. A local proof script reads the central compiled config, so its marks cannot drift from the application.

## 12. Cursor

The offset-orbit mark replaces the rectangular cursor. Editorial uses a smaller terminator than system text. It appears only during the bounded resolve/hold and disappears on completion or cancellation. No permanent blink.

## 13. Home initialization

Original leading mark + `CONNECTING IDEAS`, with the major-duration resolve overlapping the independent headline and existing universe appearance. No loader, navigation lock or added page delay. The signal disappears after completion and is suppressed on compact/reduced layouts.

## 14. Cluster entry

Existing approved route labels retain independent editorial entry resolves. Transition overlay uses centralized editorial timing and existing cancellation ownership. Graph branch formation does not own the typography clock.

## 15. Subject entry

Flood, Nothipotro and Knowledge Workflow Experiments use the same restrained signature in existing H1/selected scene entrances. Subject topology, branch planning and persistent stages are unchanged. Flood remains seven actual nodes and eight approved relationships.

## 16. Background vocabulary

The retained eleven-slot field uses staged geometric Unicode resolution through the shared model. It remains aria-hidden, low emphasis and paused during film scenes. Large film-owned terms now use the sparse editorial mode (at most three substitutions), avoiding a row of large symbols. They remain actual connected labels. No additional ambient scheduler was added.

## 17. Relationship traces

Retained rare source → line → exact relation → target traces. Their temporary letter substitutions use the centralized glyph pool. No extra custom punctuation was added here: the optional embellishment would compete with already-small relationship wording. Exact resolved relation text and direction are preserved.

## 18. Redundancy

Connected background terms still exclude the visible heading and person identity. Projection labels name real nodes; they are not oversized ghost-title copies. Accessible headings retain one stable final string; all mutated visual copies are hidden from assistive technology.

## 19. Mobile

Per-scene static SVGs retain real nodes/edges and wrapped labels with enlarged mobile label sizing. The hidden persistent desktop SVG does not run while offscreen. Existing compact decode policy skips animation entirely, satisfying the fewer-events requirement without introducing a new mobile effect. Reading and links remain normal flow.

## 20. Reduced motion

Final typography is immediate; CSS hides glyph/cursor layers and the initialization signal. Static meaningful per-scene projections replace sticky desktop presentation. Existing hook/controller policy prevents idle and film timelines. Automated reduced-policy/lifecycle tests exercise this path; live OS preference switching is a separate manual acceptance limitation, not claimed as performed here.

## 21. Accessibility

Stable final heading strings remain accessible. All glyph SVGs and animated duplicates are aria-hidden/focusable=false. Semantic projection edges have screen-reader-only exact directed descriptions per scene. Existing native navigation, progress anchors, skip link, route controls, keyboard seeking and focus protections remain. No per-character announcements or decorative focus targets.

## 22. Performance

No new dependency, permanent global RAF, image, font asset or React animation loop. The projection reuses the existing bounded visible-only idle owner. Decode reuses the shared bounded GSAP ticker and cancels synchronously. Compact copies have no animation. The proof server is a manually started localhost-only QA utility, not part of the public app.

## 23. Visual/perceptual QA

Production Chromium captures inspected: first/settled Universe, system/editorial mid-resolve, all four Home focus scenes, and About biography. Exact active node counts were additionally read from rendered SVGs. The first preview prompted two corrections: cap editorial substitutions at three, and finish node fades at each scene's resting point. Labels and thin attached lines make the focus diagrams recognizable as concepts rather than arbitrary meshes. Idle offsets changed while scroll remained fixed. About keyboard progress showed a visible focus outline and its person/theme scene.

The separate glyph proof was inspected at desktop and 390×844 mobile dimensions in the production font stacks, at small and display sizes: no tofu, emoji colors or disruptive baselines were observed. This is Chromium/local-font QA, not cross-device font certification. Screenshots were inspected in the task; no video recording was created.

Research entry was observed during anchor/branch travel. Research → Flood retained seven rendered physics nodes and eight edges. AI, direct-linked Nothipotro and Learning entry captures showed independent serif resolve and the existing semantic stage. Back/Forward restored Flood without replaying typography. Interrupting Universe → Research with Back returned cleanly to Learning: `aria-busy=false`, no cinematic-transition attribute, and zero active decodes. Browser console inspection returned no errors or warnings in this run.

Mobile About and Home Flood focus were inspected at 390×844: no horizontal document overflow, enlarged wrapped projection labels, all projection idle owners static, and zero active decodes. Desktop About progress was activated with Enter and kept a visible focus outline. Existing reduced-motion policy and lifecycle tests pass; live preference switching is not claimed. No recorded video or physical-device/assistive-technology session was performed.

## 24. Automated verification

54 tests pass. Coverage adds bounded connected focus subsets, required computational nodes, exact Flood 7/8 preservation, About 7/6, deterministic geometry/labels, original glyph count/cursor membership, terminal-alphabet exclusion, and monotonic staged resolution. Existing topology, idle, transition, reduced lifecycle, adapter and source tests remain. TypeScript and production build passed. Final verification summary follows below.

## 25. Source integrity

All eight release SHA-256 hashes match the existing approval gate; approved prose remains exact. Graph stays 38 nodes/50 edges. All ten HTTP routes pass expected-prose verification, and `/engineering` remains 404. Scoped leak scan: 251 files, 12 reviewed framework-only matches (`credentials` and `freshnessPolicy`), no private-content finding. Dependency files match the retained baseline exactly:

```text
package.json        44C2F8C2B6B6BEDFF2EB0E53459BB0D9BA6B3738691710D4D4C849BC4AABC26D
pnpm-lock.yaml      FAA0F74926D5FC9928F154B8AB86A5EC705DE410248851B34412A2831D6166A3
pnpm-workspace.yaml 57864D9FDAF79EDBA655B7B38C0D0F6716903CF6049144304E83422483376DB2
```

## 26. Warnings

This workspace has no `.git` metadata, so a Git diff cannot be reported. Source/dependency integrity is verified by the existing hash gate and retained baseline. No private vault was accessed. Practical browser checks are not full device, assistive-technology or performance certification. Live reduced-motion preference switching was not available through the browser test API.

## 27. Blockers / scope

No implementation blocker remains in the exercised paths. No Phase 10 work or deployment. Preview uses `pnpm start --port 3001` and is left running at http://localhost:3001/.

## Final verification and handoff

- `pnpm lint`: passed, no warnings.
- `pnpm typecheck`: passed.
- `pnpm test`: 54 passed, zero failed/skipped.
- `pnpm build`: passed; all ten public pages prerendered.
- `node scripts/verify-public-routes.mjs http://localhost:3001`: all ten public routes/prose checks passed; Engineering remains 404.
- `node scripts/scan-public-output.mjs`: 251 files scanned; 12 framework-only identifiers reviewed, no private-content finding.
- Content verification on final build/start: all eight hashes matched.
- Final production preview reloaded after restart; semantic projection and sparse large background decode re-inspected.

The interruption required no dependency repair, content recovery or project reconstruction. Existing changes were retained; the normal production preview was rebuilt/restarted. The local glyph-proof helper was stopped and its temporary browser tab closed after inspection. No packages or lockfile changes.

### File manifest

Created:

- `src/features/narrative/semantic-projection-model.ts`
- `src/features/narrative/semantic-projection.tsx`
- `src/features/narrative/semantic-projection-controller.ts`
- `src/features/narrative/semantic-projection.css`
- `src/features/kinetic/decode-config.ts`
- `src/features/kinetic/decode-glyph.tsx`
- `scripts/preview-decode-glyphs.mjs`
- This report.

Updated: README; global CSS imports; narrative film/model/controller; decode model/controller/component/CSS; transition provider's centralized decode duration; domain tests.

Removed the superseded `src/features/narrative/film-geometry.tsx` renderer and its arbitrary geometry/camera helpers. Its replacement is the tested semantic projection implementation; public graph/content files were not removed or changed.

PHASE 9AA: PASS — SEMANTIC PROJECTIONS AND SIGNATURE DECODE COMPLETE
