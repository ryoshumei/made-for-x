import { act, renderHook } from '@testing-library/react';
import type { FormTemplate, FormValues } from '@/lib/korea-visa/template/schema';
import { useFilledPdf } from '@/lib/korea-visa/fill/useFilledPdf';

// Keep this test light: no real PDF/font bytes ever get parsed or fetched.
// A fresh object/array per call mirrors the real fillPdf, which always
// returns a brand-new Uint8Array from doc.save() — a memoized mock value
// would falsely trigger React's same-reference setState bailout below.
jest.mock('@/lib/korea-visa/fill/fillPdf', () => ({
  fillPdf: jest.fn().mockImplementation(async () => ({ bytes: new Uint8Array([1]), warnings: [] })),
}));
jest.mock('@/lib/korea-visa/fill/fonts', () => ({
  loadFontBytes: jest
    .fn()
    .mockImplementation(async () => ({ primary: new Uint8Array([9]), fallbacks: [] })),
}));

const pdfBytes = new Uint8Array([0]);
const template = {} as unknown as FormTemplate;

describe('useFilledPdf stale tracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is stale until the fill for the CURRENT values object finishes', async () => {
    const valuesA: FormValues = { name: 'a' };
    const { result, rerender } = renderHook(
      ({ values }) => useFilledPdf(pdfBytes, template, values, undefined, 400),
      { initialProps: { values: valuesA } }
    );

    // Nothing has been filled yet — definitely stale.
    expect(result.current.stale).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(400);
    });

    // Debounce fired, the (mocked) fill resolved for valuesA.
    expect(result.current.stale).toBe(false);
    expect(result.current.filledBytes).toEqual(new Uint8Array([1]));

    // A fresh values object (as the store produces on every change) must
    // flip stale back to true immediately, before the debounce even runs —
    // this is what guards the download button against shipping old bytes.
    const valuesB: FormValues = { name: 'ab' };
    rerender({ values: valuesB });
    expect(result.current.stale).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(400);
    });

    expect(result.current.stale).toBe(false);
  });
});
