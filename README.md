# Adnan — Interactive Knowledge Universe

Phase 11A prepares the verified Phase 9AA release for GitHub and native Next.js deployment on Vercel without publishing it. The application now emits route-specific canonical URLs from a validated production origin, and the About document title is non-duplicative. See the [deployment-preparation report](docs/phase-11-deployment-preparation.md).

Phase 9AA replaces the remaining Home/About meshes with small labeled semantic projections and introduces a shared geometric decode signature. All 38 nodes, 50 relationships, ten routes, eight immutable content files, and existing formation/privacy boundaries remain intact. No image assets, dependencies, or deployment were added. See the [Phase 9AA report](docs/phase-9aa-semantic-projections-and-glyph-decode.md), [Phase 9Z report](docs/phase-9z-living-semantic-universe.md), and preceding [Phase 9Y report](docs/phase-9y-semantic-constellation-rebuild.md).

The [storyboard](docs/phase-9x-storyboard.md) and [Phase 9X implementation report](docs/phase-9x-cinematic-rebuild.md) document the preceding baseline. Phase 9Y supersedes their separate public-world decorative graph and large foreground-title travel. Earlier phase reports are historical records.

See [Phase 8 verification](docs/phase-8-verification.md) for the file manifest, validation results, limitations, and recovery notes. The [Phase 5 visual direction](docs/phase-5-visual-direction.md) remains applicable. Earlier verification documents describe historical fixtures, not the current public content.

See [Phase 9 verification](docs/phase-9-verification.md) for the visual audit, refinement manifest, practical QA, and remaining Phase 10 acceptance work.

See [Phase 9.5 verification](docs/phase-9-5-verification.md) for idle-motion ownership, the complete identity occurrence inventory, regression results, and limitations.

Phase 9.6 retunes only idle ranges and settling speed; see [Phase 9.6 verification](docs/phase-9-6-verification.md) for final values and motion observations.

Phase 9.7 adds the kinetic editorial layer without retuning semantic idle. See [Phase 9.7 verification](docs/phase-9-7-verification.md) for its implementation, observations, checks, and remaining manual acceptance scope.

## Cinematic narrative system

`src/features/narrative/` owns presentation independently of D3 and route travel:

- `film-model.ts` converts already-approved story moments/focus statements into scene identities and route-specific compositions. Background terms are exact connected public labels, excluding the foreground heading and identity node. These are editorial associations, not new semantic mappings.
- `narrative-film.tsx` renders one semantic copy of each heading and paragraph, native progress anchors, route links, and approved semantic geometry. It waits for resolved motion preference and yields during route transitions.
- `semantic-stage-model.ts` defines presentation-only Flood emphasis and route movement personalities. `semantic-stage-controller.ts` publishes GSAP offsets through the same projection bridge as the idle clock; D3 remains the public-world base-geometry owner. Public world routes render their canonical `KnowledgeGraph` once inside this stage. The former `film-geometry.tsx`, arbitrary point morphs, and decorative camera model are removed.
- `semantic-projection-model.ts` derives Home focus subsets by approved edge traversal and category filtering (7/8/7/6 nodes). About biography projects the person and six actual themes. `semantic-projection.tsx` renders one persistent desktop union with only the current subset visible, exact wrapped labels, and an accessible directed-relationship list per scene. The projection controller publishes stable authored equilibrium offsets through the existing bridge and reuses `useSemanticIdle`; no second physics engine or permanent animation clock was added. Compact/reduced views use static per-scene semantic SVGs.
- `film-controller.ts` owns scoped GSAP/ScrollTrigger scrubbing, point interpolation, camera transforms, type masks, semantic progress, keyboard seeking, hash entry, visibility pause, and cleanup. No React updates or layout reads occur per animation frame.
- `narrative.css` defines six composition variants. Desktop uses CSS sticky, not pin spacers or body locks. Mobile/coarse/short viewports use normal-flow scenes; reduced motion keeps the new static compositions without cinematic timelines.

The home sequence is Flood Accessibility → Geospatial Analysis → AI & Technology → Public Speaking. The exact four approved focus statements remain unchanged. “Current focus” appears once as the sequence entrance; repetitive focus status chrome is omitted without changing source data. Flood retains seven view nodes/eight real edges and all eight approved sections. Spatial arrangement and dashed emphasis are explicitly visual metaphors, not geographic or scientific results.

