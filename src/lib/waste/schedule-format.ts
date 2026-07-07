// src/lib/waste/schedule-format.ts
import type { Schedule } from './types';

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

function fmtDates(dates: string[], cap = 4): string {
  const head = dates.slice(0, cap).map(fmtDate).join('・');
  return `指定日 ${head}${dates.length > cap ? '…' : ''}`;
}

export function formatSchedule(s: Schedule): string {
  const dow = (s.dayOfWeek ?? []).join('・');
  let result: string;
  switch (s.frequency) {
    case 'weekly':
      result = `毎週 ${dow}`;
      break;
    case 'biweekly':
      result = `隔週 ${dow}`;
      break;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        result = `毎月 ${s.dayOfMonth.map((d) => `${d}日`).join('・')}`;
      } else if (s.collectionDates && s.collectionDates.length) {
        result = fmtDates(s.collectionDates);
      } else if (s.weekOfMonth && s.weekOfMonth.length) {
        result = `毎月 ${s.weekOfMonth.map((w) => `第${w}`).join('・')} ${dow}`;
      } else {
        result = `毎月 ${dow}`;
      }
      break;
    case 'scheduled':
      result = fmtDates(s.collectionDates ?? []);
      break;
    case 'on_demand':
      result = '申込制';
      break;
    default:
      result = dow || '—';
  }
  return result.trim();
}
