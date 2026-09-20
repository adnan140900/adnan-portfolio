// Local visual proof only; not part of the Next app or public route surface.
// Run `pnpm test` first, then `node scripts/preview-decode-glyphs.mjs`.
import { createServer } from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { decodeConfig: c } = require("../.test-dist/features/kinetic/decode-config.js");
const mark = glyph => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="${glyph.path}"/></svg>`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Local decode glyph proof</title><style>
body{background:#080a0c;color:#ede9df;margin:24px;font:16px/1.6 'Segoe UI',Arial,sans-serif}h1{font:32px Georgia,serif}section{margin:24px 0;border-top:1px solid #344852;padding:16px 0}.system{font-family:'Cascadia Code','SFMono-Regular',Consolas,monospace}.editorial{font-family:'Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif;font-size:32px}.pool{font-size:24px;letter-spacing:.4em}.small{font-size:12px}.marks{display:flex;flex-wrap:wrap;gap:24px}.marks div{width:110px}.marks svg{width:24px;height:24px}small{display:block;font-size:12px;color:#babdb9}svg{vertical-align:-.1em}</style>
<h1>Decode glyph proof</h1><p>Local QA fixture. Original marks are decorative notation, not semantic icons.</p>
<section class="system"><p>System / production fallback stack</p><p class="pool">${c.systemPool.join(" ")}</p><p class="pool small">${c.systemPool.join(" ")}</p><p>C◇NNECT△NG IDEAS</p></section>
<section class="editorial"><p>Flood Accessib△lity</p><p>Research ◇</p></section><section class="marks">${c.customGlyphs.map(glyph => `<div>${mark(glyph)}<small>${glyph.id}</small></div>`).join("")}</section></html>`;
createServer((_request, response) => { response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); response.end(html); }).listen(3002, "127.0.0.1", () => console.log("Local glyph proof: http://127.0.0.1:3002"));