The semantic stage evolves by continuous bounded offsets, incident-edge emphasis and conditional dashed treatment. Idle offsets continue when scrolling stops. Foreground titles rise at most 18px and body copy 12px, independently of the graph; background words retain larger 120–240px masked travel. Reverse scrolling uses the same timeline. Subject breadcrumbs stay in normal flow so they cannot cover film progress.

## Retained kinetic knowledge system

`src/features/kinetic/` retains the headline and ambient/interaction vocabulary independently of graph physics and route transitions:

- `kinetic-model.ts`: deterministic character/word timing, route personalities, adapter-only vocabulary, bounded outgoing-neighbor previews, and eight abstract Flood presentation states.
- `decode-model.ts`, `decode-controller.ts`, `decode-text.tsx`, `decode.css`: deterministic system/editorial resolve modes. One shared GSAP ticker permits at most two entry/scene resolves at once, with glyph writes capped at 12 fps. Fixed final-width character cells preserve layout, final accessible text never mutates, and the visual copy is aria-hidden. Entries play once per route/key/client lifetime; Back does not replay. Intersection/scene gates prevent offscreen panels consuming their animation. Route unmount, document hiding and compact/reduced preference changes cancel to final text. The older `kinetic-text.tsx` remains a retained, unused reveal primitive.
- `decode-config.ts` centralizes four Unicode system marks, two sparse editorial marks, six original 24-unit SVG paths, the orbit terminator, stage policy and timings. System resolves in 1.3s, editorial in 1.65s, the first Home entrance in 1.95s, followed by a 0.14s terminator hold. Editorial substitutions are capped at three. Background vocabulary shares the same deterministic staged Unicode policy. `scripts/preview-decode-glyphs.mjs` serves a local-only font proof on 127.0.0.1:3002 after `pnpm test`; it is not a public app route.
- `knowledge-field.tsx`: one persistent pool of 11 spans (up to eight ambient fragments plus three interaction previews). Small vocabularies use fewer slots; About uses three ambient fragments. One RAF clock caps DOM writes at 12 fps and uses the shared pure decode model. One slot, every other cycle, can stage an actual approved source → growing line → relationship → target trace. Labels and directed edges come only from the client-safe `portfolioGraph` adapter, never prose or raw exports.
- `kinetic.css`: restrained layered text, 48-second diffuse light drift, small arrow response, and static mobile/reduced-motion fallbacks.

The obsolete editorial controller and Flood metaphor renderer were removed, along with `ScrollScene`, its controller, and its diagram renderer. Historical pure story contracts remain for public adapters and tests. During a film the ambient word pool is suppressed and paused; scene-owned vocabulary participates directly in scroll choreography instead of competing as wallpaper.

Hover/focus reads only explicit `data-control-node` / `data-story-node` identities and approved graph edges. Three reachable outgoing labels can anticipate a world; only real incident edges are emphasized. No prose-to-relationship inference occurs. Existing star stabilization and guarded branch formation retain ownership.

Mobile/coarse-pointer contexts receive three static field fragments outside films; no typing or hover previews. Reduced motion gets complete headline/prose immediately, static scene typography, no film timeline, and existing static graph geometry. Visibility handlers pause field/GSAP work and cancel headline synthesis; listeners, observers, RAFs, contexts and temporary presentation attributes are disposed on route/preference changes or unmount. A desktop film has one ScrollTrigger; mobile has one per scene. No dependencies, assets, routes or public-content changes were introduced.

## Living semantic idle

`semantic-idle-model.ts` derives bounded paths from public node IDs. The root/actual view anchor uses a 0.65-unit horizontal radius and 65–87 second period. Themes are heavy: 7–10 units over 38–48 seconds. Universe depth-2 nodes use 14–17 units over 20–27 seconds; depth-3 uses 17–20 units over 17–24 seconds. Subject concepts use 12–16 units over 20–30 seconds. Vertical radii remain 45–70% of horizontal radii. Independent phases and a two-active-second settling envelope avoid synchronized orbiting or random wandering.

