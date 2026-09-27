/** Explicit, strict runtime schemas. Unknown fields fail instead of leaking into UI. */
interface Schema<T> { parse(value: unknown, path: string): T }
type Infer<S> = S extends Schema<infer T> ? T : never;
function fail(path: string, expected: string): never {
  throw new Error(`Public content: ${path} must be ${expected}.`);
}
const text: Schema<string> = { parse: (v, p) => typeof v === "string" && v.trim() ? v : fail(p, "a nonempty string") };
const id: Schema<string> = { parse: (v, p) => typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ? v : fail(p, "a public identifier") };
function enumeration<const T extends readonly (string | number)[]>(values: T): Schema<T[number]> {
  return { parse: (v, p) => values.includes(v as T[number]) ? v as T[number] : fail(p, values.join(" | ")) };
}
function array<T>(item: Schema<T>): Schema<T[]> {
  return { parse: (v, p) => Array.isArray(v) && v.length ? v.map((entry, i) => item.parse(entry, `${p}[${i}]`)) : fail(p, "a nonempty array") };
}
function optional<T>(item: Schema<T>): Schema<T | undefined> {
  return { parse: (v, p) => v === undefined ? undefined : item.parse(v, p) };
}
function object<T extends Record<string, Schema<unknown>>>(fields: T): Schema<{ [K in keyof T]: Infer<T[K]> }> {
  return { parse(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(path, "an object");
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) if (!(key in fields)) fail(`${path}.${key}`, "an allowed schema field");
    return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.parse(record[key], `${path}.${key}`)])) as { [K in keyof T]: Infer<T[K]> };
  } };
}

const version = enumeration(["1.0.0"]);
const status = enumeration(["theme", "current-work", "exploratory-work", "research-question", "historical", "interest", "experiment"]);
const textBlock = object({ id, text });
const link = object({ label: text, url: { parse(v: unknown, p: string) {
  const value = text.parse(v, p);
  if (!/^(https:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+)$/.test(value)) fail(p, "an HTTPS or email link");
  return value;
} } });
const section = object({
  id, kind: enumeration(["question", "motivation", "method", "assumptions", "exploratory-work", "limitations", "validation", "uncertainty", "approach", "learning", "context", "experience"]),
  heading: text, body: array(text), displayStatus: status, graphNodeId: optional(id),
});
const item = object({ id, title: text, summary: text, displayStatus: status, sections: array(section), graphNodeId: id });
const collection = object({ schemaVersion: version, items: array(item) });
const profile = object({
  schemaVersion: version, id, name: text, graphNodeId: id,
  headline: textBlock, homeIntroduction: textBlock, homeCta: textBlock, introduction: textBlock,
  themes: array(textBlock), biography: array(textBlock), supportingLine: textBlock,
  currentFocus: array(object({ id, text, displayStatus: status })), links: array(link),
});
const node = object({
  id, label: text, category: enumeration(["profile", "research", "engineering", "ai", "project", "leadership", "learning"]),
  depth: enumeration([0, 1, 2, 3]), importance: enumeration(["primary", "featured", "supporting"]), displayStatus: status, summary: text,
});
const edge = object({ id, source: id, target: id, relationship: enumeration([
  "has-theme", "includes", "frames-question", "uses-method", "motivates", "requires-checking", "has-design-theme", "used-in-experiments", "explores", "raises-tradeoffs", "practice-context", "proposed-learning-context", "learning-direction", "proposed-learning-practice",
]) });
const graph = object({ schemaVersion: version, rootId: enumeration(["person-adnan"]), nodes: array(node), edges: array(edge) });
const payloadKinds = ["profile", "graph", "research", "projects", "ai", "leadership", "learning"] as const;
const manifest = object({
  schemaVersion: version, releaseVersion: enumeration(["public-export-v1-2026-09-11-r1"]), assetPolicy: enumeration(["asset-free"]),
  files: array(object({ path: text, kind: enumeration(payloadKinds) })), graphNodeCount: enumeration([38]), graphEdgeCount: enumeration([50]),
});
const bundleSchema = object({ manifest, profile, graph, research: collection, projects: collection, ai: collection, leadership: collection, learning: collection });
export type PublicBundle = Infer<typeof bundleSchema>;
export type PublicGraph = Infer<typeof graph>;
export type PublicNode = Infer<typeof node>;
export type PublicItem = Infer<typeof item>;
export type PublicSection = Infer<typeof section>;
export type DisplayStatus = Infer<typeof status>;

export function parsePublicBundle(value: unknown): PublicBundle {
  const bundle = bundleSchema.parse(value, "bundle");
  const unique = (ids: string[], path: string) => { if (new Set(ids).size !== ids.length) fail(path, "unique"); };
  unique(bundle.manifest.files.map(file => file.path), "manifest.files");
  if (bundle.manifest.files.length !== 7 || payloadKinds.some(kind => !bundle.manifest.files.some(file => file.kind === kind && file.path === `${kind}.json`))) fail("manifest.files", "the seven payload files (excluding the manifest itself)");
  if (bundle.graph.nodes.length !== bundle.manifest.graphNodeCount || bundle.graph.edges.length !== bundle.manifest.graphEdgeCount) fail("graph", "38 nodes and 50 edges");
  unique(bundle.graph.nodes.map(n => n.id), "graph.nodes IDs");
  unique(bundle.graph.edges.map(e => e.id), "graph.edges IDs");
  const nodes = new Map(bundle.graph.nodes.map(n => [n.id, n]));
  if (nodes.get(bundle.graph.rootId)?.depth !== 0) fail("graph.rootId", "the depth-zero root");
  for (const e of bundle.graph.edges) if (!nodes.has(e.source) || !nodes.has(e.target) || e.source === e.target) fail(`graph edge ${e.id}`, "connected to two existing distinct nodes");
  const roots = bundle.graph.edges.filter(e => e.source === bundle.graph.rootId);
  if (roots.length !== 6 || roots.some(e => e.relationship !== "has-theme" || nodes.get(e.target)?.depth !== 1)) fail("graph root connections", "six direct themes");
  const checkMapping = (value: { graphNodeId?: string }, path: string) => {
    if (value.graphNodeId && !nodes.has(value.graphNodeId)) fail(path, "mapped to an existing public node");
  };
  checkMapping(bundle.profile, "profile.graphNodeId");
  const contentIds: string[] = [bundle.profile.id, bundle.profile.headline.id, bundle.profile.homeIntroduction.id, bundle.profile.homeCta.id, bundle.profile.introduction.id, bundle.profile.supportingLine.id, ...bundle.profile.themes.map(v => v.id), ...bundle.profile.biography.map(v => v.id), ...bundle.profile.currentFocus.map(v => v.id)];
  for (const key of ["research", "projects", "ai", "leadership", "learning"] as const) {
    for (const item of bundle[key].items) {
      contentIds.push(item.id);
      checkMapping(item, `${key}.${item.id}.graphNodeId`);
      for (const section of item.sections) { contentIds.push(section.id); checkMapping(section, `${key}.${section.id}.graphNodeId`); }
    }
  }
  unique(contentIds, "content IDs");
  return bundle;
}
