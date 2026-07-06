'use client';

import React, { useMemo, useState, FormEvent } from 'react';
import { Calendar, CalendarPlus, Download, MapPin, Trash2, Search } from 'lucide-react';
import { formatSchedule } from '@/lib/waste/schedule-format';
import { buildIcs, buildRecurrenceRule, nextOccurrence } from '@/lib/waste/calendar';
import type { Schedule } from '@/lib/waste/types';

interface Area {
  areaName: string;
  addressDetail?: string | null;
  schedules: Schedule[];
}
interface LookupResponse {
  success: boolean;
  zipcode: string;
  city: { cityCode: string; name: string; prefecture: string };
  towns: string[];
  matchType: 'town' | 'city';
  count: number;
  areas: Area[];
}

const WT_COLOR: Record<string, string> = {
  burnable: 'bg-red-50 text-red-800 border-red-200',
  non_burnable: 'bg-blue-50 text-blue-800 border-blue-200',
  recyclable: 'bg-green-50 text-green-800 border-green-200',
  pet_bottles: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  bottles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cans: 'bg-gray-50 text-gray-800 border-gray-200',
  metals: 'bg-slate-50 text-slate-800 border-slate-200',
  paper: 'bg-amber-50 text-amber-800 border-amber-200',
  cardboard: 'bg-orange-50 text-orange-800 border-orange-200',
  plastic: 'bg-purple-50 text-purple-800 border-purple-200',
  hazardous: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  valuables: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  clothing: 'bg-pink-50 text-pink-800 border-pink-200',
  branches: 'bg-lime-50 text-lime-800 border-lime-200',
  large_waste: 'bg-stone-50 text-stone-800 border-stone-200',
};

function ymd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

// collection_dates that haven't passed yet (local-date compare, includes today)
function upcomingDates(s: Schedule): string[] {
  const today = ymd(new Date());
  return (s.collectionDates ?? []).filter((d) => d.replace(/-/g, '') >= today);
}

// Every schedule opens a prefilled Google Calendar event.
// - Recurring patterns (weekly / Nth-weekday / day-of-month) get an RRULE, so a
//   single event covers the whole series.
// - Explicit-date schedules (collection_dates) can't be one RRULE, and Google's
//   template URL is single-event, so we add the NEXT pickup as the event and
//   list the remaining dates in the notes for reference.
function addToGoogleCalendar(area: Area, s: Schedule, cityName: string) {
  const label = s.wasteTypeJa ?? s.wasteType;
  const start = nextOccurrence(s, new Date()) ?? new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const recur = buildRecurrenceRule(s);
  let details = `${formatSchedule(s)}\n地域: ${area.areaName}（${cityName}）`;

  if (!recur && s.collectionDates?.length) {
    const upcoming = upcomingDates(s).map((d) => {
      const [, m, day] = d.split('-');
      return `${Number(m)}/${Number(day)}`;
    });
    if (upcoming.length) details += `\n収集日（今後）: ${upcoming.join('、')}`;
  }

  const params = new URLSearchParams({
    text: `${label}収集 - ${area.areaName}`,
    dates: `${ymd(start)}/${ymd(end)}`,
    details,
    location: `${area.areaName}、${cityName}`,
  });
  // The seed date must be a real instance of the rule (e.g. an actual
  // 1st-Wednesday), or Google infers the recurrence from the start date.
  if (recur) params.append('recur', recur);
  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`,
    '_blank'
  );
}

// Footer for areas with irregular explicit-date schedules: one .ics bundles
// every upcoming pickup across those waste types (Google's template URL is
// single-event, so bulk registration is only possible via .ics import).
function IcsBulkExport({ area, cityName }: { area: Area; cityName: string }) {
  const [helpOpen, setHelpOpen] = useState(false);

  const targets = area.schedules
    .map((s) => ({ s, dates: upcomingDates(s) }))
    .filter(
      ({ s, dates }) =>
        !buildRecurrenceRule(s) && (s.collectionDates?.length ?? 0) > 0 && dates.length > 0
    );
  if (targets.length === 0) return null;

  const typeNames = targets.map(({ s }) => s.wasteTypeJa ?? s.wasteType).join('・');
  const total = targets.reduce((n, { dates }) => n + dates.length, 0);

  const download = () => {
    const ics = buildIcs(
      targets.map(({ s, dates }) => ({
        title: `${s.wasteTypeJa ?? s.wasteType}収集`,
        dates,
        description: `地域: ${area.areaName}（${cityName}）`,
      }))
    );
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ごみ収集_${cityName}_${area.areaName}.ics`.replace(/[/\\]/g, '・');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <button
        onClick={download}
        className="flex items-start gap-1.5 text-sm text-blue-700 hover:text-blue-900 hover:underline text-left"
      >
        <Download className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          指定日収集（{typeNames}）をまとめて一括登録（.ics・今後全{total}回）
        </span>
      </button>
      <button
        onClick={() => setHelpOpen((v) => !v)}
        className="mt-1 ml-5 text-xs text-gray-500 hover:text-gray-700"
      >
        登録方法を見る {helpOpen ? '▴' : '▾'}
      </button>
      {helpOpen && (
        <ol className="mt-2 ml-5 text-xs text-gray-600 space-y-1.5 list-decimal list-inside bg-gray-50 rounded-md p-3">
          <li>
            <span className="font-medium">iPhone / Mac（Appleカレンダー）</span>:
            ダウンロードしたファイルを開き「すべて追加」を押すと全件登録されます。
          </li>
          <li>
            <span className="font-medium">パソコン（Googleカレンダー）</span>: calendar.google.com →
            右上⚙「設定」→「インポート / エクスポート」→ ファイルを選択 → インポート。
            <span className="block text-gray-500 mt-0.5">
              ヒント:
              先に「ごみ収集」用のカレンダーを作成し、そこへインポートすると、不要になったときにカレンダーごとまとめて削除できます。
            </span>
          </li>
          <li>
            <span className="font-medium">スマホのGoogleカレンダーアプリ</span>:
            アプリからは取り込めません。お手数ですがパソコンで2の手順をお使いください。
          </li>
        </ol>
      )}
    </div>
  );
}

