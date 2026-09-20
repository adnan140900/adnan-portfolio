import "server-only";
import manifest from "../../../content/public-export/manifest.json";
import profile from "../../../content/public-export/profile.json";
import graph from "../../../content/public-export/graph.json";
import research from "../../../content/public-export/research.json";
import projects from "../../../content/public-export/projects.json";
import ai from "../../../content/public-export/ai.json";
import leadership from "../../../content/public-export/leadership.json";
import learning from "../../../content/public-export/learning.json";
import { parsePublicBundle } from "./schema";

/** Sole raw-import boundary; evaluated at build/startup, never imported by UI clients. */
export const publicContent = parsePublicBundle({ manifest, profile, graph, research, projects, ai, leadership, learning });
