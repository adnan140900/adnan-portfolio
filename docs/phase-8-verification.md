# Phase 8 verification — approved public content and semantic graph

## Scope and authority

The eight files in `content/public-export/` are the only content authority. All eight handoff SHA-256 hashes matched before editing application code and again after the interrupted session resumed. `scripts/verify-public-content.mjs` records the exact handoff hashes and fails closed before development, build, and production startup.

The source JSON was never rewritten, normalized, copied into a second content fixture, or enriched. No private knowledge source, approval material, provenance, source map, or unrelated directory was inspected. No external asset lookup, deployment, or export pipeline was performed.

Manifest: schema `1.0.0`, release `public-export-v1-2026-09-11-r1`, asset policy `asset-free`, seven payload files (excluding the manifest itself), 38 nodes and 50 edges.

## Integration result

- The existing graph engine now receives all 38 approved nodes and 50 directed relationships. Labels/summaries remain exact. Category/depth/importance/status are retained; importance drives visual weight, depth drives presentation roles, and status is visible in content/inspection.
- Graph views are outgoing projections of actual relationships. Their union covers every approved node and edge. No prose-based edges or section mappings are manufactured.
- Knowledge Workflow Experiments retains two separate `explores` branches. There is no Research Workflows → Knowledge Management edge and no Hermes ↔ Local AI edge.
- Engineering stays an unrouted theme/bridge with inspectable relationships; `/engineering` returns 404.
- The obsolete runtime placeholder JSON was removed. Synthetic domain-test fixtures remain test-only.
- No dependencies were added, removed, reinstalled, or downgraded. The lockfile and dependency-build policy are unchanged. `package.json` changes only add the hash verification script and its startup/build hooks.

## Code/file manifest

Created:

- `scripts/verify-public-content.mjs`
- `scripts/verify-public-routes.mjs`
- `scripts/scan-public-output.mjs`
- `src/lib/public-content/schema.ts`
- `src/lib/public-content/bundle.ts`
- `src/lib/public-content/routes.ts`
- `src/lib/public-content/graph-adapter.ts`
- `src/lib/public-content/story-adapter.ts`
- `src/lib/public-content/page-data.ts`
- `src/components/public-world-page.tsx`
- `src/app/about/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/projects/nothipotro/page.tsx`
- `src/app/projects/knowledge-workflows/page.tsx`
- `src/app/ai/page.tsx`
- `src/app/leadership/page.tsx`
- `src/app/learning/page.tsx`
- `src/tests/public-fixture.ts`
- `docs/phase-8-verification.md`

Changed:

