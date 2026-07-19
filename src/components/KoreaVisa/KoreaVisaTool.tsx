'use client';

import { useEffect, useState } from 'react';
import { useKoreaVisaStore } from '@/lib/korea-visa/form/state';
import { useFilledPdf } from '@/lib/korea-visa/fill/useFilledPdf';
import { FormView } from './FormView';
import { PdfPreview } from './PdfPreview';

const PDF_URL = '/samples/visa-application.pdf';
const OFFICIAL_PORTAL_URL = 'https://overseas.mofa.go.kr/';
const FORM_REFERENCE_URL = 'https://overseas.mofa.go.kr/jp-ja/brd/m_1106/view.do?seq=758554&page=1';
const FORM_VERSION_JA =
  '収録様式: 사증발급신청서 — 出入国管理法施行規則 別紙第17号書式（2022年2月7日改正）・2026-07-19収録';
const FORM_VERSION_EN =
  'Bundled form: Visa Application Form, MOJ Enforcement Rule attachment No. 17 (rev. 2022-02-07, bundled 2026-07-19)';

export function KoreaVisaTool() {
  const s = useKoreaVisaStore();
  const { filledBytes, filling, stale, fillError } = useFilledPdf(
    s.pdfBytes,
    s.template,
    s.values,
    s.setFillWarnings
  );
  const [clearArmed, setClearArmed] = useState(false);

  // The page IS the form: fetch the bundled official PDF once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(PDF_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (!cancelled) await useKoreaVisaStore.getState().loadPdf(bytes);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          useKoreaVisaStore
            .getState()
            .setError(`公式PDFを読み込めませんでした / Failed to load the form PDF: ${msg}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Armed clear button disarms on its own after a few seconds.
  useEffect(() => {
    if (!clearArmed) return;
    const t = setTimeout(() => setClearArmed(false), 4000);
    return () => clearTimeout(t);
  }, [clearArmed]);

  const download = () => {
    if (!filledBytes || stale) return;
    const blob = new Blob([filledBytes.slice() as unknown as BlobPart], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa-application-filled.pdf';
    a.click();
    URL.revokeObjectURL(url);
    // Privacy wipe: once the user has the file, nothing personal stays behind.
    s.completeDownload();
  };

  const onClearClick = () => {
    if (!clearArmed) {
      setClearArmed(true);
      return;
    }
    setClearArmed(false);
    s.clearAll();
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 text-neutral-900">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">
          韓国ビザ申請書 入力ツール{' '}
          <span className="text-base font-medium text-neutral-600">
            사증발급신청서 / Korea Visa Application Filler
          </span>
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          公式PDFにブラウザだけで記入し、そのままダウンロード / Fill the official PDF entirely in
          your browser
        </p>
      </header>

      <div className="mb-4 space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <p>
          本ツールは非公式の入力補助ツールであり、韓国政府・大使館・領事館とは一切関係ありません。 /
          Unofficial helper tool — not affiliated with the Korean government or any consulate.
        </p>
        <p>
          {FORM_VERSION_JA} / {FORM_VERSION_EN}{' '}
          <a
            href={FORM_REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            参照元 / Reference
          </a>
        </p>
        <p>
          <a
            href={OFFICIAL_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            最新の公式様式はこちらで確認 / Verify the current official form here
            (overseas.mofa.go.kr)
          </a>
        </p>
      </div>

      <p className="mb-4 text-xs text-neutral-500">
        PDFと入力内容はブラウザ内で処理され、サーバーには送信されません。 / Your PDF and answers
        never leave your browser.
      </p>

      {s.stage === 'error' && (
        <div
          data-testid="load-error"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {s.error}
        </div>
      )}

      {s.stage === 'loading' && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 pt-24 text-sm text-neutral-600">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p>フォームを準備中… / Preparing the form…</p>
        </div>
      )}

      {s.stage === 'form' && s.template && (
        <>
          {fillError && (
            <div
              data-testid="fill-error"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              PDFの生成に失敗しました。接続を確認してもう一度入力してください / Failed to generate
              the PDF — check your connection and edit a field to retry: {fillError}
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" data-testid="toolbar">
            {s.downloadNoticeVisible && (
              <span
                data-testid="download-notice"
                className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800"
              >
                ダウンロードしました。入力内容は削除されました / Downloaded — your entered data has
                been cleared
              </span>
            )}
            {s.draftRestored && (
              <span
                data-testid="draft-banner"
                className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs text-purple-700"
              >
                下書きを復元しました / Draft restored
                {s.draftSavedAt ? ` · ${new Date(s.draftSavedAt).toLocaleString()}` : ''}
              </span>
            )}
            {s.fillWarnings.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700">
                ⚠ {s.fillWarnings.length}項目が枠に収まっていません / fields overflow their boxes
              </span>
            )}
            <span className="grow" />
            {s.draftSavedAt && (
              <span data-testid="draft-saved" className="text-xs text-neutral-400">
                自動保存済み / Auto-saved
              </span>
            )}
            <button
              type="button"
              data-testid="clear-all"
              onClick={onClearClick}
              onBlur={() => setClearArmed(false)}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                clearArmed
                  ? 'border-red-400 bg-red-50 font-medium text-red-700'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {clearArmed ? '本当に削除しますか？ / Sure?' : 'すべてクリア / Clear all'}
            </button>
            <button
              type="button"
              data-testid="download"
              onClick={download}
              disabled={!filledBytes || stale}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              記入済みPDFをダウンロード / Download filled PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,480px)]">
            <div className="min-w-0">
              <FormView
                template={s.template}
                values={s.values}
                warnings={s.fillWarnings}
                onChange={s.setValue}
              />
            </div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <PdfPreview
                bytes={filledBytes}
                pageCount={s.template.pdf.pageCount}
                filling={filling}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
