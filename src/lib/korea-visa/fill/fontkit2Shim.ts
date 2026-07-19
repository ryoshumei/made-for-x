/**
 * pdf-lib 1.x expects fontkit 1's streaming subset API
 * (subset.encodeStream() → node stream). fontkit 2 replaced it with a
 * synchronous subset.encode() → Uint8Array — and, crucially, its TTF
 * subsetter produces glyphs that actually render (the @pdf-lib/fontkit fork
 * mangles Noto Sans KR outlines; see the font repro in scripts/).
 *
 * This shim adapts fontkit 2 to the interface pdf-lib consumes: it wraps
 * createSubset() so the returned subset exposes encodeStream() emitting the
 * encode() result. Everything else passes through untouched.
 */
import * as fontkit2 from 'fontkit';

type AnyFont = Record<string, unknown> & {
  createSubset(): { encode(): Uint8Array } & Record<string, unknown>;
};

interface MiniStream {
  on(event: string, cb: (arg?: unknown) => void): MiniStream;
}

function wrapFont<T extends AnyFont>(font: T): T {
  const proxy = Object.create(font) as T;
  proxy.createSubset = () => {
    const subset = font.createSubset();
    const wrapped = Object.create(subset) as typeof subset & { encodeStream(): MiniStream };
    wrapped.encodeStream = () => {
      const listeners: Record<string, ((arg?: unknown) => void)[]> = {};
      const stream: MiniStream = {
        on(event, cb) {
          (listeners[event] ??= []).push(cb);
          return stream;
        },
      };
      queueMicrotask(() => {
        try {
          const bytes = subset.encode();
          for (const cb of listeners.data ?? []) cb(bytes);
          for (const cb of listeners.end ?? []) cb();
        } catch (err) {
          for (const cb of listeners.error ?? []) cb(err);
          if (!listeners.error?.length) throw err;
        }
      });
      return stream;
    };
    return wrapped;
  };
  return proxy;
}

/** Drop-in replacement for `import fontkit from "@pdf-lib/fontkit"`. */
export const fontkitForPdfLib = {
  create(bytes: Uint8Array): unknown {
    const font = (fontkit2 as unknown as { create(b: Uint8Array): AnyFont }).create(bytes);
    return wrapFont(font);
  },
};
