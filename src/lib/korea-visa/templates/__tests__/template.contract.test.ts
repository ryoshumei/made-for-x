/**
 * The bundled template is the product: it must parse against the zod schema
 * (import does that), key exactly the committed sample PDF, and keep its
 * hand-calibrated field count.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bundledTemplates, SAMPLE_TEMPLATE } from '../index';

const SAMPLE_SHA = '1ba3935fdaab49ef5459a500a8f85a4bccd378edc4483b1342587fd595e8dffa';

it('is keyed by the committed sample PDF byte-for-byte', () => {
  const pdf = readFileSync(join(process.cwd(), 'public/samples/visa-application.pdf'));
  expect(createHash('sha256').update(pdf).digest('hex')).toBe(SAMPLE_SHA);
  expect(bundledTemplates[SAMPLE_SHA]).toBe(SAMPLE_TEMPLATE);
});

it('keeps the calibrated shape: 84 fields, 5 pages of 595x841', () => {
  expect(SAMPLE_TEMPLATE.fields).toHaveLength(84);
  expect(SAMPLE_TEMPLATE.pdf.pageCount).toBe(5);
  for (const s of SAMPLE_TEMPLATE.pdf.pageSizes) {
    expect(s).toEqual({ w: 595, h: 841 });
  }
});
