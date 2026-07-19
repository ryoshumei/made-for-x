/**
 * Draft persistence: form values auto-saved per PDF hash to localStorage.
 * Client-side only — drafts never leave the browser (same privacy model as
 * the template store). Keyed by SHA-256 so a draft can never apply to a
 * byte-different document; empty values delete the entry; corrupt entries
 * are dropped on read; writes are best-effort (quota errors swallowed).
 */
import type { FormValues } from '../template/schema';

const LS_PREFIX = 'korea-visa:draft:';
export const DRAFT_DEBOUNCE_MS = 300;

export interface Draft {
  savedAt: string;
  values: FormValues;
}

export function loadDraft(sha256: string): Draft | null {
  if (typeof window === 'undefined') return null;
  const key = LS_PREFIX + sha256;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Draft;
    const ok =
      d !== null &&
      typeof d === 'object' &&
      typeof d.savedAt === 'string' &&
      d.values !== null &&
      typeof d.values === 'object' &&
      Object.keys(d.values).length > 0;
    if (!ok) throw new Error('malformed draft');
    return d;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

/** Returns savedAt when stored; null when values were empty (key deleted) or the write failed. */
export function saveDraft(sha256: string, values: FormValues): string | null {
  if (typeof window === 'undefined') return null;
  const key = LS_PREFIX + sha256;
  try {
    if (Object.keys(values).length === 0) {
      window.localStorage.removeItem(key);
      return null;
    }
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(key, JSON.stringify({ savedAt, values } satisfies Draft));
    return savedAt;
  } catch {
    return null;
  }
}

export function clearDraft(sha256: string): void {
  cancelPendingDraftSave();
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LS_PREFIX + sha256);
}

let pending: ReturnType<typeof setTimeout> | null = null;

/** Debounced saveDraft; onSaved fires with its result after the write lands. */
export function saveDraftDebounced(
  sha256: string,
  values: FormValues,
  onSaved?: (savedAt: string | null) => void,
  ms = DRAFT_DEBOUNCE_MS
): void {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    const savedAt = saveDraft(sha256, values);
    onSaved?.(savedAt);
  }, ms);
}

export function cancelPendingDraftSave(): void {
  if (pending) clearTimeout(pending);
  pending = null;
}
