import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import type { GraphEdge, GraphNode, GraphNodeId } from "../types";
import {
  createForceGraphLinks,
  createStableGraphNodes,
  GRAPH_CENTER,
} from "./graph-geometry";
import { createSvgGraphAdapter } from "./svg-graph-adapter";
import type {
  ForceGraphController,
  ForceGraphLink,
  ForceGraphNode,
  GraphPoint,
} from "./types";

interface CreateForceGraphControllerOptions {
  svg: SVGSVGElement;
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeId: GraphNodeId;
  animate: boolean;
  dragEnabled: boolean;
}

export function createForceGraphController({
  svg,
  nodes: graphNodes,
  edges: graphEdges,
  rootNodeId,
  animate,
  dragEnabled,
}: CreateForceGraphControllerOptions): ForceGraphController {
  const nodes = createStableGraphNodes(graphNodes, rootNodeId);
  const links = createForceGraphLinks(graphEdges);
  const adapter = createSvgGraphAdapter(svg);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const authored = graphNodes.some(node => node.kind === "person") || rootNodeId === "research-flood-accessibility";
  const anchors = new Map(nodes.map(node => [node.id, { x: node.x!, y: node.y! }]));
  const rootNode = nodeById.get(rootNodeId);
  const rootAnchor = {
    x: rootNode?.x ?? GRAPH_CENTER.x,
    y: rootNode?.y ?? GRAPH_CENTER.y,
  };

  adapter.render(nodes, links);

  if (!animate) {
    return {
      dragEnabled: false,
      beginDrag: () => false,
      drag: () => undefined,
      endDrag: () => undefined,
      pause: () => undefined,
      destroy: () => undefined,
    };
  }

  if (rootNode) {
    rootNode.fx = rootAnchor.x;
    rootNode.fy = rootAnchor.y;
  }

  const settleStarted = performance.now();
  const simulation = forceSimulation(nodes)
    .alpha(0.72)
    .alphaMin(0.018)
    .alphaDecay(0.072)
    .velocityDecay(0.56)
    .force(
      "links",
      forceLink<ForceGraphNode, ForceGraphLink>(links)
        .id((node) => node.id)
        .distance((link) => 184 + ((link.id.length * 17) % 52))
        .strength(authored ? 0.015 : 0.46),
    )
    .force(
      "charge",
      forceManyBody<ForceGraphNode>()
        .strength((node) => (node.isRoot ? -440 : -230))
        .distanceMax(460),
    )
    .force(
      "collision",
      forceCollide<ForceGraphNode>((node) => authored ? 65 : node.collisionRadius)
        .strength(0.9)
        .iterations(1),
    )
    .force(
      "center",
      forceCenter<ForceGraphNode>(GRAPH_CENTER.x, GRAPH_CENTER.y).strength(authored ? 0 : 0.035),
    )
    .force("x", forceX<ForceGraphNode>(node => authored ? anchors.get(node.id)!.x : GRAPH_CENTER.x).strength(authored ? 0.8 : 0.011))
    .force("y", forceY<ForceGraphNode>(node => authored ? anchors.get(node.id)!.y : GRAPH_CENTER.y).strength(authored ? 0.8 : 0.014))
    .on("tick", () => adapter.render(nodes, links));

  // Resolve the same D3 final layout before a cinematic reveal. The entrance
  // and post-transition controller therefore share exact endpoint geometry.
  simulation.stop().tick(90);
  if (svg.dataset) {
    svg.dataset.settleMs = (performance.now() - settleStarted).toFixed(3);
    svg.dataset.physicsNodes = String(nodes.length);
  }
  adapter.render(nodes, links);

  function findNode(nodeId: GraphNodeId) {
    return nodeById.get(nodeId);
  }

  function beginDrag(nodeId: GraphNodeId, point: GraphPoint) {
    if (!dragEnabled) return false;
    const node = findNode(nodeId);
    if (!node) return false;

    node.fx = point.x;
    node.fy = point.y;
    simulation.alphaTarget(0.14).alpha(Math.max(simulation.alpha(), 0.22)).restart();
    return true;
  }

  function drag(nodeId: GraphNodeId, point: GraphPoint) {
    const node = findNode(nodeId);
    if (!node) return;
    node.fx = point.x;
    node.fy = point.y;
  }

  function endDrag(nodeId: GraphNodeId) {
    const node = findNode(nodeId);
    if (!node) return;

    if (node.isRoot) {
      node.fx = rootAnchor.x;
      node.fy = rootAnchor.y;
    } else {
      node.fx = null;
      node.fy = null;
    }

    simulation.alphaTarget(0).alpha(Math.max(simulation.alpha(), 0.12)).restart();
  }

  return {
    dragEnabled,
    beginDrag,
    drag,
    endDrag,
    pause() { simulation.stop(); },
    destroy() {
      simulation.stop();
      simulation.on("tick", null);
    },
  };
}
