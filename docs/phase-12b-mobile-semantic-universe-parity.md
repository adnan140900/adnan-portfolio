# Phase 12B — Mobile Semantic Universe Parity

Branch: `improvement-v2`  
Scope: local implementation and QA only; no merge and no deployment.

## 1. Unified graph architecture

Desktop and compact layouts now render one `KnowledgeGraph` SVG from the approved graph document. Both consume the same node IDs, directed edge IDs, labels, hierarchy, selection state, finite D3 settlement, and projection compositor. The visible compact grid and duplicate mobile depth SVG were removed.

The visual pipeline is:

`approved graph → finite canonical D3 settlement → viewport projection → story offset → idle offset → camera/frame`

## 2. Portrait projection algorithm

`graph-projection.ts` defines a deterministic `620 × 980` semantic frame. Canonical `1040 × 580` coordinates receive anisotropic scaling (`0.48` horizontally, `1.24` vertically), center translation, subpixel serialization, and bounded portrait clamping. The algorithm never reads or changes topology.

## 3. Mobile label policy

Root and primary labels remain visible. Deeper labels are lower-emphasis by default; depth-2 labels resolve for an active neighborhood and depth-3 labels remain visually suppressed on compact screens while retaining accessible relationship descriptions. Touch/focus restores active and neighboring labels.

## 4. Semantic idle parameters

Compact semantic idle runs at a maximum of 24 fps and uses 58% of wide-layout amplitude. It retains the existing independent deterministic periods, stabilizes held nodes, eases back after release, pauses while offscreen/hidden/forming, and never changes React state or D3 physics per frame.

## 5. Breathing and edge activity

The shared restrained node-breathing and sequential edge-life controller now operates on the compact SVG. Active relationships strengthen; context edges remain thin and geometric. Coarse pointers do not run proximity reads or parallax.

## 6. Touch interaction

Touch/pen pointer-down immediately previews a node and its incident edges. Routed nodes remain native links and navigate on the same tap. Non-routed buttons toggle semantic emphasis; selecting another node changes it, and tapping the SVG background clears it. Keyboard focus uses the same active/neighbor language.

## 7. Mobile-cinematic transition policy

Normal-motion compact profiles now select `mobile-cinematic`, distinct from wide `cinematic` and `reduced`. It keeps the semantic overlay and target formation, accelerates the sequence by 1.35×, and avoids the old compact fade-only path.

## 8. Branch-growth implementation

Direct compact homepage entry and routed target entry both use `createBranchGrowthPlan` over real approved edges. Formation proceeds anchor → edge draw → child → subsequent branches. Homepage formation exposes six real primary branches before idle begins. Reduced motion bypasses formation.

## 9. Homepage universe parity

The homepage compact view renders the same seven interactive primary nodes, 31 approved deeper nodes, and all 50 approved relationships represented by the primary and depth layers. Decode V2, ambient depth, knowledge field, entry formation, relationship life, and semantic idle remain active.

## 10. Current Focus persistent portrait stage

Panel-local diagrams were removed. Current Focus owns one sticky portrait semantic stage, one idle clock, and one scroll-progress owner. Its four scenes reframe real connected subsets and update emphasis while prose scrolls in normal document flow.

## 11. Subject-stage architecture

Research, Flood Accessibility, AI & Technology, Projects, Nothipotro, Knowledge Workflow Experiments, Leadership, and Learning now share the same persistent compact stage architecture. A single GSAP timeline per film publishes story offsets into the same SVG that owns idle motion.

## 12. Flood 7/8 preservation

Browser QA confirmed the Flood stage contains exactly seven semantic nodes and eight approved edges. Method, disruption/health, exposure, validation, and uncertainty remain graph data—not decorative replacements.

## 13. AI composition

The AI route retains AI & Technology, Hermes, Local AI, AI Agents, Research Workflows, Knowledge Management, and Local/Cloud trade-offs through the approved view and story emphasis model. Portrait projection changes only framing.

