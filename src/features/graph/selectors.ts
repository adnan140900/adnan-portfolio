import type { GraphDocument, GraphEdge, GraphNode, GraphViewId } from "./types";

export function getGraphView(graph: GraphDocument, viewId: GraphViewId) {
  const view = graph.views.find((candidate) => candidate.id === viewId);
  if (!view) throw new Error(`Graph view "${viewId}" does not exist.`);
  return view;
}

export function getViewNodes(graph: GraphDocument, viewId: GraphViewId): GraphNode[] {
  const view = getGraphView(graph, viewId);
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  return view.nodeIds.map((nodeId) => nodesById.get(nodeId)).filter(Boolean) as GraphNode[];
}

export function getViewEdges(graph: GraphDocument, viewId: GraphViewId): GraphEdge[] {
  const view = getGraphView(graph, viewId);
  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  return view.edgeIds.map((edgeId) => edgesById.get(edgeId)).filter(Boolean) as GraphEdge[];
}
