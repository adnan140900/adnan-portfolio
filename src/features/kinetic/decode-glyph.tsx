import { decodeConfig } from "./decode-config";

export function DecodeGlyph({ index = 0 }: { index?: number }) {
  const glyph = decodeConfig.customGlyphs[index % decodeConfig.customGlyphs.length];
  return <svg className="decode-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"><path data-custom-glyph={glyph.id} d={glyph.path} /></svg>;
}
