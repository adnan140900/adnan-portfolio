"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { usePortfolioTransition } from "../transitions/portfolio-transition-provider";
import type { GraphDocument } from "../graph/types";
import type { FilmScene } from "./film-model";
import { SemanticProjection } from "./semantic-projection";
import { semanticProjection } from "./semantic-projection-model";
import { registerFilm } from "./film-controller";
import { DecodeText } from "../kinetic/decode-text";

export function NarrativeFilm({ id, scenes, graph, kind = "world", label = "Explore the narrative", children }: {
  id: string; scenes: FilmScene[]; graph: GraphDocument; viewId?: string; kind?: string; label?: string; children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { isTransitioning } = usePortfolioTransition();
  useEffect(() => {
    if (!root.current || reduced === null || isTransitioning) return;
    return registerFilm(root.current, scenes, reduced, graph);
  }, [scenes, reduced, isTransitioning, graph]);
  if (!scenes.length) return null;
  return <div ref={root} id={id} className={`narrative-film semantic-film${children ? "" : " projection-film"}`} data-film-kind={kind} data-film-reduced={reduced !== false} style={{ "--film-scenes": scenes.length } as CSSProperties}>
    <div className="film-stage">
      <nav className="film-progress" aria-label={label}><ol>{scenes.map((scene, index) => <li key={scene.id}>
        <a href={`#${id}-${scene.id}`} data-film-seek={index}><span aria-hidden="true" className="film-progress-dot" />{scene.title}</a>
      </li>)}</ol><div className="film-progress-track" aria-hidden="true" /></nav>
      <div className="semantic-stage">{children ?? <SemanticProjection graph={graph} scenes={scenes} identity={kind === "identity"} />}</div>
      <div className="film-panels">{scenes.map((scene, index) => <section id={`${id}-${scene.id}`} key={scene.id} data-film-panel data-composition={scene.composition} data-story-node={scene.topicId} aria-labelledby={`${id}-${scene.id}-heading`}>
        <span className="film-term" data-film-term aria-hidden="true"><DecodeText text={scene.term} mode="editorial" replayKey={`${scene.id}-term`} decorative /></span>
        <h2 id={`${id}-${scene.id}-heading`} data-film-title>{kind === "leadership" && index > 0 || kind === "identity" ? scene.title : <DecodeText text={scene.title} replayKey={scene.id} />}</h2>
        {!children && <><SemanticProjection graph={graph} scenes={[scene]} identity={kind === "identity"} mobile /><ul className="sr-only" aria-label="Projected public relationships">{semanticProjection(graph, scene.topicId, kind === "identity").edges.map(edge => <li key={edge.id}>{graph.nodes.find(node => node.id === edge.source)?.label} → {edge.relation} → {graph.nodes.find(node => node.id === edge.target)?.label}</li>)}</ul></>}
        <div className="film-copy" data-film-copy>
          {scene.displayStatus && <p className="film-status">{scene.displayStatus.replaceAll("-", " ")}</p>}
          <p>{scene.copy}</p>
          {scene.href && <Link href={scene.href} className="film-subject-link">Explore <span className="sr-only">{scene.title}</span><span aria-hidden="true">↗</span></Link>}
        </div>
        <span className="film-mobile-step" aria-hidden="true">{String(index + 1).padStart(2, "0")} <span /> {String(scenes.length).padStart(2, "0")}</span>
      </section>)}</div>
      <p className="film-geometry-caption">{kind === "flood" ? "Public relationships · visual metaphor, not geographic data" : "Public relationships · spatial composition"}</p>
    </div>
  </div>;
}
