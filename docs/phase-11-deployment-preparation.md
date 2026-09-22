# Phase 11A — Production Deployment Preparation

Date: 2026-09-20

Frozen visual baseline: Phase 9AA

Prior acceptance: Phase 10 passed

Intended public origin: `https://adnan-sk.is-a.dev`

Phase 11A prepared the verified portfolio for a GitHub → Vercel → custom-domain workflow. It did not publish the site, configure DNS, create a remote repository, alter approved content or graph topology, add analytics, or redesign the interface.

## 1. Baseline verification

| Command | Result |
| --- | --- |
| `pnpm verify:content` | PASS — all eight approved hashes matched |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS — 54 passed, 0 failed, 0 skipped |
| `pnpm build` | PASS — all ten public routes prerendered |

The graph remains **38 nodes and 50 relationships**. No file in `content/public-export/` changed. The complete suite was run again after the metadata/origin changes with the same passing result.

## 2. About metadata correction

`/about` now supplies `About` to the existing root title template. Production output is:

`About · Adnan Sami Khan`

Only document metadata changed. The visible About heading, biography, introduction, and all approved prose remain unchanged.

## 3. Production-origin configuration

`src/lib/site-metadata.ts` now owns origin validation and reusable route metadata.

- Default origin: `https://adnan-sk.is-a.dev`
- Optional build-time override: `NEXT_PUBLIC_SITE_URL`
- Accepted value: an absolute HTTP(S) origin only
- Rejected: credentials, path, query, hash, or non-HTTP(S) scheme
- Localhost is not hard-coded into generated public metadata.

The override was exercised with `https://preview.example` and resolved correctly. The committed `.env.example` documents the public production value without containing a secret.

## 4. Metadata and canonical readiness

The root layout defines `metadataBase` using the validated origin. Every public route emits an explicit canonical path, resolved by Next.js against that base.

| Route | Canonical |
| --- | --- |
| `/` | `https://adnan-sk.is-a.dev` |
| `/about` | `https://adnan-sk.is-a.dev/about` |
| `/research` | `https://adnan-sk.is-a.dev/research` |
| `/research/flood-accessibility` | `https://adnan-sk.is-a.dev/research/flood-accessibility` |
| `/projects` | `https://adnan-sk.is-a.dev/projects` |
| `/projects/nothipotro` | `https://adnan-sk.is-a.dev/projects/nothipotro` |
| `/projects/knowledge-workflows` | `https://adnan-sk.is-a.dev/projects/knowledge-workflows` |
| `/ai` | `https://adnan-sk.is-a.dev/ai` |
| `/leadership` | `https://adnan-sk.is-a.dev/leadership` |
| `/learning` | `https://adnan-sk.is-a.dev/learning` |

No OpenGraph or Twitter image was invented. The release remains asset-free apart from its existing favicon.

## 5. `.gitignore` audit

Existing exclusions covered dependencies, Next.js output, compiled tests, environment files, debug logs, PEM files, Vercel local state, TypeScript build information, and `next-env.d.ts`.

The audit added explicit exclusions for:

- local `.pnpm-store/`
- Playwright/test reports and ad-hoc screenshots/videos
- cache, temp, editor, Windows, log, and WebM artifacts

`.env.example` is explicitly allowed. The approved `content/public-export/` directory remains included and versioned.

Verified ignored local material includes `node_modules/`, `.next/`, `.pnpm-store/`, `.test-dist/`, `.env.local`, `tsconfig.tsbuildinfo`, and `next-env.d.ts`.

## 6. Repository privacy audit

The repository tree was inspected before staging. Excluding generated/dependency directories, it contained no large binary, recorded QA video, screenshot, archive, unrelated personal file, private vault, approval record, owner-decision file, checkpoint, credential file, or environment-secret file.

A credential-pattern scan found no API key, access token, password assignment, GitHub token, OpenAI-style key, Slack token, Google key, or private-key block.

Privacy-term matches were reviewed contextually. They occur only in verification reports explaining that private material was not exposed and in the public-output scanner’s detection pattern. No private content, private path, secret, or private graph relation was found. The audit did not access an Obsidian vault or any location outside this project.

## 7. Git initialization result

Git was initialized in the existing project; the application was not regenerated.

- Repository: local `D:\Projects\adnan-portfolio`
- Primary branch: `main`
- Repository-local author: `Adnan Sami Khan <adnankhan140900@gmail.com>`

