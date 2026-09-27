import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const expected = {
  "ai.json": "2debe89c32b7eb33ae8e8d65fc5752ae1870c5c41b84bd8967654dd270df5602",
  "graph.json": "36ad5eba997172b8fe174c1be808717a90a2e508a16c5551593d32c0a612b8c3",
  "leadership.json": "0954e882ddce91bd4c42fabde00db9b5c93ce417575974c32d1b8b0fd208fa18",
  "learning.json": "a1f2056dc4bac374016ce681488e779698479a18eea1b129ed6970a2da034051",
  "manifest.json": "9d189624aab8d19aa799067e4c0b9dc4e305af5c8ece229fd12ca226ee88c98c",
  "profile.json": "5b63cc4be9050ec14cbdca4b3b14c07b22ed97da0e81e65362bd4ce8ab4dd9c6",
  "projects.json": "6b87b8522c874470bcaa683693f1dc5a760150037d50c67da269497f4a30257d",
  "research.json": "b59c1ea77a6a3e5f5bee4bfb929f6a93e32f39f999baf5fc936a280d014d3d2d",
};
for (const [file, hash] of Object.entries(expected)) {
  const actual = createHash("sha256").update(readFileSync(new URL(`../content/public-export/${file}`, import.meta.url))).digest("hex");
  if (actual !== hash) throw new Error(`Handoff integrity failure: ${file}; expected ${hash}; actual ${actual}. Integration stopped.`);
  console.log(`SHA-256 MATCH ${file}: ${actual}`);
}
