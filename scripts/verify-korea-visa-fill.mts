/**
 * Round-trip proof for the Korea visa fill engine: fill EVERY field with the
 * golden sample data, then re-extract text with pdf.js and assert
 * (1) the document keeps its shape, (2) no overflow warnings,
 * (3) every text value actually landed in the PDF, (4) checkbox marks are
 * real check marks (U+2713), which the blank form contains zero of.
 * Also writes out/korea-visa-golden.pdf for a human visual pass.
 * Source of truth for stricter placement assertions:
 * /Users/ryan/WebstormProjects/PdfToFormToPdf/tests/unit/fill.roundtrip.test.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillPdf } from '../src/lib/korea-visa/fill/fillPdf';
import { goldenValues } from '../src/lib/korea-visa/form/golden-values';
import { SAMPLE_TEMPLATE } from '../src/lib/korea-visa/templates';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'ok' : 'FAIL'} - ${label}`);
  if (!ok) failures++;
};

const original = new Uint8Array(readFileSync(join(root, 'public/samples/visa-application.pdf')));
const fontBytes = new Uint8Array(readFileSync(join(root, 'public/fonts/NotoSansKR-Regular.ttf')));

const values = goldenValues(SAMPLE_TEMPLATE);
const { bytes: filled, warnings } = await fillPdf(original, SAMPLE_TEMPLATE, values, fontBytes);
check(
  warnings.length === 0,
  `no overflow warnings (got ${warnings.length}: ${warnings.join('; ')})`
);

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const extractAll = async (bytes: Uint8Array) => {
  const doc = await pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: true }).promise;
  let text = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    text += (tc.items as { str: string }[]).map((i) => i.str).join('');
  }
  await doc.destroy();
  return { pages: doc.numPages, text: text.replace(/\s+/g, '') };
};

const before = await extractAll(original);
const after = await extractAll(filled);

check(after.pages === 5, `page count preserved (got ${after.pages})`);
check(after.text.includes(before.text.slice(0, 200)), 'original text survives');

const textFieldIds = new Set(
  SAMPLE_TEMPLATE.fields.filter((f) => f.type === 'text').map((f) => f.id)
);
const missing = Object.entries(values)
  .filter(([id, v]) => textFieldIds.has(id) && typeof v === 'string')
  .filter(([, v]) => !after.text.includes(String(v).replace(/\s+/g, '')))
  .map(([id]) => id);
check(missing.length === 0, `every text value landed (missing: ${missing.join(', ') || 'none'})`);

const countChecks = (t: string) => (t.match(/✓/g) ?? []).length;
check(countChecks(before.text) === 0, 'blank form has no U+2713');
check(countChecks(after.text) > 0, `filled form has real check marks (${countChecks(after.text)})`);

mkdirSync(join(root, 'out'), { recursive: true });
writeFileSync(join(root, 'out/korea-visa-golden.pdf'), filled);
console.log(`wrote out/korea-visa-golden.pdf (${(filled.length / 1024).toFixed(0)} KB)`);

process.exit(failures ? 1 : 0);
