// src/lib/waste/calendar.ts
import type { Schedule } from './types';

const JP_TO_RRULE_DAY: Record<string, string> = {
  月: 'MO',
  火: 'TU',
  水: 'WE',
  木: 'TH',
  金: 'FR',
  土: 'SA',
  日: 'SU',
};

export function buildRecurrenceRule(s: Schedule): string | null {
  const days = (s.dayOfWeek ?? []).map((d) => JP_TO_RRULE_DAY[d]).filter(Boolean);
  switch (s.frequency) {
    case 'weekly':
      return days.length ? `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}` : null;
    case 'biweekly':
      return days.length ? `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${days.join(',')}` : null;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        return `RRULE:FREQ=MONTHLY;BYMONTHDAY=${s.dayOfMonth.join(',')}`;
      }
      if (s.weekOfMonth && s.weekOfMonth.length && days.length) {
        const byday = s.weekOfMonth.flatMap((w) => days.map((d) => `${w}${d}`)).join(',');
        return `RRULE:FREQ=MONTHLY;BYDAY=${byday}`;
      }
      return null;
    default:
      return null; // scheduled / on_demand → use ICS or no recurrence
  }
}

function nextDayYmd(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function buildIcs(title: string, isoDates: string[]): string {
  const slug = title.replace(/\s+/g, '').slice(0, 12);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//madeforx//waste//JA'];
  isoDates.forEach((iso, i) => {
    const ymd = iso.replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:waste-${slug}-${ymd}-${i}@madeforx.com`,
      `SUMMARY:${title}`,
      `DTSTART;VALUE=DATE:${ymd}`,
      `DTEND;VALUE=DATE:${nextDayYmd(iso)}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
