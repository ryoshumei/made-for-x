/**
 * Draft persistence: localStorage-backed, corrupt-tolerant, debounced.
 * Keyed by PDF sha so multiple forms could coexist.
 */
import { DRAFT_DEBOUNCE_MS, clearDraft, loadDraft, saveDraft, saveDraftDebounced } from '../drafts';

const SHA = 'a'.repeat(64);
const KEY = `korea-visa:draft:${SHA}`;

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

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true });
});

it('round-trips values with a savedAt timestamp under the korea-visa key', () => {
  const savedAt = saveDraft(SHA, { f1: 'v1' });
  expect(savedAt).toBeTruthy();
  expect(localStorage.getItem(KEY)).toBeTruthy();
  expect(loadDraft(SHA)).toEqual({ savedAt, values: { f1: 'v1' } });
});

it('saving empty values deletes the entry', () => {
  saveDraft(SHA, { f1: 'v1' });
  saveDraft(SHA, {});
  expect(localStorage.getItem(KEY)).toBeNull();
  expect(loadDraft(SHA)).toBeNull();
});

it('drops corrupt entries instead of throwing', () => {
  localStorage.setItem(KEY, '{not json');
  expect(loadDraft(SHA)).toBeNull();
});

it('debounces writes and reports savedAt via callback', async () => {
  const seen: (string | null)[] = [];
  saveDraftDebounced(SHA, { f1: 'a' }, (t) => seen.push(t));
  saveDraftDebounced(SHA, { f1: 'b' }, (t) => seen.push(t));
  expect(localStorage.getItem(KEY)).toBeNull(); // nothing yet
  await new Promise((r) => setTimeout(r, DRAFT_DEBOUNCE_MS + 100));
  expect(seen).toHaveLength(1); // coalesced
  expect(loadDraft(SHA)?.values).toEqual({ f1: 'b' });
});

it('clearDraft cancels a pending debounced save', async () => {
  saveDraftDebounced(SHA, { f1: 'a' });
  clearDraft(SHA);
  await new Promise((r) => setTimeout(r, DRAFT_DEBOUNCE_MS + 100));
  expect(localStorage.getItem(KEY)).toBeNull();
});