## 14. Projects composition

Projects retains its approved branching structure. Nothipotro preserves Audience-first Design and Student Learning Needs; Knowledge Workflow Experiments preserves Research Workflows and Knowledge Management.

## 15. Leadership and Learning

Existing route personalities remain intact: Leadership uses calmer bounded offsets and clearer hierarchy; Learning uses the more exploratory authored offset grammar. Both use the shared compact semantic renderer.

## 16. About

About continues to use the real identity projection—Adnan and the six approved themes—with a quieter identity personality. Biography copy stays in normal flow while its persistent semantic stages remain alive under normal motion.

## 17. Mobile ambient budget

Compact ambient Canvas uses 80–140 stars by viewport area, caps DPR at 1.25, runs at 24 fps normally, and uses the constrained ambient token on low-power profiles. Coarse pointers receive shallow deterministic drift instead of parallax. Reduced motion draws once.

## 18. Performance behavior

There is no permanent D3 simulation. D3 settles synchronously and stops; semantic motion is an imperative, capped SVG clock. Films use one ScrollTrigger owner, not one timeline per panel. Offscreen and hidden layers pause.

## 19. Constrained-device behavior

Constrained profiles reduce ambient count/cadence and knowledge-field cadence while retaining semantic nodes, core relationships, Decode V2, 24-fps-bounded basic graph idle, and essential scene emphasis.

## 20. Reduced motion

At compact and wide sizes, reduced motion shows the settled same-topology SVG, final decode text, draw-once Canvas, and normal navigation. It runs no graph idle and no branch-growth timeline.

## 21. Accessibility

The SVG uses native links/buttons inside the same semantic controls. Focus indication, `aria-pressed`, route descriptions, inspector relationship lists, and screen-reader directed relationship descriptions remain available. Geometry is never the sole relationship representation.

## 22. Desktop regression

Wide rendering retains the canonical frame, 30-fps semantic idle cap, desktop drag policy, seven primary controls, deeper universe layer, and Phase 12A visual language. Browser comparison at `1440 × 900` showed no overflow or framework overlay.

## 23. Viewport QA

Observed at `360 × 800`, `390 × 844`, and `430 × 932`:

- semantic SVG visible and old grid absent;
- no horizontal overflow;
- real nodes and edges present;
- idle transforms visibly changed over 4.2 seconds;
- touch-down emphasized the node and incident edge;
- a single Research tap navigated successfully;
- target policy reported `mobile-cinematic`;
- Current Focus used one persistent stage and one trigger;
- Flood used one sticky stage with 7 nodes/8 edges.

## 24. Perceptual / sequence QA

Real-time browser sequences were observed for homepage entry, settling into living idle, touch preview, Research navigation, Current Focus scrolling, Flood scene scrolling, AI, Projects, Nothipotro, Leadership, Learning, and About. Screenshots were inspected for the homepage, Current Focus, Flood, Research, and desktop baseline. No separate video artifact was retained.

## 25. Tests and build

Focused tests cover portrait determinism/bounds, unchanged IDs and directions, compact controller/idle policy, reduced behavior, no visible grid source, real-edge branch planning, public topology, lifecycle cleanup, and exact content counts. Final command results are recorded in the completion response.

## 26. Source integrity

No public JSON was modified. Content verification retains 38 nodes, 50 directed edges, ten approved routes, and all release-manifest SHA-256 hashes. `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` are unchanged; no dependencies were added.

## 27. Known visual issues

Very long deep-node labels remain intentionally selective at 360 px to prevent a hairball. During scroll interpolation, adjacent scene geometry can briefly coexist in the masked lower edge of the persistent stage; the gradient and text shadow keep prose readable without hiding semantic continuity.

## 28. Blockers for the next phase

No implementation blocker remains. Optional future work could add automated recorded interaction traces and device-farm measurements, but those are not required to preserve parity or topology.

PHASE 12B: PASS — MOBILE SEMANTIC UNIVERSE PARITY COMPLETE