Recovery note: the first empty `.git` directory was created under the isolated workspace account, which made owner-context Git checks reject it as dubious ownership. The empty metadata was moved to a recoverable backup, Git was reinitialized under the owner account, the verified empty backup was removed, and the temporary exact-path `safe.directory` entry was removed. Git’s global/system ownership protection was not weakened or left bypassed.

## 8. Branch

The current and primary local branch is `main`.

## 9. Staged-file review

The complete staged inventory was reviewed before commit. It contains website source, approved public JSON, documentation, verification scripts, lockfile, package/workspace configuration, favicon, `.gitignore`, and `.env.example`.

It excludes generated builds, dependencies, local package cache, compiled test output, environment overrides, local logs, test/browser artifacts, and editor/OS temporary files. No ignored private/local artifact was force-added.

A second sensitive-string scan was performed against staged blobs. Matches in explanatory documentation/scanner patterns were reviewed in context; no secret or private-data finding was present.

## 10. First commit result

The first local commit was created with the message:

`Initial public portfolio release`

It represents the verified Phase 10 baseline plus the Phase 11A metadata/origin configuration, Git-safety exclusions, environment example, and this handoff report.

## 11. GitHub remote status

No GitHub remote was supplied or discovered. No remote was invented, no push occurred, and no external repository was created.

## 12. Required environment variables

**Required variables: none.**

| Variable | Required | Secret? | Default | Purpose |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | No | `https://adnan-sk.is-a.dev` | Override the metadata/canonical origin for another build target |

No secret runtime variable is required. Sensitive data must never be placed in a `NEXT_PUBLIC_*` value.

## 13. Vercel readiness

PASS.

- Next.js 16.3.4 is detected from `package.json`.
- The pinned package manager is `pnpm@11.19.0`.
- `pnpm build` is present and passes.
- The project builds with native Next.js behavior and all application routes prerender statically.
- No unnecessary `vercel.json` was added.
- No deployment credential or Vercel local state is committed.

Vercel should use its standard Next.js preset and repository-root defaults.

## 14. Approved content hashes

| File | SHA-256 |
| --- | --- |
| `ai.json` | `2debe89c32b7eb33ae8e8d65fc5752ae1870c5c41b84bd8967654dd270df5602` |
| `graph.json` | `36ad5eba997172b8fe174c1be808717a90a2e508a16c5551593d32c0a612b8c3` |
| `leadership.json` | `0954e882ddce91bd4c42fabde00db9b5c93ce417575974c32d1b8b0fd208fa18` |
| `learning.json` | `a1f2056dc4bac374016ce681488e779698479a18eea1b129ed6970a2da034051` |
| `manifest.json` | `9d189624aab8d19aa799067e4c0b9dc4e305af5c8ece229fd12ca226ee88c98c` |
| `profile.json` | `f12f53de06708280343713a0ed8d98dbe3b82ac913e90ee844a006b1a3aa6b50` |
| `projects.json` | `6b87b8522c874470bcaa683693f1dc5a760150037d50c67da269497f4a30257d` |
| `research.json` | `b59c1ea77a6a3e5f5bee4bfb929f6a93e32f39f999baf5fc936a280d014d3d2d` |

## 15. Final private-data scan

Production output and repository/staged content were scanned for the Phase 11A terms, including `APP-`, `owner-`, `whole-graph`, `freshness`, `not_granted`, `omit_initial_release`, `held_from_initial_export`, Obsidian/vault names, `hgfs`, `/mnt/`, OAuth, credentials, API keys, tokens, and private provenance.

Framework identifiers, audit/scanner documentation, and the site-origin validator’s explicit rejection of URL credentials were the only contextual matches. No true private-data or secret finding exists. The two intentionally omitted private relationships remain absent from the public graph and output.

## 16. Blockers

There is no repository, build, content-integrity, metadata, Vercel-detection, security, or privacy blocker.

The absence of a user-supplied GitHub remote intentionally blocks only the push/deployment step. Phase 11A stops locally as required.

## 17. Exact next action required from the owner

Create or select the public GitHub repository, then supply its exact clone URL. After that, run (or authorize) only these commands with the supplied URL:

```bash
git remote add origin <EXACT_GITHUB_REPOSITORY_URL>
git push -u origin main
```

Then import that repository into Vercel using the standard Next.js preset. The optional `NEXT_PUBLIC_SITE_URL` may be set to `https://adnan-sk.is-a.dev`; omitting it produces the same final origin. Configure the custom domain and DNS only in the separate, explicitly authorized deployment phase.

PHASE 11A: PASS — REPOSITORY READY FOR PUBLIC DEPLOYMENT
