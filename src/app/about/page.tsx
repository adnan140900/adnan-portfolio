import Link from "next/link";
import { publicContent } from "@/lib/public-content/bundle";
import { AmbientStarfield } from "@/features/atmosphere/ambient-starfield";
import { portfolioGraph } from "@/lib/graph/portfolio-graph";
import { NarrativeFilm } from "@/features/narrative/narrative-film";
import { createFocusFilm, relatedTerm, type FilmScene } from "@/features/narrative/film-model";
import { createPageMetadata } from "@/lib/site-metadata";
const profile = publicContent.profile;
export const metadata = createPageMetadata("About", profile.introduction.text, "/about");
export default function AboutPage() {
  const identities = ["theme-civil-environmental-engineering", "topic-research", "practice-public-speaking"];
  const biography: FilmScene[] = profile.biography.flatMap(block => block.text.split("\n\n").map((copy, index) => {
    const node = portfolioGraph.nodes.find(node => node.id === identities[index])!;
    return { id: `${block.id}-${index}`, title: node.label, copy, topicId: node.id, term: relatedTerm(portfolioGraph, node.id, node.label), composition: index === 1 ? "atlas" : "convergent" };
  }));
  return <main id="main-content" className="identity-page narrative-page flex-1">
    <Link href="/" className="constellation-return-link">← Universe</Link>
    <div className="about-universe" aria-hidden="true"><AmbientStarfield seed="shared-public-universe" /></div>
    <header className="world-intro identity-intro"><h1>About</h1><p>{profile.introduction.text}</p></header>
    <NarrativeFilm id="identity" scenes={biography} graph={portfolioGraph} kind="identity" label="Identity and directions" />
    <header className="film-entrance"><h2>Current focus</h2></header>
    <NarrativeFilm id="about-focus" scenes={createFocusFilm(profile.currentFocus, portfolioGraph)} graph={portfolioGraph} kind="focus" label="Current directions" />
    <nav aria-label="Public contact links">{profile.links.map(link => <a key={link.url} href={link.url}>{link.label} <span aria-hidden="true">↗</span></a>)}</nav>
  </main>;
}
