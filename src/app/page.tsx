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
    <div className="discovery-hero" data-hero-stage="pending">
    <div className="home-universe-frame">
    <KnowledgeGraph key="portfolio-universe" graph={portfolioGraph} initialViewId="portfolio-universe" routePath="/" />
    <header className="constellation-page-copy public-world-copy">
      <h1 data-home-copy="headline"><DecodeText text={profile.headline.text} replayKey="home-headline" presentation="typewriter" heroStage={1} /></h1>
      <p data-home-copy="support"><DecodeText text={profile.homeIntroduction.text} replayKey="home-support" heroStage={2} /></p>
      <p className="home-universe-cta" data-home-copy="cta"><DecodeText text={profile.homeCta.text} replayKey="home-cta" heroStage={3} /></p>
    </header>
    </div>
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
