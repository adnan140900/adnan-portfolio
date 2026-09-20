import type { GraphDocument } from "../graph/types";
import type { StoryMoment } from "../motion/story-scenes";

export type Composition = "open" | "atlas" | "distributed" | "convergent" | "wide" | "split";
export interface FilmScene {
  id: string; title: string; copy: string; term: string; topicId: string;
  composition: Composition; displayStatus?: string; href?: string;
}

// Editorial associations authorized by the focus-film brief, not exported semantic mappings.
const focusTopics = [
  ["focus-flood-research", "research-flood-accessibility", "open"],
  ["focus-computational-engineering", "method-geospatial-analysis", "atlas"],
  ["focus-ai-workflows", "topic-ai-technology", "distributed"],
  ["focus-communication-practice", "practice-public-speaking", "convergent"],
] as const;

export function relatedTerm(graph: GraphDocument, id: string, exclude: string, index = 0) {
  const edges = [...graph.edges.filter(edge => edge.source === id), ...graph.edges.filter(edge => edge.target === id)];
  const candidates = [...new Set(edges.flatMap(edge => [edge.source, edge.target]))]
    .filter(candidate => candidate !== id)
    .map(candidate => graph.nodes.find(node => node.id === candidate))
    .filter(node => node?.kind !== "person")
    .map(node => node?.label)
    .filter((label): label is string => !!label && label !== exclude);
  return candidates[index % candidates.length] ?? "";
}

export function createFocusFilm(focus: { id: string; text: string; displayStatus: string }[], graph: GraphDocument): FilmScene[] {
  return focus.map(item => {
    const association = focusTopics.find(([id]) => id === item.id);
    if (!association) throw new Error(`Missing editorial focus identity: ${item.id}`);
    const node = graph.nodes.find(node => node.id === association[1]);
    if (!node) throw new Error("Focus topic is not in the public graph");
    return { id: item.id, title: node.label, copy: item.text, topicId: node.id, composition: association[2], term: relatedTerm(graph, node.id, node.label), href: node.route };
  });
}

const compositions: Record<string, Composition[]> = {
  "/research": ["atlas"],
  "/research/flood-accessibility": ["open", "wide", "atlas", "split", "distributed", "convergent", "atlas", "wide"],
  "/projects": ["open", "distributed"],
  "/projects/nothipotro": ["open", "convergent"],
  "/projects/knowledge-workflows": ["atlas", "distributed"],
  "/ai": ["distributed", "split", "wide", "atlas"],
  "/leadership": ["convergent", "open", "split"],
  "/learning": ["atlas", "distributed", "open", "wide"],
};

export function createRouteFilm(moments: StoryMoment[], path: string, graph: GraphDocument): FilmScene[] {
  const grammar = compositions[path] ?? ["open"];
  const sameStatus = new Set(moments.map(moment => moment.displayStatus)).size === 1;
  return moments.map((moment, index) => ({
    id: moment.id ?? `${moment.nodeId}-${index}`, title: moment.title, copy: moment.copy,
    topicId: moment.nodeId, href: moment.href, composition: grammar[index % grammar.length],
    term: relatedTerm(graph, graph.nodes.find(node => node.label === moment.title)?.id ?? moment.nodeId, moment.title, index),
    displayStatus: sameStatus || moments.slice(0, index).some(previous => previous.displayStatus === moment.displayStatus) ? undefined : moment.displayStatus,
  }));
}

export function activeFilmScene(time: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.floor(time + 0.2)));
}
