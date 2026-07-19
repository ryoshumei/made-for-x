/**
 * Page rendering (browser only — requires canvas).
 * The analyze pipeline renders at ~1568 px long edge (Claude vision's
 * sweet spot); the live preview renders at the container's pixel width.
 */
import type { PdfjsDocumentProxy } from './pdfjs';

export async function renderPageToCanvas(
  doc: PdfjsDocumentProxy,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  cssWidth: number
): Promise<void> {
  const page = await doc.getPage(pageIndex + 1);
  const base = page.getViewport({ scale: 1 });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = (cssWidth / base.width) * dpr;
  const viewport = page.getViewport({ scale });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
}

export async function renderPageToPngBase64(
  doc: PdfjsDocumentProxy,
  pageIndex: number,
  longEdge = 1568
): Promise<string> {
  const page = await doc.getPage(pageIndex + 1);
  const base = page.getViewport({ scale: 1 });
  const scale = longEdge / Math.max(base.width, base.height);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}
