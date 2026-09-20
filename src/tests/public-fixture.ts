import { readFileSync } from "node:fs";
import { parsePublicBundle } from "../lib/public-content/schema";
export function readPublicFixture(): unknown {
  return Object.fromEntries(["manifest", "profile", "graph", "research", "projects", "ai", "leadership", "learning"].map(kind => [kind, JSON.parse(readFileSync(`content/public-export/${kind}.json`, "utf8"))]));
}
export const approvedBundle = parsePublicBundle(readPublicFixture());