`use-semantic-idle.ts` owns one capped 30-fps imperative clock per visible desktop graph. It publishes an independent offset map to `story-projection.ts`, which composes D3 equilibrium + story offset + idle offset for both nodes and straight edge endpoints. No per-frame React state or permanent D3 simulation is used. Formation suspends idle; an eased settling envelope introduces it afterward. Hover, focus, selection and dragging freeze the current offset; release eases speed back up. Dragging subtracts visual and grab offsets before updating D3.

Hidden/offscreen clocks stop and resume without wall-clock catch-up. Mobile/coarse-pointer, unresolved preference and reduced motion use static positions. D3 pauses on document hiding without rebuilding its equilibrium when the tab returns. Existing pointer response and Canvas budgets remain restrained; About combines a calm, labeled person/theme projection with the decorative Canvas star field.

The full name is retained once in the homepage identity composition and in approved prose. Header/footer use the approved root label; About uses an About heading. Each focus sequence has one entrance heading and topic-specific scene titles. The unchanged root summary remains accessible in a native Profile disclosure inside the collapsed constellation inspector. Metadata retains the full identity for document context.

## Visual presentation

`features/motion/visual-refinement.css` is the isolated Phase 9 presentation layer. Local system serif display typography contrasts with sans-serif reading text and monospaced metadata; no font assets or remote font requests were added. Desktop separates graph, reading, and annotation regions. Short desktop screens use an unpinned annotation band, and mobile retains normal-flow controls and reading. Primary navigation marks the current page or parent location through a small client component receiving server-approved labels.

Canvas uses a shared decorative seed across routes, up to 900 mostly far-depth stars, independent twinkle frequencies, 24-fps desktop drawing, bounded pixel ratio, and gentle pointer parallax. Mobile, low-power, unresolved-preference, and reduced-motion ambience is static; hidden/offscreen drawing pauses. Decorative points have no semantic IDs, links, or graph membership.

`scheduleBranchGrowth` adds parent-formation dependencies to the existing graph-derived plan: branch, star, then outgoing branches, with cross-links settling last. D3 retains final geometry and now reserves conservative wrapped-label clearance. Pointer dragging uses the SVG screen matrix so narrower editorial graph regions remain accurate. Route cancellation and cleanup retain their existing owner.

## Run locally

The existing dependencies are retained: Next.js 16.3.4, React 19.2.8, TypeScript, Tailwind CSS 4, D3-force, and GSAP. No dependency was added or downgraded. Use the repository's pnpm version and dependency-build policy.

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Keep the server running. Stop an existing development/production server before starting another on the same port.

### Production origin

Metadata defaults to the intended public origin, `https://adnan.is-a.dev`, and emits an exact canonical URL for every public route. A deployment may override the origin at build time with the optional public variable shown in `.env.example`:

```bash
NEXT_PUBLIC_SITE_URL=https://adnan.is-a.dev
```

The value must be an absolute HTTP(S) origin with no credentials, path, query, or hash. It is public metadata—not a secret. No other runtime or build-time environment variable is required.

Vercel can use native Next.js detection with the repository's existing `pnpm build` command. No `vercel.json` is required. Deployment and custom-domain configuration are intentionally outside this repository-preparation phase.

```bash
pnpm verify:content
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

Development, build, and production startup first check all eight release-file SHA-256 hashes. A mismatch fails closed. Tests compile TypeScript and use Node's built-in runner, without tsx/esbuild or an additional testing framework.

With a server running:

```bash
node scripts/verify-public-routes.mjs
node scripts/scan-public-output.mjs
```

The route check compares actual server-rendered prose with the source bundle and checks every public route. Review leak-scan matches in context: framework identifiers such as Fetch `credentials` and Next `freshnessPolicy` are not private content.

## Content authority and integrity

`content/public-export/` is the sole public-content authority. Its eight JSON files are immutable release artifacts:

- `manifest.json`
- `profile.json`
- `graph.json`
- `research.json`
- `projects.json`
- `ai.json`
- `leadership.json`
- `learning.json`

No private knowledge source is connected. No missing prose, detailed roadmap, research findings, graph relationships, or content-to-node mappings are invented. There is no content-export pipeline in this application.

The server-only `bundle.ts` is the sole raw JSON import boundary. `schema.ts` defines strict runtime schemas with inferred TypeScript types and field-path errors. It validates the schema/release version, asset policy, seven manifest payload entries (the manifest does not list itself), graph counts, uniqueness, endpoints, root themes, contact protocols, and explicit content mappings. Unknown fields are rejected.

Only approved page/view data crosses the React client boundary. No release manifest or extra source metadata is added to route metadata. Titles and descriptions use the public profile, graph, or content items. No OpenGraph imagery or new assets are generated.

## Folder structure

```text
content/public-export/              Immutable eight-file approved release
scripts/
  verify-public-content.mjs         Byte-level integrity gate
  verify-public-routes.mjs          HTTP/rendered-prose and asset checks
  scan-public-output.mjs            Scoped public-output inspection, excluding source maps
