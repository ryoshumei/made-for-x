'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { openPdf, type PdfjsDocumentProxy } from '@/lib/korea-visa/pdf/pdfjs';
import { renderPageToCanvas } from '@/lib/korea-visa/pdf/renderPages';

/**
 * Renders the FILLED bytes (the exact bytes the download button saves) —
 * true WYSIWYG, not an approximation overlay.
 */
export function PdfPreview({
  bytes,
  pageCount,
  filling,
}: {
  bytes: Uint8Array | null;
  pageCount: number;
  filling: boolean;
}) {
  const [page, setPage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PdfjsDocumentProxy | null>(null);
  const renderSeq = useRef(0);

  // Each render paints a FRESH offscreen canvas; only the newest completed
  // frame is blitted to the visible one. Two in-flight pdfjs renders can
  // therefore never interleave on the same canvas, and a render cancelled
  // mid-paint (doc.destroy on rapid re-fills) can't leave the visible
  // canvas black or mid-transform — it keeps the last good frame.
  const draw = useCallback(async (doc: PdfjsDocumentProxy, pageIndex: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const my = ++renderSeq.current;
    const off = document.createElement('canvas');
    try {
      await renderPageToCanvas(doc, pageIndex, off, wrap.clientWidth);
    } catch (e) {
      // cancellations are expected control flow when a newer fill wins
      const cancelled = (e as { name?: string })?.name === 'RenderingCancelledException';
      if (!cancelled && renderSeq.current === my) console.error('[preview]', e);
      return;
    }
    const dst = canvasRef.current;
    if (renderSeq.current !== my || !dst) return; // a newer frame superseded this one
    dst.width = off.width;
    dst.height = off.height;
    dst.style.width = off.style.width;
    dst.style.height = off.style.height;
    dst.getContext('2d')!.drawImage(off, 0, 0);
  }, []);

  useEffect(() => {
    if (!bytes) return;
    let cancelled = false;
    (async () => {
      const doc = await openPdf(bytes);
      if (cancelled) {
        await doc.destroy();
        return;
      }
      const old = docRef.current;
      docRef.current = doc;
      if (old) await old.destroy().catch(() => {});
      await draw(doc, page);
    })().catch((e) => console.error('[preview]', e));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, draw]);

  useEffect(() => {
    const doc = docRef.current;
    if (doc) void draw(doc, page);
  }, [page, draw]);

  useEffect(
    () => () => {
      renderSeq.current++; // strand any in-flight frame
      docRef.current?.destroy().catch(() => {});
      docRef.current = null;
    },
    []
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPage(i)}
            className={`rounded px-2.5 py-1 text-xs ${
              page === i
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span
          className={`ml-2 text-xs text-neutral-400 transition-opacity ${filling ? 'opacity-100' : 'opacity-0'}`}
        >
          렌더링 중…
        </span>
      </div>
      <div
        ref={wrapRef}
        className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
      >
        {bytes ? (
          <canvas ref={canvasRef} data-testid="preview-canvas" className="block w-full" />
        ) : (
          <div className="flex aspect-[595/841] items-center justify-center text-sm text-neutral-400">
            미리보기 준비 중…
          </div>
        )}
      </div>
    </div>
  );
}
