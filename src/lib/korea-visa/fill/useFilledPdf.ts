/**
 * Debounced live fill: whenever values change, re-run the REAL fill engine
 * on the original bytes and expose the filled bytes for preview/download.
 * What you see is exactly what downloads.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormTemplate, FormValues } from '../template/schema';
import { fillPdf } from './fillPdf';
import { loadFontBytes } from './fonts';

let fontCache: Promise<Uint8Array> | null = null;
const getFont = () => (fontCache ??= loadFontBytes());

export function useFilledPdf(
  pdfBytes: Uint8Array | null,
  template: FormTemplate | null,
  values: FormValues,
  onWarnings?: (w: string[]) => void,
  debounceMs = 400
): { filledBytes: Uint8Array | null; filling: boolean } {
  const [filledBytes, setFilledBytes] = useState<Uint8Array | null>(null);
  const [filling, setFilling] = useState(false);
  const token = useRef(0);
  const warnRef = useRef(onWarnings);

  useEffect(() => {
    warnRef.current = onWarnings;
  }, [onWarnings]);

  useEffect(() => {
    const my = ++token.current;
    // All state updates happen inside the (debounced) timer, never
    // synchronously in the effect body.
    const timer = setTimeout(
      async () => {
        if (!pdfBytes || !template) {
          setFilledBytes(null);
          return;
        }
        setFilling(true);
        try {
          const font = await getFont();
          const { bytes, warnings } = await fillPdf(pdfBytes, template, values, font);
          if (token.current === my) {
            setFilledBytes(bytes);
            warnRef.current?.(warnings);
          }
        } catch (err) {
          console.error('[fill]', err);
        } finally {
          if (token.current === my) setFilling(false);
        }
      },
      pdfBytes && template ? debounceMs : 0
    );
    return () => clearTimeout(timer);
  }, [pdfBytes, template, values, debounceMs]);

  return { filledBytes, filling };
}
