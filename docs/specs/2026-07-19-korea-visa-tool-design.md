# Korea Visa Form Filler — Design

**Date:** 2026-07-19
**Status:** Approved (pending spec review)
**Source project:** `/Users/ryan/WebstormProjects/PdfToFormToPdf` (branch `claude/korean-visa-pdf-forms-3q6cqk`)

## Goal

Publish the Korean visa application (사증발급신청서) form-filling tool as a made-for-x
feature. Users fill a web form and download the ORIGINAL official PDF with their
answers drawn onto it. Everything runs client-side: the PDF, the entered data, and
the generated file never leave the browser.

Scope is deliberately narrow: **only the bundled Korean visa form**. No PDF upload,
no AI analysis, no calibration tooling. The PdfToFormToPdf repo remains the lab
where templates are calibrated; improved templates are re-copied as one JSON file.

## Route & file placement

| What | Where |
| --- | --- |
| Route (server, metadata + SEO) | `src/app/korea-visa/page.tsx` |
| Client tool component | `src/components/KoreaVisa/KoreaVisaTool.tsx` |
| Form renderer / preview / field widgets | `src/components/KoreaVisa/{FormView,PdfPreview,fields}.tsx` |
| Fill engine (pdf-lib + fontkit shim, layout) | `src/lib/korea-visa/fill/` |
| Form state (zustand store), drafts, visibility | `src/lib/korea-visa/form/` |
| pdf.js wrapper, sha256 (with pure-JS fallback), coords | `src/lib/korea-visa/pdf/` |
| Template schema (zod) + bundled-template lookup | `src/lib/korea-visa/template/` |
| Golden template (84 fields, keyed by PDF SHA-256) | `src/lib/korea-visa/templates/ksa-visa-v1.json` |
| Official blank PDF (296 KB, committed) | `public/samples/visa-application.pdf` |
| Asset copy script (postinstall) | `scripts/copy-assets.mts` |

Modules are copied near-verbatim from the source project, with import paths
rewritten to `@/lib/korea-visa/...` and source formatting adapted to made-for-x
Prettier rules (single quotes).

## Page UX

The page IS the visa form — no idle/upload stage:

1. On mount, fetch `/samples/visa-application.pdf`, hash it (Web Crypto, pure-JS
   fallback on insecure origins), and look up the bundled template by hash.
2. Show the sectioned web form (left) and a live filled-PDF preview (right,
   sticky). Field labels stay Korean + English as printed on the official form.
3. Page chrome (headings, buttons, banners) is **Japanese + English** bilingual,
   e.g. 「記入済みPDFをダウンロード / Download filled PDF」.
4. A visible privacy line: 「PDFと入力内容はブラウザ内で処理され、サーバーには送信
   されません / Your PDF and answers never leave your browser」.

### Draft auto-save

Ported as built: every change is debounce-saved (300 ms) to
`localStorage["korea-visa:draft:<sha256>"]` (key prefix renamed from the source
project's `pdf2form:` for this codebase; fresh origin, so nothing to migrate). On revisit the draft is restored with a
chip 「下書きを復元しました / Draft restored」+ timestamp. A subtle 「自動保存済み /
Auto-saved」 indicator shows while editing.

### Data deletion (new requirements)

- **Download wipes data.** After the download is triggered, the tool deletes the
  localStorage draft and clears all form values, then shows a notice:
  「ダウンロードしました。入力内容は削除されました / Downloaded — your entered data
  has been cleared」. Rationale: once the user has the filled PDF, no personal
  data should remain in the browser.
- **Clear all button.** A 「すべてクリア / Clear all」 button in the toolbar wipes
  form values + stored draft. Two-step inline confirm (first click arms the
  button — 「本当に? / Sure?」 — second click clears; clicking elsewhere disarms)
  to prevent accidental data loss. No native `confirm()` dialogs.
- The old 다른 PDF / reset button is dropped (there is nothing to reset to).

### Error states

- Sample fetch failure → error banner (JA/EN) with the cause; no dead buttons.
- Hash mismatch against the bundled template (should never happen; guards a
  corrupted deploy) → error banner asking the user to reload.

## Store simplification

The zustand store is copied minus everything analyze-related: no `analyzing`
stage, no vision imports, no `ResolveIssue`, no `templateSource` branching
(always bundled), no `reset()`. Stages collapse to `loading | form | error`.
New actions: `clearAll()` (values + draft wipe) and the post-download wipe reuses
it. Draft persistence (`persistDraft` sha-guarded debounce) is unchanged.

## Dependencies & build wiring

New runtime deps: `pdf-lib`, `fontkit`, `pdfjs-dist` (pinned to the same version
whose worker is copied), `zustand`, `zod`, `@expo-google-fonts/noto-sans-kr`.
New dev dep: `@types/fontkit`.

`scripts/copy-assets.mts` (ported) copies from node_modules into `public/`:

- `pdf.worker.min.mjs` (pdf.js worker, version-locked to the API)
- `fonts/NotoSansKR-Regular.ttf` (5.9 MB, embedded into filled PDFs)

`postinstall` becomes `prisma generate && tsx scripts/copy-assets.mts`; both
copied files are gitignored (Vercel runs postinstall during build). The font
stays full-size because applicants enter arbitrary CJK (漢字姓名 field); it is
fetched lazily only when this page fills a PDF. Subsetting is a future
optimization, out of scope.

React 18 / Tailwind 3 compatibility was verified: the ported code uses only
classic hooks and no Tailwind-4-only utilities.

## Testing

Ported from vitest to Jest (node environment, colocated `__tests__/` per
made-for-x convention):

- **sha256** — NIST vectors on both paths (Web Crypto and pure-JS fallback) +
  cross-path parity across padding-boundary lengths.
- **drafts** — save/load/clear/debounce/corrupt-entry behavior with stubbed
  localStorage.
- **template contract** — bundled template parses against the zod schema, has 84
  fields, and its `pdf.sha256` matches the committed sample PDF.
- **fill roundtrip** — fill golden values into the real sample PDF, re-extract
  text with pdf.js, assert values render under their labels and checkbox marks
  are real ✓ (U+2713).
- **store** — download-wipe and clear-all leave no values and no draft behind.

No Playwright in made-for-x; the final gate is a manual browser pass on the dev
server (form fill, preview, download, wipe-after-download, clear-all, draft
restore) before the PR.

## Publication touches

- Tool card on the Home component, consistent with existing cards.
- Page metadata (JA title/description) + JSON-LD following the SEO pattern from
  commit `84c617a`; add the tool to `llms.txt` if it enumerates tools.
- Branch `feat/korea-visa-form` → PR to `main` (never commit to main).

## Out of scope

- PDF upload of any kind; other visa forms or templates
- AI/vision analysis, calibration page, template store beyond the bundled lookup
- Font subsetting; Playwright e2e in made-for-x
- Server-side anything: no API routes, no DB models