const WasteCollectionForm = () => {
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LookupResponse | null>(null);
  const [filter, setFilter] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const zip = zipcode.replace(/\D/g, '');
    if (zip.length !== 7) {
      setError('正しい郵便番号を入力してください（7桁の数字）');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    setFilter('');
    try {
      const res = await fetch(`/api/waste/lookup?zipcode=${zip}`);
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || 'データの取得に失敗しました');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const visibleAreas = useMemo(() => {
    if (!data) return [];
    const q = filter.trim();
    if (!q) return data.areas;
    return data.areas.filter((a) => `${a.areaName}${a.addressDetail ?? ''}`.includes(q));
  }, [data, filter]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6 rounded">
          <p className="font-medium">千葉県全60市町村に対応しています</p>
          <p className="text-sm">郵便番号で市町村を特定し、地域別の収集日を表示します。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="zipcode" className="block text-gray-700 text-sm font-bold mb-2">
            郵便番号を入力:
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="zipcode"
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="例: 274-0072 または 2740072"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>{loading ? '読み込み中...' : '収集日程を確認'}</span>
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="border-b pb-3 mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {data.city.name}
                {data.towns.length > 0 && (
                  <span className="text-gray-500 text-base"> {data.towns.join('・')}</span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {data.matchType === 'city'
                  ? `郵便番号では市までの特定です。下の欄に町名を入れて絞り込めます（全${data.areas.length}地区）。`
                  : `${data.count}件の地域が見つかりました。`}
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="町名で絞り込む 例: 三山 / 万町"
                className="w-full pl-10 p-2 border rounded-md text-gray-900"
              />
            </div>

            {visibleAreas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                該当する地区がありません。町名の一部だけ入れてみてください。
              </p>
            ) : (
              <>
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50/60 border border-blue-100 rounded-md px-3 py-2 mb-4">
                  <CalendarPlus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>
                    各ごみ種別をタップすると{' '}
                    <span className="font-semibold text-gray-800">Googleカレンダー</span>
                    に収集日を追加できます。
                  </span>
                </div>
                <div className="space-y-4">
                  {visibleAreas.map((area, idx) => (
                    <div key={`${area.areaName}-${idx}`} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900">{area.areaName}</h3>
                      {area.addressDetail && (
                        <p className="text-xs text-gray-500 mb-2">{area.addressDetail}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {area.schedules.map((s, i) => (
                          <button
                            key={`${s.wasteType}-${i}`}
                            onClick={() => addToGoogleCalendar(area, s, data.city.name)}
                            aria-label={`${s.wasteTypeJa ?? s.wasteType}の収集日をGoogleカレンダーに追加`}
                            title="Googleカレンダーに追加"
                            className={`group relative text-left pl-3 pr-7 py-2 rounded-lg border cursor-pointer transition duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                              WT_COLOR[s.wasteType] ?? 'bg-gray-50 text-gray-800 border-gray-200'
                            }`}
                          >
                            <CalendarPlus className="w-3.5 h-3.5 absolute top-1.5 right-1.5 opacity-40 transition-opacity group-hover:opacity-100" />
                            <span className="block text-xs font-bold">
                              {s.wasteTypeJa ?? s.wasteType}
                            </span>
                            <span className="text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatSchedule(s)}
                              {s.collectionTime === 'nighttime' ? ' (夜)' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                      <IcsBulkExport area={area} cityName={data.city.name} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteCollectionForm;
