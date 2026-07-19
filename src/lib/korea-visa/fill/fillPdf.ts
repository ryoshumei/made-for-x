/**
 * The fill engine: loads the ORIGINAL PDF bytes and draws the user's
 * answers on top at template coordinates. The original document is never
 * regenerated — pdf-lib parses the existing objects and appends an overlay;
 * a runtime guard plus the round-trip test prove page count, page sizes,
 * and every original text run survive byte-for-byte placement.
 */
import { PDFDocument, type PDFPage } from 'pdf-lib';
import { fontkitForPdfLib } from './fontkit2Shim';
import type { Rect } from '../pdf/coords';
import type { DateValue, Field, FormTemplate, FormValues } from '../template/schema';
import { formatDateValue } from '../template/schema';
import { isFieldVisible } from '../form/visibility';
import { centeredBaseline, fitSize, layoutMultiline } from './layout';

export interface FillResult {
  bytes: Uint8Array;
  warnings: string[];
}

const CHECK_MARK = '✓'; // U+2713, present in Noto Sans KR
const CHECK_MIN_SIZE = 5;

export async function fillPdf(
  originalBytes: Uint8Array,
  template: FormTemplate,
  values: FormValues,
  fontBytes: Uint8Array
): Promise<FillResult> {
  const warnings: string[] = [];
  const doc = await PDFDocument.load(originalBytes, { updateMetadata: false });
  // fontkit 2 via shim: the @pdf-lib/fontkit fork corrupts Noto Sans KR
  // subset outlines (text extracts but doesn't render) — see fontkit2Shim.
  doc.registerFontkit(fontkitForPdfLib as never);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const pages = doc.getPages();
  if (pages.length !== template.pdf.pageCount) {
    throw new Error(`page count mismatch: pdf=${pages.length} template=${template.pdf.pageCount}`);
  }
  template.pdf.pageSizes.forEach((s, i) => {
    const { width, height } = pages[i].getSize();
    if (Math.abs(width - s.w) > 0.5 || Math.abs(height - s.h) > 0.5) {
      throw new Error(`page ${i} size mismatch: ${width}x${height} vs ${s.w}x${s.h}`);
    }
  });

  const canDrawCheckGlyph = (() => {
    try {
      font.encodeText(CHECK_MARK);
      return true;
    } catch {
      return false;
    }
  })();

  const drawTextInRect = (
    page: PDFPage,
    fieldId: string,
    text: string,
    rect: Rect,
    opts: { size: number; minSize: number; align: 'left' | 'center'; padX: number; nudge: number }
  ) => {
    if (text === '') return;
    const padX = Math.min(opts.padX, rect.w * 0.15); // tiny boxes keep usable width
    const maxWidth = rect.w - 2 * padX;
    const { size, fits } = fitSize(font, text, maxWidth, opts.size, opts.minSize);
    if (!fits) warnings.push(`${fieldId}: "${text}" exceeds the field width even at minimum size`);
    const width = font.widthOfTextAtSize(text, size);
    const x = opts.align === 'center' ? rect.x + (rect.w - width) / 2 : rect.x + padX;
    const y = centeredBaseline(font, rect, size, opts.nudge);
    page.drawText(text, { x, y, size, font });
  };

  const drawCheck = (page: PDFPage, gap: Rect) => {
    const size = Math.max(CHECK_MIN_SIZE, Math.min(gap.h * 0.95, gap.w * 1.4));
    if (canDrawCheckGlyph) {
      const width = font.widthOfTextAtSize(CHECK_MARK, size);
      const x = gap.x + (gap.w - width) / 2;
      const y = centeredBaseline(font, gap, size);
      page.drawText(CHECK_MARK, { x, y, size, font });
    } else {
      // vector fallback: ✓ strokes inside the gap
      const x0 = gap.x + gap.w * 0.15;
      const midX = gap.x + gap.w * 0.4;
      const x1 = gap.x + gap.w * 0.9;
      const yLow = gap.y + gap.h * 0.2;
      const yMid = gap.y + gap.h * 0.45;
      const yHigh = gap.y + gap.h * 0.85;
      page.drawLine({ start: { x: x0, y: yMid }, end: { x: midX, y: yLow }, thickness: 0.9 });
      page.drawLine({ start: { x: midX, y: yLow }, end: { x: x1, y: yHigh }, thickness: 0.9 });
    }
  };

  const drawField = (field: Field) => {
    const page = pages[field.page];
    const value = values[field.id];
    if (value === undefined || !isFieldVisible(field, values)) return;
    const nudge = field.baselineNudge ?? 0;

    switch (field.type) {
      case 'text': {
        if (typeof value !== 'string') return;
        drawTextInRect(page, field.id, value.trim(), field.rect, {
          size: field.font.size,
          minSize: field.font.minSize,
          align: field.font.align,
          padX: field.padX ?? 2,
          nudge,
        });
        break;
      }
      case 'multiline': {
        if (typeof value !== 'string' || value.trim() === '') return;
        const layout = layoutMultiline(font, value.trim(), field.rect, {
          size: field.font.size,
          minSize: field.font.minSize,
          lineHeight: field.font.lineHeight,
          maxLines: field.maxLines,
          nudge,
        });
        if (!layout.fits) {
          warnings.push(`${field.id}: text exceeds ${field.maxLines} line(s) even at minimum size`);
        }
        layout.lines.forEach((line, i) => {
          if (line === '') return;
          page.drawText(line, {
            x: field.rect.x + 2,
            y: layout.baselines[i],
            size: layout.size,
            font,
          });
        });
        break;
      }
      case 'date': {
        const v = value as DateValue;
        if (typeof v !== 'object' || Array.isArray(v)) return;
        for (const slot of field.slots) {
          const text = slot.key === 'full' ? formatDateValue(v) : (v[slot.key]?.trim() ?? '');
          if (text === '') continue;
          drawTextInRect(page, field.id, text, slot.rect, {
            size: field.font.size,
            minSize: 4.5,
            align: field.font.align,
            padX: 1,
            nudge,
          });
        }
        break;
      }
      case 'radio':
      case 'checkbox': {
        const selected = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
        for (const sel of selected) {
          const opt = field.options.find((o) => o.value === sel);
          if (!opt) {
            warnings.push(`${field.id}: unknown option "${sel}"`);
            continue;
          }
          drawCheck(page, { ...opt.gapRect, y: opt.gapRect.y + nudge });
        }
        break;
      }
      case 'table': {
        if (!Array.isArray(value)) return;
        (value as string[][]).forEach((row, r) => {
          const rowRects = field.rows[r]?.cells;
          if (!rowRects) return;
          row.forEach((cellText, c) => {
            const rect = rowRects[c];
            if (!rect || typeof cellText !== 'string' || cellText.trim() === '') return;
            drawTextInRect(page, `${field.id}[${r}][${c}]`, cellText.trim(), rect, {
              size: field.font.size,
              minSize: field.font.minSize,
              align: 'left',
              padX: 2,
              nudge,
            });
          });
        });
        break;
      }
    }
  };

  for (const field of template.fields) drawField(field);

  const bytes = await doc.save();
  return { bytes, warnings };
}
