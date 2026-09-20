import type { GraphNodeId, GraphView, GraphViewId } from "../types";

export type GraphExplorerState =
  | {
      level: "universe";
      activeViewId: GraphViewId;
      focusedNodeId: GraphNodeId | null;
    }
  | {
      level: "cluster";
      activeViewId: GraphViewId;
      activeClusterId: GraphNodeId;
      focusedNodeId: GraphNodeId;
    }
  | {
      level: "subject";
      activeViewId: GraphViewId;
      activeClusterId: GraphNodeId;
      activeSubjectId: GraphNodeId;
      focusedNodeId: GraphNodeId;
    };

export type GraphExplorerAction =
  | { type: "focus-node"; nodeId: GraphNodeId }
  | { type: "enter-cluster"; nodeId: GraphNodeId; viewId?: GraphViewId }
  | {
      type: "open-subject";
      nodeId: GraphNodeId;
      clusterId: GraphNodeId;
      viewId?: GraphViewId;
    }
  | { type: "activate-view"; view: GraphView }
  | { type: "return-to-universe"; viewId: GraphViewId };

export function createInitialGraphState(view: GraphView): GraphExplorerState {
  if (view.level === "cluster") {
    return {
      level: "cluster",
      activeViewId: view.id,
      activeClusterId: view.rootNodeId,
      focusedNodeId: view.rootNodeId,
    };
  }

  if (view.level === "subject") {
    if (!view.parentNodeId) {
      throw new Error(`Subject view "${view.id}" requires a parent node.`);
    }

    return {
      level: "subject",
      activeViewId: view.id,
      activeClusterId: view.parentNodeId,
      activeSubjectId: view.rootNodeId,
      focusedNodeId: view.rootNodeId,
    };
  }

  return { level: "universe", activeViewId: view.id, focusedNodeId: null };
}

export function graphExplorerReducer(
  state: GraphExplorerState,
  action: GraphExplorerAction,
): GraphExplorerState {
  switch (action.type) {
    case "focus-node":
      return { ...state, focusedNodeId: action.nodeId };
    case "enter-cluster":
      return {
        level: "cluster",
        activeViewId: action.viewId ?? state.activeViewId,
        activeClusterId: action.nodeId,
        focusedNodeId: action.nodeId,
      };
    case "open-subject":
      return {
        level: "subject",
        activeViewId: action.viewId ?? state.activeViewId,
        activeClusterId: action.clusterId,
        activeSubjectId: action.nodeId,
        focusedNodeId: action.nodeId,
      };
    case "activate-view":
      return createInitialGraphState(action.view);
    case "return-to-universe":
      return {
        level: "universe",
        activeViewId: action.viewId,
        focusedNodeId: null,
      };
  }
}
