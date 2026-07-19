/**
 * App state (client only). The PDF bytes live HERE, in browser memory —
 * they are hashed and read locally and never uploaded anywhere. Simplified
 * from the source project: the template is always the bundled one, so there
 * is no analyzing stage and no template-source branching.
 */
'use client';

import { create } from 'zustand';
import { sha256Hex } from '../pdf/sha256';
import { lookupTemplate } from '../template/store';
import { clearDraft, loadDraft, saveDraftDebounced } from './drafts';
import type { FieldValue, FormTemplate, FormValues } from '../template/schema';

export type Stage = 'loading' | 'form' | 'error';

interface KoreaVisaState {
  stage: Stage;
  pdfBytes: Uint8Array | null;
  sha256: string | null;
  template: FormTemplate | null;
  values: FormValues;
  fillWarnings: string[];
  error: string | null;
  /** ISO timestamp of the last persisted draft write, for the UI indicator. */
  draftSavedAt: string | null;
  /** True when loadPdf restored a saved draft (drives the restore chip). */
  draftRestored: boolean;
  /** True right after a download wiped the data (drives the notice banner). */
  downloadNoticeVisible: boolean;

  loadPdf(bytes: Uint8Array): Promise<void>;
  setValue(fieldId: string, value: FieldValue | undefined): void;
  setValues(values: FormValues): void;
  setFillWarnings(warnings: string[]): void;
  /** Surface a load failure that happened before loadPdf could run. */
  setError(error: string): void;
  /** すべてクリア: wipe entered values AND the stored draft. */
  clearAll(): void;
  /** Post-download privacy wipe: clearAll + the "data cleared" notice. */
  completeDownload(): void;
}

export const useKoreaVisaStore = create<KoreaVisaState>((set, get) => {
  // Write-through draft persistence: every value change lands in
  // localStorage after the debounce window. The sha guard keeps a late
  // callback from flagging a wiped/reloaded session as saved.
  const persistDraft = (values: FormValues) => {
    const sha = get().sha256;
    if (!sha) return;
    saveDraftDebounced(sha, values, (savedAt) => {
      if (get().sha256 === sha) set({ draftSavedAt: savedAt });
    });
  };

  return {
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

    async loadPdf(bytes) {
      set({
        stage: 'loading',
        error: null,
        pdfBytes: bytes,
        values: {},
        fillWarnings: [],
        draftSavedAt: null,
        draftRestored: false,
        downloadNoticeVisible: false,
      });
      try {
        const sha = await sha256Hex(bytes);
        const template = lookupTemplate(sha);
        if (!template) {
          set({
            stage: 'error',
            error:
              'フォームデータの検証に失敗しました。ページを再読み込みしてください。 / The bundled form failed verification — please reload the page.',
          });
          return;
        }
        const draft = loadDraft(sha);
        const restored = draft
          ? { values: draft.values, draftRestored: true, draftSavedAt: draft.savedAt }
          : {};
        set({ sha256: sha, template, stage: 'form', ...restored });
      } catch (err) {
        set({ stage: 'error', error: err instanceof Error ? err.message : String(err) });
      }
    },

    setValue(fieldId, value) {
      const values = { ...get().values };
      if (value === undefined) delete values[fieldId];
      else values[fieldId] = value;
      set({ values, downloadNoticeVisible: false });
      persistDraft(values);
    },

    setValues(values) {
      set({ values, downloadNoticeVisible: false });
      persistDraft(values);
    },

    setFillWarnings(fillWarnings) {
      const prev = get().fillWarnings;
      if (prev.length === fillWarnings.length && prev.every((w, i) => w === fillWarnings[i]))
        return;
      set({ fillWarnings });
    },

    setError(error) {
      set({ stage: 'error', error });
    },

    clearAll() {
      const sha = get().sha256;
      if (sha) clearDraft(sha);
      set({ values: {}, draftRestored: false, draftSavedAt: null, downloadNoticeVisible: false });
    },

    completeDownload() {
      get().clearAll();
      set({ downloadNoticeVisible: true });
    },
  };
});
