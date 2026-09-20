import { publicContent } from "../public-content/bundle";
import { adaptPublicGraph } from "../public-content/graph-adapter";

export const portfolioGraph = adaptPublicGraph(publicContent.graph);