src/
  app/                             Ten explicit Server Component routes, layout, CSS
  components/
    public-world-page.tsx           Shared route composition
    layout/                        Public navigation, identity, contact links
  lib/
    public-content/
      schema.ts                    Strict schemas and public TypeScript contracts
      bundle.ts                    Server-only raw-import/validation boundary
      routes.ts                    Explicit URL policy, not semantic topology
      graph-adapter.ts             Approved graph to existing engine/view contracts
      story-adapter.ts             Exact prose to reusable scroll moments
      page-data.ts                 Server route/content composition
    graph/                         Existing engine parser and adapted graph entry
  features/
    graph/                         Semantic controls, state, D3 and projection bridge
    atmosphere/                    Decorative Canvas, density and frame budgets
    motion/                        Retained story contracts, semantic idle and motion policies
    narrative/                     Scene models, persistent film, SVG geometry, controller, CSS
    kinetic/                       Headline synthesis and public-vocabulary field
    transitions/                   Persistent guarded GSAP navigation and branch planner
  hooks/                           Reduced-motion detection
  tests/                           Domain, integration, motion-policy and geometry tests
```

## Graph and route model

The source graph has **38 nodes and 50 directed edges**, rooted at `person-adnan`. Labels, summaries, categories, depths, importance, display status, edge IDs, endpoints, and relationship wording are retained.

The adapter translates `relationship` to the existing engine's `relation` field. It derives visual weight from approved importance and node kind from depth/route role. Parent context comes from real `includes`/`has-theme` edges. It does not convert prose into edges.

Universe keeps the root and six themes as its seven primary navigation/physics nodes. The homepage additionally projects all 31 approved deeper nodes as a noninteractive background layer, with their 44 approved relationships. Reachability determines candidate regions; the actual public category chooses between reachable themes. A local best-candidate layout reserves label footprints. Level-2 stars use 2.6-unit radii and 0.78 opacity; level-3 uses 1.85-unit radii and 0.60 opacity. Labels remain subordinate (0.67/0.50). Full semantic inspection remains in the theme views. Theme hover/focus reveals the entire outgoing reachable neighborhood, including shared concepts, while unrelated groups retain 0.65 of their normal presence.

`features/graph/universe-depth.ts` owns region placement; `components/universe-depth-layer.tsx` renders it behind the primary ring. The projection bridge combines background bases, D3 positions, story offsets and independent idle offsets so straight endpoints stay attached. Root-to-theme edges use 0.76 opacity, theme-to-major-child edges 0.51, and tertiary/cross-links 0.36. Widths are 0.90/0.70/0.60, without glow. Mobile uses a static, unlabelled background behind seven accessible controls; reduced/offscreen/hidden/transition states retain their pause policy.

The first meaningful universe visit overlaps a 1.95-second `CONNECTING IDEAS` system resolve with the independent editorial headline and existing graph emergence. Routed H1s and selected scene headings use at most three sparse serif glyph substitutions, not terminal typography. Body prose, contact details, navigation, metadata and ordinary node labels never decode. Leadership limits scene-heading resolves to its first scene; About biography keeps its quiet headings. Existing masks, slight title rise/exit and larger background-word movement retain separate transform ownership.

Cluster/subject views still traverse outgoing approved relationships and contain only existing edges whose endpoints are in the view. The union of the views covers all 38 nodes and all 50 edges; the full graph is not forced into a crowded mobile control list.

| Route | Content |
| --- | --- |
| `/` | Approved name, headline, introduction, themes, supporting line and current focus |
| `/about` | Approved biography, current focus, public links |
| `/research` | Research index and Flood summary |
| `/research/flood-accessibility` | Approved Flood narrative |
| `/projects` | Project summaries and subject links |
| `/projects/nothipotro` | Developing student-focused project |
| `/projects/knowledge-workflows` | Personal workflow experiment |
| `/ai` | Approved AI-tool experiments and distinctions |
| `/leadership` | Toastmasters and MUN contexts, exact roles and historical participation |
| `/learning` | Learning interests and practices, not an expertise résumé |

Engineering remains an unrouted semantic theme/bridge with inspectable approved connections. `/engineering` returns 404. No command-search system existed, so no new one was introduced.

Relationship language is available in the node's Connections disclosure, retaining source → relationship → target order. Proposed/checking relationships use restrained dashed geometry. No permanent edge labels or flowchart connectors were added.

## Storytelling and ownership

- React/Next: semantic routes, state, native controls, focus and scene identity.
- D3: stable base geometry and desktop drag physics.
- SVG/DOM: meaningful nodes and geometric relationships.
- Canvas: decorative atmosphere, never semantic filler.
- GSAP: guarded route travel, graph-derived branch growth, scroll presentation.
- CSS: restrained core breathing and presentation.

Nested transform owners remain separate: camera → pointer → D3 base group → story-position group → scene wrapper → route control → star core. The projection bridge combines visual offsets with D3 coordinates and keeps endpoints attached without mutating D3 nodes. Initial SVG coordinates are rounded to four decimal places to avoid server/browser trigonometric serialization mismatches; runtime physics is not quantized.

`NarrativeFilm` receives approved scenes, a client-safe graph and a semantic graph child from its Server Component parent. Page components do not create timelines. Its route-scoped controller performs boundary-only progress/focus updates and batched SVG writes. D3 positions are never rewritten by GSAP: the shared bridge composes visual offsets. SSR contains readable normal-flow content; enhancement starts only after motion preference resolves.

Flood now has seven approved graph nodes and eight prose scenes:

question → motivation → method → data/assumptions → exploratory work → limitations → validation → uncertainty.

The release has no section-level graph mappings. Sections retain their explicitly mapped item's anchor. Phase 9Y explicitly authorizes a separate presentation association: Method emphasizes the two engineering methods; Motivation the health/disruption concepts; assumptions exposure; Validation the validation/uncertainty node; Uncertainty bounded divergence. These explicit stage choices never mutate section mappings or graph edges. Dashed/receding structures are visual metaphors, not measured confidence or research findings.

Nothipotro remains developing; Knowledge Workflow Experiments remains a personal experiment. Hermes remains an existing tool. Leadership retains MUN simulation context, historical participation, current club role, and the exact Special Mention wording.

## Navigation, accessibility and mobile

Normal URLs and native links remain the authority. Direct URLs, refresh, and history bypass route-intro animation. Selecting a routed star uses the existing enterCluster/enterSubject state machine and graph-derived branch sequence. Return controls use the same provider. Stage dimensions are prepared before branch entry and stay stable while the scroll controller is suspended. Source/overlay/destination visibility handoff and latest-navigation-wins cancellation are preserved.

Long approved introductions use normal document flow. Cinematic desktop entry positions the destination graph within the viewport; direct/mobile entry starts with readable content. No scroll locking or forced route changes are used.

Mobile uses a cinematic vertical sequence, semantic progress, compact canonical controls, and data-derived SVG compositions, with no D3 controller or pinned camera. Focus panels start at 85svh and grow for longer prose. Their title alignment, graph placement, and reading regions vary; paragraphs remain visible. All ten public routes were checked at 390 × 844 for horizontal overflow.

Reduced motion keeps static geometry, full prose, native navigation and focus/opacity changes, without drift/parallax or large camera motion. The preference remains unresolved until detection, so motion does not start speculatively. OS preference switching and full assistive-technology/device acceptance remain manual checks beyond the available preview controls.

## Phase boundary

No deployment, new image/video/map/PDF assets, external asset lookup, or export pipeline was performed. Phase 9X changed no dependency manifests or lockfile. The production preview used for verification is available at [localhost:3001](http://localhost:3001) while its server is running (`pnpm start --port 3001`).

Phase 10 should begin with real-device/browser and assistive-technology acceptance, live reduced-motion preference switching, and performance profiling. Phase 9 practical checks are not a broad certification. Phase 10 and deployment have not been started; do not proceed automatically.
