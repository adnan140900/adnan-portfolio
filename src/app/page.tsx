import { KnowledgeGraph } from "@/features/graph/components/knowledge-graph";
import { portfolioGraph } from "@/lib/graph/portfolio-graph";
import { NarrativeFilm } from "@/features/narrative/narrative-film";
import { createFocusFilm } from "@/features/narrative/film-model";
import { publicContent } from "@/lib/public-content/bundle";
import Link from "next/link";
import { DecodeText } from "@/features/kinetic/decode-text";
const profile = publicContent.profile;
export default function HomePage() {
  const scenes = createFocusFilm(profile.currentFocus, portfolioGraph);
  return <main id="main-content" className="constellation-page public-world home-world narrative-page page-enter flex-1">
    <div className="discovery-hero">
    <DecodeText text="CONNECTING IDEAS" mode="system" replayKey="universe-awakening" signal />
    <header className="constellation-page-copy public-world-copy">
      <p className="eyebrow">{profile.name}</p>
      <h1><DecodeText text={profile.headline.text} replayKey="home-headline" /></h1>
      <p>{profile.introduction.text}</p>
      <Link href="/about" className="constellation-return-link">About ↗</Link>
    </header>
    <KnowledgeGraph key="portfolio-universe" graph={portfolioGraph} initialViewId="portfolio-universe" routePath="/" />
    </div>
    <header className="film-entrance">
      <h2>Current focus</h2>
      <p className="film-themes">{profile.themes.map(theme => theme.text).join(" ")}</p>
      <p>{profile.supportingLine.text}</p>
    </header>
    <NarrativeFilm id="current-focus" scenes={scenes} graph={portfolioGraph} kind="focus" label="Current directions" />
    <div className="film-exit"><Link href="#main-content">Return to the universe ↗</Link></div>
  </main>;
}
