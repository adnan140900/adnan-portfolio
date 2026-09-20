/** URL policy, not semantic topology or content-to-node inference. */
export const publicRoutes = [
  { path: "/", nodeId: "person-adnan", viewId: "portfolio-universe" },
  { path: "/about", nodeId: "person-adnan", viewId: "portfolio-universe" },
  { path: "/research", nodeId: "topic-research", viewId: "world-topic-research" },
  { path: "/research/flood-accessibility", nodeId: "research-flood-accessibility", viewId: "world-research-flood-accessibility", parent: "/research" },
  { path: "/projects", nodeId: "topic-projects", viewId: "world-topic-projects" },
  { path: "/projects/nothipotro", nodeId: "project-nothipotro", viewId: "world-project-nothipotro", parent: "/projects" },
  { path: "/projects/knowledge-workflows", nodeId: "project-knowledge-workflows", viewId: "world-project-knowledge-workflows", parent: "/projects" },
  { path: "/ai", nodeId: "topic-ai-technology", viewId: "world-topic-ai-technology" },
  { path: "/leadership", nodeId: "topic-leadership", viewId: "world-topic-leadership" },
  { path: "/learning", nodeId: "topic-learning", viewId: "world-topic-learning" },
] as const;
export type PublicRoute = typeof publicRoutes[number]["path"];
export function getPublicRoute(path: PublicRoute) {
  const route = publicRoutes.find(route => route.path === path);
  if (!route) throw new Error(`Unknown public route: ${path}`);
  return route;
}
