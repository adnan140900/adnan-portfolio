import type {
  GraphDocument,
  GraphEdge,
  GraphLevel,
  GraphNode,
  GraphNodeKind,
  GraphView,
} from "../../features/graph/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isGraphLevel(value: unknown): value is GraphLevel {
  return value === "universe" || value === "cluster" || value === "subject";
}

function isNodeKind(value: unknown): value is GraphNodeKind {
  return value === "person" || value === "cluster" || value === "subject" || value === "concept";
}

function isNode(value: unknown): value is GraphNode {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.label) &&
    isNodeKind(value.kind) &&
    isNonEmptyString(value.summary) &&
    (value.route === undefined || isNonEmptyString(value.route)) &&
    (value.parentId === undefined || isNonEmptyString(value.parentId)) &&
    typeof value.weight === "number" &&
    value.weight > 0
  );
}

function isEdge(value: unknown): value is GraphEdge {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.source) &&
    isNonEmptyString(value.target) &&
    isNonEmptyString(value.relation)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isView(value: unknown): value is GraphView {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.label) &&
    isGraphLevel(value.level) &&
    isNonEmptyString(value.rootNodeId) &&
    (value.parentNodeId === undefined || isNonEmptyString(value.parentNodeId)) &&
    isStringArray(value.nodeIds) &&
    isStringArray(value.edgeIds)
  );
}

function hasUniqueIds(items: Array<{ id: string }>) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

/**
 * Runtime boundary for local JSON and the future sanitized public export.
 * Invalid or dangling data fails during the build instead of reaching the UI.
 */
export function parseGraphDocument(value: unknown): GraphDocument {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.schemaVersion) ||
    (value.source !== "phase-2-placeholder" && value.source !== "sanitized-public-export") ||
    (value.exportedAt !== null && !isNonEmptyString(value.exportedAt)) ||
    !isNonEmptyString(value.entryViewId) ||
    !Array.isArray(value.nodes) ||
    !value.nodes.every(isNode) ||
    !Array.isArray(value.edges) ||
    !value.edges.every(isEdge) ||
    !Array.isArray(value.views) ||
    value.views.length === 0 ||
    !value.views.every(isView)
  ) {
    throw new Error("Graph data does not match the public graph schema.");
  }

  // The structural guard above validates every field before this conversion.
  const document = value as unknown as GraphDocument;

  if (!hasUniqueIds(document.nodes) || !hasUniqueIds(document.edges) || !hasUniqueIds(document.views)) {
    throw new Error("Graph nodes, edges, and views must have unique IDs.");
  }

  const nodeIds = new Set(document.nodes.map((node) => node.id));
  const edgeIds = new Set(document.edges.map((edge) => edge.id));
  const viewIds = new Set(document.views.map((view) => view.id));

  if (!viewIds.has(document.entryViewId)) {
    throw new Error(`Entry view "${document.entryViewId}" does not exist.`);
  }

  for (const edge of document.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(`Edge "${edge.id}" references a missing node.`);
    }
  }

  for (const node of document.nodes) {
    if (node.parentId && !nodeIds.has(node.parentId)) {
      throw new Error(`Node "${node.id}" references a missing parent.`);
    }
  }

  for (const view of document.views) {
    if (
      !nodeIds.has(view.rootNodeId) ||
      !view.nodeIds.includes(view.rootNodeId) ||
      (view.parentNodeId !== undefined && !nodeIds.has(view.parentNodeId)) ||
      view.nodeIds.some((nodeId) => !nodeIds.has(nodeId)) ||
      view.edgeIds.some((edgeId) => !edgeIds.has(edgeId))
    ) {
      throw new Error(`View "${view.id}" contains a dangling reference.`);
    }
  }

  return document;
}
