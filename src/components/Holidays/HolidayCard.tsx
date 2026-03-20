'use client';

import { useState, useEffect, useRef } from 'react';
import { getNextHoliday } from '@/lib/holidays/holidays';
import { calculateBridgePlan } from '@/lib/holidays/bridge-calculator';
import { Holiday, BridgePlan } from '@/lib/holidays/types';
import holiday_jp from '@holiday-jp/holiday_jp';

function getAllHolidays(): Holiday[] {
  const now = new Date();
  const twoYears = new Date(now);
  twoYears.setFullYear(twoYears.getFullYear() + 2);
  return holiday_jp
    .between(now, twoYears)
    .map((h: { date: Date; name: string; name_en: string }) => ({
      date: h.date,
      name: h.name,
      nameEn: h.name_en,
    }));
}

function formatDate(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${y}年${m}月${d}日（${dayOfWeek}）`;
}

function formatShortDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${m}/${d}（${days[date.getDay()]}）`;
}

function getCountdown(target: Date): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

function formatPtoDates(dates: Date[]): string {
  if (dates.length === 1) {
    return `${formatShortDate(dates[0])}を休めば`;
  }
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  return `${formatShortDate(sorted[0])}〜${formatShortDate(sorted[sorted.length - 1])}を休めば`;
}

function formatRange(start: Date, end: Date): string {
  return `${formatShortDate(start)}〜${formatShortDate(end)}`;
}

export default function HolidayCard() {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [bridgePlan, setBridgePlan] = useState<BridgePlan | null>(null);
  const [noData, setNoData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const nextHoliday = getNextHoliday();
    if (!nextHoliday) {
      setNoData(true);
      return;
    }

    setHoliday(nextHoliday);

    const allHolidays = getAllHolidays();
    const plan = calculateBridgePlan(nextHoliday.date, allHolidays);
    setBridgePlan(plan);

    setCountdown(getCountdown(nextHoliday.date));

    intervalRef.current = setInterval(() => {
      setCountdown(getCountdown(nextHoliday.date));
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (noData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-gray-500 text-lg">祝日データを更新中です</p>
        </div>
      </div>
    );
  }

  if (!holiday || !countdown || !bridgePlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">次の祝日</p>
            <h1 className="text-2xl font-bold text-gray-900">🎌 {holiday.name}</h1>
            <p className="text-gray-600 mt-1">{formatDate(holiday.date)}</p>
          </div>

          {/* Countdown */}
          <div className="flex justify-center gap-4 mb-6">
            {[
              { value: countdown.days, label: '日' },
              { value: countdown.hours, label: '時間' },
              { value: countdown.minutes, label: '分' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-5 py-3 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-700">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Bridge Plan */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">🗓️ 連休プラン</h2>
            {bridgePlan.ptoDaysNeeded > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  有給{bridgePlan.ptoDaysNeeded}日
                </span>
                <span className="text-sm text-gray-600">{formatPtoDates(bridgePlan.ptoDates)}</span>
              </div>
            )}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-center">
              <span className="text-xl font-bold text-blue-700">{bridgePlan.totalDaysOff}連休</span>
              <span className="text-sm text-gray-600 ml-2">
                {formatRange(bridgePlan.startDate, bridgePlan.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
