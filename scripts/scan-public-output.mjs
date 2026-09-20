import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
// Review matches in context; framework identifiers are not private content.
const pattern = /APP-|owner-|whole-graph|freshness|not_granted|omit_initial_release|held_from_initial_export|Obsidian|Adnan-Vault|credentials|OAuth|private provenance|approval records/g;
const extensions = /\.(?:tsx?|js|html|rsc|json)$/;
let scanned = 0;
let matches = 0;
function scan(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.name === "tests") continue;
    const path = join(folder, entry.name);
    if (entry.isDirectory()) { scan(path); continue; }
    if (!extensions.test(entry.name) || entry.name.endsWith(".map")) continue;
    const content = readFileSync(path, "utf8");
    scanned++;
    const seen = new Set();
    for (const match of content.matchAll(pattern)) {
      const context = content.slice(Math.max(0, match.index - 65), match.index + match[0].length + 90).replace(/\s+/g, " ");
      if (seen.has(context)) continue;
      seen.add(context); matches++;
      console.log(JSON.stringify({ file: relative(process.cwd(), path), term: match[0], context }));
    }
  }
}
for (const folder of ["src", ".next/server/app", ".next/static/chunks"]) scan(folder);
console.log(JSON.stringify({ scanned, matches, scope: "Application source and generated route/client output; no source maps or external directories read." }));
