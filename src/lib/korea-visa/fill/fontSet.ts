/**
 * Per-character font fallback for the fill engine. The primary font (Noto
 * Sans KR) lacks Japanese shinjitai glyphs (戸, 込, 渋 …); characters it
 * can't draw fall back to the next font that can. Text is split into
 * same-font runs, measured as the sum of run widths, and drawn run by run —
 * so fitSize/wrap math and the ink on the page always agree.
 */
import type { PDFFont, PDFPage } from 'pdf-lib';
import * as fontkit from 'fontkit';
import type { FontMetrics } from './layout';

interface Coverage {
  hasGlyphForCodePoint(cp: number): boolean;
}

// Keyed by the exact bytes object (the hook caches and reuses it), so each
// font is parsed for cmap lookups once per session, not once per fill.
const coverageCache = new WeakMap<Uint8Array, Coverage>();

export function coverageFor(bytes: Uint8Array): Coverage {
  const hit = coverageCache.get(bytes);
  if (hit) return hit;
  const font = (fontkit as unknown as { create(b: Uint8Array): Coverage }).create(bytes);
  coverageCache.set(bytes, font);
  return font;
}

export interface FontSetEntry {
  font: PDFFont;
  coverage: Coverage;
}

interface Run {
  text: string;
  font: PDFFont;
}

export class FontSet implements FontMetrics {
  constructor(private readonly entries: FontSetEntry[]) {
    if (entries.length === 0) throw new Error('FontSet needs at least one font');
  }

  /** Index of the first font covering cp; uncovered chars stay primary (0). */
  private pick(cp: number): number {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].coverage.hasGlyphForCodePoint(cp)) return i;
    }
    return 0;
  }

  private runs(text: string): Run[] {
    const runs: Run[] = [];
    let current = -1;
    for (const ch of text) {
      const idx = this.pick(ch.codePointAt(0)!);
      if (idx === current) {
        runs[runs.length - 1].text += ch;
      } else {
        runs.push({ text: ch, font: this.entries[idx].font });
        current = idx;
      }
    }
    return runs;
  }

  hasGlyph(cp: number): boolean {
    return this.entries.some((e) => e.coverage.hasGlyphForCodePoint(cp));
  }

  /** Unique characters no font in the set can draw (they render as tofu). */
  unsupportedChars(text: string): string[] {
    const missing = new Set<string>();
    for (const ch of text) {
      if (!this.hasGlyph(ch.codePointAt(0)!)) missing.add(ch);
    }
    return [...missing];
  }

  widthOfTextAtSize(text: string, size: number): number {
    let width = 0;
    for (const run of this.runs(text)) width += run.font.widthOfTextAtSize(run.text, size);
    return width;
  }

  // Vertical metrics come from the primary font; the Noto Sans KR/JP pair
  // shares them, so mixed-run lines sit on one baseline.
  heightAtSize(size: number, options?: { descender?: boolean }): number {
    return this.entries[0].font.heightAtSize(size, options);
  }

  drawText(page: PDFPage, text: string, opts: { x: number; y: number; size: number }): void {
    let x = opts.x;
    for (const run of this.runs(text)) {
      page.drawText(run.text, { x, y: opts.y, size: opts.size, font: run.font });
      x += run.font.widthOfTextAtSize(run.text, opts.size);
    }
  }
}
