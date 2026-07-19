/**
 * Browser pdfjs singleton. The worker is a plain string URL served from
 * /public (copied by postinstall from the SAME pinned package as the API,
 * so worker and API versions can never diverge). Never import this from
 * module top level of a component — call getPdfjs() inside effects and
 * handlers so the library stays out of the SSR module graph.
 */
export type Pdfjs = typeof import('pdfjs-dist');

let promise: Promise<Pdfjs> | null = null;

export function getPdfjs(): Promise<Pdfjs> {
  if (!promise) {
    promise = import('pdfjs-dist').then((m) => {
      m.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return m;
    });
  }
  return promise;
}

export type PdfjsDocumentProxy = Awaited<ReturnType<Pdfjs['getDocument']>['promise']>;

/** pdfjs transfers (detaches) the buffer — always hand it a copy. */
export async function openPdf(bytes: Uint8Array): Promise<PdfjsDocumentProxy> {
  const pdfjs = await getPdfjs();
  return pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
}
