/**
 * Text layout math shared by the fill engine and the form UI's live
 * "doesn't fit" warnings — one implementation, so what the UI predicts is
 * exactly what gets drawn.
 */
import type { Rect } from '../pdf/coords';

/** The slice of pdf-lib's PDFFont we depend on (kept minimal for tests). */
export interface FontMetrics {
  widthOfTextAtSize(text: string, size: number): number;
  heightAtSize(size: number, options?: { descender?: boolean }): number;
}

export const HARD_MIN_SIZE = 4.5;

/** Largest size ≤ start (stepping 0.25) at which text fits maxWidth; floors at min. */
export function fitSize(
  font: FontMetrics,
  text: string,
  maxWidth: number,
  start: number,
  min: number
): { size: number; fits: boolean } {
  const floor = Math.max(min, HARD_MIN_SIZE);
  let size = start;
  while (size > floor && font.widthOfTextAtSize(text, size) > maxWidth) {
    size = Math.round((size - 0.25) * 100) / 100;
  }
  return { size, fits: font.widthOfTextAtSize(text, size) <= maxWidth };
}

/**
 * Baseline y that vertically centers one line of `size` text in `rect`.
 * fullH spans ascender→descender; the baseline sits `descender` above the
 * bottom of that box.
 */
export function centeredBaseline(font: FontMetrics, rect: Rect, size: number, nudge = 0): number {
  const fullH = font.heightAtSize(size);
  const asc = font.heightAtSize(size, { descender: false });
  const desc = fullH - asc;
  return rect.y + (rect.h - fullH) / 2 + desc + nudge;
}

const isCjk = (ch: string): boolean => {
  const c = ch.codePointAt(0)!;
  return (
    (c >= 0x1100 && c <= 0x11ff) || // Hangul Jamo
    (c >= 0x3000 && c <= 0x30ff) || // CJK punctuation, kana
    (c >= 0x3130 && c <= 0x318f) || // Hangul compat Jamo
    (c >= 0x4e00 && c <= 0x9fff) || // CJK ideographs
    (c >= 0xac00 && c <= 0xd7af) || // Hangul syllables
    (c >= 0xf900 && c <= 0xfaff) || // CJK compat ideographs
    (c >= 0xff00 && c <= 0xffef) // full-width forms
  );
};

/** Latin words stay whole; CJK breaks per character. */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let word = '';
  for (const ch of text) {
    if (ch === ' ') {
      if (word) tokens.push(word);
      word = '';
      tokens.push(' ');
    } else if (isCjk(ch)) {
      if (word) tokens.push(word);
      word = '';
      tokens.push(ch);
    } else {
      word += ch;
    }
  }
  if (word) tokens.push(word);
  return tokens;
}

/** Greedy line fill. Lines never start with a space token. */
export function wrapLines(
  font: FontMetrics,
  text: string,
  size: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let line = '';
  for (const token of tokenize(text)) {
    const candidate = line + token;
    if (line !== '' && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line.trimEnd());
      line = token === ' ' ? '' : token;
    } else {
      line = candidate;
    }
  }
  if (line.trimEnd() !== '') lines.push(line.trimEnd());
  return lines.length ? lines : [''];
}

export interface MultilineLayout {
  size: number;
  lines: string[];
  /** Baseline y per line, top line first. */
  baselines: number[];
  fits: boolean;
}

/** Wrap into rect; shrink (0.25 steps) until lines ≤ maxLines or the floor. */
export function layoutMultiline(
  font: FontMetrics,
  text: string,
  rect: Rect,
  opts: {
    size: number;
    minSize: number;
    lineHeight: number;
    maxLines: number;
    padX?: number;
    nudge?: number;
  }
): MultilineLayout {
  const padX = opts.padX ?? 2;
  const floor = Math.max(opts.minSize, HARD_MIN_SIZE);
  let size = opts.size;
  let lines = wrapLines(font, text, size, rect.w - 2 * padX);
  while (lines.length > opts.maxLines && size > floor) {
    size = Math.round((size - 0.25) * 100) / 100;
    lines = wrapLines(font, text, size, rect.w - 2 * padX);
  }
  const asc = font.heightAtSize(size, { descender: false });
  const step = opts.lineHeight * size;
  const baselines: number[] = [];
  if (lines.length === 1) {
    baselines.push(centeredBaseline(font, rect, size, opts.nudge ?? 0));
  } else {
    const first = rect.y + rect.h - asc - 1.5 + (opts.nudge ?? 0);
    for (let i = 0; i < lines.length; i++) baselines.push(first - i * step);
  }
  return { size, lines, baselines, fits: lines.length <= opts.maxLines };
}
