/**
 * The simplified store: bundled-template-only loading, draft restore, and
 * the two data-deletion paths (clear all / wipe after download) — both must
 * leave NO values in memory and NO draft in localStorage.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DRAFT_DEBOUNCE_MS } from '../drafts';
import { useKoreaVisaStore } from '../state';

const sampleBytes = () =>
  new Uint8Array(readFileSync(join(process.cwd(), 'public/samples/visa-application.pdf')));
const SAMPLE_SHA = '1ba3935fdaab49ef5459a500a8f85a4bccd378edc4483b1342587fd595e8dffa';
const DRAFT_KEY = `korea-visa:draft:${SAMPLE_SHA}`;

// Minimal localStorage for the node environment.
function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  } as Storage;
}

const flushDebounce = () => new Promise((r) => setTimeout(r, DRAFT_DEBOUNCE_MS + 100));

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true });
  useKoreaVisaStore.setState({
    stage: 'loading',
    pdfBytes: null,
    sha256: null,
    template: null,
    values: {},
    fillWarnings: [],
    error: null,
    draftSavedAt: null,
    draftRestored: false,
    downloadNoticeVisible: false,
  });
});

it('loads the bundled template from the sample bytes', async () => {
  await useKoreaVisaStore.getState().loadPdf(sampleBytes());
  const s = useKoreaVisaStore.getState();
  expect(s.stage).toBe('form');
  expect(s.sha256).toBe(SAMPLE_SHA);
  expect(s.template?.fields.length).toBe(84);
});

it('errors (not silently proceeds) when the bytes match no bundled template', async () => {
  await useKoreaVisaStore.getState().loadPdf(new Uint8Array([1, 2, 3]));
  const s = useKoreaVisaStore.getState();
  expect(s.stage).toBe('error');
  expect(s.error).toBeTruthy();
});

it('persists edits as a draft and restores them on the next load', async () => {
  await useKoreaVisaStore.getState().loadPdf(sampleBytes());
  useKoreaVisaStore.getState().setValue('s1_family_name', 'LIANG');
  await flushDebounce();
  expect(localStorage.getItem(DRAFT_KEY)).toContain('LIANG');
  expect(useKoreaVisaStore.getState().draftSavedAt).toBeTruthy();

  await useKoreaVisaStore.getState().loadPdf(sampleBytes());
  const s = useKoreaVisaStore.getState();
  expect(s.draftRestored).toBe(true);
  expect(s.values['s1_family_name']).toBe('LIANG');
});

it('clearAll wipes values AND the stored draft', async () => {
  await useKoreaVisaStore.getState().loadPdf(sampleBytes());
  useKoreaVisaStore.getState().setValue('s1_family_name', 'LIANG');
  await flushDebounce();
  useKoreaVisaStore.getState().clearAll();
  await flushDebounce(); // a late debounce write must not resurrect the draft
  const s = useKoreaVisaStore.getState();
  expect(s.values).toEqual({});
  expect(s.draftSavedAt).toBeNull();
  expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
});

it('completeDownload wipes like clearAll and raises the notice', async () => {
  await useKoreaVisaStore.getState().loadPdf(sampleBytes());
  useKoreaVisaStore.getState().setValue('s1_family_name', 'LIANG');
  await flushDebounce();
  useKoreaVisaStore.getState().completeDownload();
  const s = useKoreaVisaStore.getState();
  expect(s.values).toEqual({});
  expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  expect(s.downloadNoticeVisible).toBe(true);
  // next edit hides the notice
  useKoreaVisaStore.getState().setValue('s1_given_name', 'HYUKJIN');
  expect(useKoreaVisaStore.getState().downloadNoticeVisible).toBe(false);
});
