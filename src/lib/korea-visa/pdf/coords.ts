/**
 * THE single coordinate convention of this codebase:
 * every stored coordinate (template rects, text runs, ruling lines, bracket
 * gap rects) is in PDF user space — points, origin bottom-left, y-up.
 * A Rect's (x, y) is its BOTTOM-LEFT corner. A text run's y is its baseline.
 *
 * Screen space ({left, top} y-down CSS pixels) exists only at the UI edge and
 * only via the two converters below. No other module is allowed to do y-math
 * between the two spaces. The shapes are deliberately different so mixing
 * them up is a compile error.
 */

/** PDF user space rect, bottom-left origin, y-up. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** CSS overlay rect, top-left origin, y-down, already scaled to pixels. */
export interface CssRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function pdfRectToCss(r: Rect, pageHeight: number, scale: number): CssRect {
  return {
    left: r.x * scale,
    top: (pageHeight - r.y - r.h) * scale,
    width: r.w * scale,
    height: r.h * scale,
  };
}

export function cssToPdfRect(c: CssRect, pageHeight: number, scale: number): Rect {
  return {
    x: c.left / scale,
    y: pageHeight - (c.top + c.height) / scale,
    w: c.width / scale,
    h: c.height / scale,
  };
}

/** Storage rounding: 0.1 pt keeps fixtures diff-stable. */
export const round1 = (n: number): number => Math.round(n * 10) / 10;

export const roundRect = (r: Rect): Rect => ({
  x: round1(r.x),
  y: round1(r.y),
  w: round1(r.w),
  h: round1(r.h),
});

export const rectContains = (r: Rect, px: number, py: number): boolean =>
  px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

export const rectCenter = (r: Rect): { x: number; y: number } => ({
  x: r.x + r.w / 2,
  y: r.y + r.h / 2,
});
