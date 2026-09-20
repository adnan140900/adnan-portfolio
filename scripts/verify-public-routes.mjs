import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = name => JSON.parse(readFileSync(new URL(`../content/public-export/${name}.json`, import.meta.url), "utf8"));
const profile = read("profile");
const collection = Object.fromEntries(["research", "projects", "ai", "leadership", "learning"].map(name => [name, read(name).items]));
const routes = {
  "/": [profile.name, profile.headline.text, profile.introduction.text, profile.supportingLine.text, ...profile.themes.map(v => v.text), ...profile.currentFocus.map(v => v.text)],
  "/about": [profile.name, ...profile.biography.flatMap(v => v.text.split("\n\n")), ...profile.currentFocus.map(v => v.text)],
  "/research": collection.research.map(v => v.summary),
  "/projects": collection.projects.map(v => v.summary),
};
const prose = item => [item.title, item.summary, ...item.sections.flatMap(section => [section.heading, ...section.body])];
routes["/research/flood-accessibility"] = prose(collection.research[0]);
routes["/projects/nothipotro"] = prose(collection.projects[0]);
routes["/projects/knowledge-workflows"] = prose(collection.projects[1]);
for (const name of ["ai", "leadership", "learning"]) routes[`/${name}`] = collection[name].flatMap(prose);
const normalize = text => text.replace(/\s+/g, " ").trim();
const origin = process.argv[2] ?? "http://localhost:3000";
for (const [route, expected] of Object.entries(routes)) {
  const response = await fetch(`${origin}${route}`);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  const visible = normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&#39;", "'").replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">"));
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${route}: one H1`);
  for (const paragraph of expected) assert.ok(visible.includes(normalize(paragraph)), `${route}: missing approved prose: ${paragraph.slice(0, 60)}`);
  assert.doesNotMatch(html, /class="[^"]*\bstory-moment\b/, `${route}: obsolete article presentation is not mounted`);
  if (route === "/" || route === "/about") {
    assert.equal((html.match(/<h2[^>]*>Current focus<\/h2>/g) ?? []).length, 1, `${route}: one focus entrance`);
    for (const item of profile.currentFocus) assert.equal(visible.split(normalize(item.text)).length - 1, 1, `${route}: focus prose has one semantic copy`);
  }
  assert.doesNotMatch(visible, /placeholder|Phase [1-6]/i, `${route}: old content`);
  assert.doesNotMatch(html, /<img\b|<video\b/i, `${route}: asset-free`);
  const body = html.slice(html.indexOf("<body")).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  // Includes collapsed approved root prose; excludes metadata, attributes and scripts.
  assert.equal(body.split(profile.name).length - 1, route === "/" ? 2 : route === "/about" ? 1 : 0, `${route}: identity deduplication`);
  console.log(`PASS ${route}: HTTP 200, one H1, all expected approved prose, no image/video assets`);
}
assert.equal((await fetch(`${origin}/engineering`)).status, 404);
console.log("PASS /engineering: no invented public route");
