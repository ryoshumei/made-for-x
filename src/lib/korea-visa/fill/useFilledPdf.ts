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
): {
  filledBytes: Uint8Array | null;
  filling: boolean;
  stale: boolean;
  fillError: string | null;
} {
  const [filledBytes, setFilledBytes] = useState<Uint8Array | null>(null);
  const [filling, setFilling] = useState(false);
  const [fillError, setFillError] = useState<string | null>(null);
  // The store hands out a fresh `values` object on every change, so a plain
  // reference check tells us whether filledBytes still reflects the latest
  // input — that's what the download button gates on to avoid shipping
  // stale bytes.
  const lastFilledValues = useRef<FormValues | null>(null);
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
            lastFilledValues.current = values;
            setFillError(null);
            warnRef.current?.(warnings);
          }
        } catch (err) {
          // A failed font fetch would otherwise cache a rejected promise
          // forever, permanently bricking every future fill — clear it so
          // the next attempt retries instead of failing silently forever.
          fontCache = null;
          console.error('[fill]', err);
          if (token.current === my) {
            setFillError(err instanceof Error ? err.message : String(err));
          }
        } finally {
          if (token.current === my) setFilling(false);
        }
      },
      pdfBytes && template ? debounceMs : 0
    );
    return () => clearTimeout(timer);
  }, [pdfBytes, template, values, debounceMs]);

  const stale = values !== lastFilledValues.current || filling;

  return { filledBytes, filling, stale, fillError };
}
