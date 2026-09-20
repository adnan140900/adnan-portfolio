import { KnowledgeGraph } from "@/features/graph/components/knowledge-graph";
import { NarrativeFilm } from "@/features/narrative/narrative-film";
import { createRouteFilm } from "@/features/narrative/film-model";
import { ClusterReturnLink } from "@/features/transitions/cluster-return-link";
import { SubjectContextNav } from "@/features/transitions/subject-context-nav";
import { portfolioGraph } from "@/lib/graph/portfolio-graph";
import { getPublicPage } from "@/lib/public-content/page-data";
import type { PublicRoute } from "@/lib/public-content/routes";
import { DecodeText } from "@/features/kinetic/decode-text";

export function PublicWorldPage({ path }: { path: Exclude<PublicRoute, "/" | "/about"> }) {
  const page = getPublicPage(path);
  const scenes = createRouteFilm(page.moments, path, portfolioGraph);
  return <main id="main-content" data-world={path} className={`constellation-page public-world narrative-page page-enter flex-1 ${page.parent ? "subject-world" : ""}`}>
    {page.parent && <SubjectContextNav subjectId={page.node.id} label={page.node.label} parentHref={page.parent.path} parentLabel={page.parent.node.label} />}
    <header className="world-intro">
      <h1><DecodeText text={page.title} replayKey="world-title" /></h1>
      <p>{page.summary}</p>
      {!page.parent && <ClusterReturnLink nodeId={page.node.id} label={page.node.label} className="constellation-return-link" />}
    </header>
    <NarrativeFilm id={`film-${page.node.id}`} scenes={scenes} graph={portfolioGraph} viewId={page.view.id} kind={path === "/research/flood-accessibility" ? "flood" : path.split("/")[1]} label={`${page.title} narrative`}>
      <KnowledgeGraph key={page.view.id} graph={portfolioGraph} initialViewId={page.view.id} routePath={path} />
    </NarrativeFilm>
  </main>;
}
