import holiday_jp from '@holiday-jp/holiday_jp';
import { Holiday } from './types';

/**
 * Returns the next public holiday after the given date,
 * or null if no future holiday data is available.
 */
export function getNextHoliday(today: Date = new Date()): Holiday | null {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const twoYearsLater = new Date(today);
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

  const holidays = holiday_jp.between(tomorrow, twoYearsLater);

  if (holidays.length === 0) {
    return null;
  }

  const first = holidays[0];
  return {
    date: first.date,
    name: first.name,
    nameEn: first.name_en,
  };
}
