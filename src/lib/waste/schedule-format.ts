// src/lib/waste/schedule-format.ts
import type { Schedule } from './types';

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

export function formatSchedule(s: Schedule): string {
  const dow = (s.dayOfWeek ?? []).join('・');
  switch (s.frequency) {
    case 'weekly':
      return `毎週 ${dow}`;
    case 'biweekly':
      return `隔週 ${dow}`;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        return `毎月 ${s.dayOfMonth.map((d) => `${d}日`).join('・')}`;
      }
      if (s.collectionDates && s.collectionDates.length) {
        const head = s.collectionDates.slice(0, 4).map(fmtDate).join('・');
        return `指定日 ${head}${s.collectionDates.length > 4 ? '…' : ''}`;
      }
      if (s.weekOfMonth && s.weekOfMonth.length) {
        return `毎月 ${s.weekOfMonth.map((w) => `第${w}`).join('・')} ${dow}`;
      }
      return `毎月 ${dow}`;
    case 'scheduled':
      return `指定日 ${(s.collectionDates ?? []).map(fmtDate).join('・')}`;
    case 'on_demand':
      return '申込制';
    default:
      return dow || '—';
  }
}