- `README.md`, `package.json`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/app/research/page.tsx`, `src/app/research/flood-accessibility/page.tsx`
- `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`
- `src/lib/graph/portfolio-graph.ts`
- `src/features/graph/types.ts`, `src/features/graph/components/knowledge-graph.tsx`
- `src/features/graph/physics/graph-geometry.ts`
- `src/features/motion/story-scenes.ts`, `src/features/motion/scroll-scene.tsx`
- `src/features/motion/story-diagram.tsx`, `src/features/motion/motion.css`
- `src/features/transitions/cluster-return-link.tsx`
- `src/features/transitions/portfolio-transition-provider.tsx`
- `src/features/transitions/transition-policy.ts`
- `src/tests/graph-domain.test.ts`

Removed: `src/data/graph/portfolio-graph.json`, the obsolete placeholder runtime fixture. The approved release files remain intact. This directory has no Git metadata, so the manifest is not a Git-generated diff and no Git-based restore is available here.

## Architecture and claim boundaries

The server-only bundle loader is the only raw JSON import boundary. Strict explicit schemas infer TypeScript contracts, reject unknown fields and unsupported versions, validate manifest and references, and report field-path errors. URL configuration is separate from semantic topology. Only render data, not the manifest, is passed to client components.

The existing React/D3/SVG/Canvas/GSAP owners remain intact. Cluster and subject entry reuse the guarded transition provider and graph-derived branch planner. Direct URLs/refresh/history bypass route-intro animation. The source/overlay/target handoff and latest-navigation cancellation are retained.

Flood now uses seven actual graph nodes and eight approved prose sections: Question, Motivation, Method, Data and assumptions, Exploratory work, Limitations, Validation, Uncertainty. The old fabricated road interruption/alternate-path/Next Steps fixture is gone. Because sections do not contain explicit graph mappings, they retain their item's Flood anchor. No inferred section-specific semantic emphasis claims are made.

Research remains exploratory/computational with validation limits stated. Nothipotro remains developing and experimental; Knowledge Workflow Experiments remains a personal experiment. Hermes is described as an existing tool. Leadership includes the MUN simulated-setting context before its historical conference claims, the current club Sergeant-at-Arms role, and exact Special Mention wording. Learning stays interests/practices, not an expertise résumé.

All ten requested routes are integrated. Homepage/about use the approved profile and contact set. Metadata contains only approved profile/item/graph text; no image metadata is invented. No content assets were added. Existing scaffold favicon is unchanged; no image/video content elements occur on public routes.

## Checks and observations

- TypeScript validation, lint, and the existing tests passed during integration. The final suite includes 26 tests: original state/physics/motion policies plus manifest validation, topology identity, unsupported/unknown data rejection, route projections, explicit mappings, forbidden-edge regression checks, exact scene prose/status, and stable initial SVG serialization.
- The first production build passed and prerendered all ten public routes. Final post-fix build results are recorded below.
- `verify-public-routes.mjs` passed for every public route: HTTP 200, exactly one H1, expected approved prose in server HTML (excluding script contents), no placeholder content, no image/video elements. `/engineering` returned 404.
- Browser-tested direct routes, Research → Flood, Flood → Research, Universe → Projects, Projects → Nothipotro, native Enter activation, Back/Forward, and completed transitions returning to idle with one route ScrollTrigger and no visible overlay.
- Mobile at 390 × 844: all ten routes had no horizontal overflow. Flood's graph and inspector now occupy separate normal-flow regions; all eight story sections remain available. Temporary viewport override was reset.
- Reduced-motion code and policy tests retain static geometry, no mobile D3, no camera/parallax/drift, and complete content/navigation. Actual OS preference emulation is not available through this preview controller; real-device/assistive-technology acceptance is not claimed.
- The 60-node geometry fixture remains deterministic (approximately 18 ms cold / 12 ms warm in one local sample). This phase did not perform full Phase 10 performance/device QA.

## Interrupted-session recovery and fitting fixes

The session resumed in place. No dependency repair or source normalization was required. Hashes were rechecked. The running development server was reused.

The resumed log revealed one server/browser hydration mismatch caused by a final binary digit in trigonometric SVG seed geometry on Learning. Initial coordinates are now rounded to four decimals, with a regression test. D3 runtime coordinates remain unquantized. Learning was reopened with no subsequent browser error logs in that check.

Long approved copy required a mobile normal-flow graph/inspector adjustment. Cinematic desktop landing now positions the graph below the persistent context navigation so the selected star and growing branches remain visible. These are integration-fitting changes, not a new aesthetic direction.

The development server reported a slow-filesystem warning and first-route compile delays. Routes served successfully after compilation. No permissions or dependency-build policy was bypassed.

## Public-output leak scan

The first production scan inspected 221 source/generated files, excluding source maps, tests, and outside directories. Twelve matches were reviewed: standard Fetch/React `credentials` or `use-credentials`, and Next router `freshnessPolicy`. These are framework identifiers, not secrets or content-control fields. No true private/control content was found. The final rebuilt-output result is recorded below.

The scan is scoped to application source and available generated route/client output, not a claim about uninspected private files or a full security audit. It intentionally does not inspect any private source.

## Warnings and next phase

- No Git repository is present, so no Git diff or commit was possible.
- OS motion switching, screen-reader announcements, and broad hardware/browser coverage remain manual/later-phase acceptance work.
- Section-level graph mappings were not supplied; no such mappings have been guessed. More granular semantic choreography needs a separately approved content release.
- Phase 9 should review typography, long-label spacing, content pacing, and contrast with this unchanged release. Do not add claims, edges, assets, deployment, or a private export integration as visual polish.

Phase 9, Phase 10, and deployment were not started.

## Final production gates

- `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed; all 26 tests passed with zero failures.
- `pnpm build` completed successfully and statically prerendered all ten public routes. `pnpm start` is serving the production preview on port 3000.
- The final route/prose check passed for all ten routes (HTTP 200, one H1, approved prose, no placeholder or image/video content); `/engineering` returned 404.
- The rebuilt-output leak scan inspected 221 files and returned the same 12 harmless framework identifier matches described above. No true private/control content was found.
- The final hash verification passed for all eight approved files. The lockfile and workspace dependency-build policy remain unchanged; no abandoned `tsx`, `esbuild`, or added testing dependencies remain.
- Rapid project-entry navigation interrupted by Universe returned to `/` with no overlay, no busy state, and one route ScrollTrigger.
- The final production Learning route and homepage loaded successfully; the final browser error log was empty. Restarting the server left an old preview tab displaying its cached connection-error page, so a fresh preview tab was opened against the running production server.
- No unresolved Phase 8 implementation blockers remain. The manual acceptance limits listed above still apply.
