export interface StoryMoment {
  id?: string;
  /** An explicit item/section mapping, never guessed from a heading. */
  nodeId: string;
  title: string;
  copy: string;
  displayStatus?: string;
  href?: string;
  supportingNodeIds?: string[];
  highlightedEdgeIds?: string[];
  weakenedEdgeIds?: string[];
  nodeOffsets?: Record<string, { x: number; y: number }>;
  camera?: { x: number; y: number; scale: number };
  placement?: "left" | "right" | "bottom";
}
