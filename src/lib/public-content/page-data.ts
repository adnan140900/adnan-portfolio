import "server-only";
import { publicContent } from "./bundle";
import { getPublicRoute, type PublicRoute } from "./routes";
import { portfolioGraph } from "../graph/portfolio-graph";
import { createPublicStory } from "./story-adapter";
import type { PublicItem } from "./schema";
import type { StoryMoment } from "../../features/motion/story-scenes";

export function getPublicPage(path: Exclude<PublicRoute, "/" | "/about">) {
  const route = getPublicRoute(path);
  const node = portfolioGraph.nodes.find(node => node.id === route.nodeId)!;
  const view = portfolioGraph.views.find(view => view.id === route.viewId)!;
  const section = path.split("/")[1] as "research" | "projects" | "ai" | "leadership" | "learning";
  const collection = publicContent[section];
  const parentPath = "parent" in route ? route.parent : undefined;
  const items: PublicItem[] = parentPath ? collection.items.filter(item => item.graphNodeId === node.id) : collection.items;
  if (!items.length) throw new Error(`No approved content for ${path}`);
  const isIndex = path === "/research" || path === "/projects";
  const overview = (item: PublicItem): StoryMoment => ({
    id: item.id, nodeId: item.graphNodeId, title: item.title, copy: item.summary, displayStatus: item.displayStatus,
    href: isIndex ? portfolioGraph.nodes.find(node => node.id === item.graphNodeId)?.route : undefined,
    supportingNodeIds: portfolioGraph.edges.filter(edge => view.edgeIds.includes(edge.id) && edge.source === item.graphNodeId).map(edge => edge.target),
  });
  const moments = isIndex ? items.map(overview) : items.flatMap(item => [
    ...(items.length > 1 ? [overview(item)] : []), ...createPublicStory([item], portfolioGraph, view),
  ]);
  return {
    path, route, node, view, moments,
    title: parentPath || items.length === 1 && !isIndex ? items[0].title : node.label,
    summary: parentPath || items.length === 1 && !isIndex ? items[0].summary : node.summary,
    status: parentPath ? items[0].displayStatus : node.displayStatus,
    parent: parentPath ? { path: parentPath, node: portfolioGraph.nodes.find(node => node.id === getPublicRoute(parentPath).nodeId)! } : undefined,
  };
}
