import { getNextHoliday } from '../holidays';

// Mock the holiday_jp module
jest.mock('@holiday-jp/holiday_jp', () => ({
  between: jest.fn(),
}));

import holiday_jp from '@holiday-jp/holiday_jp';
const mockBetween = holiday_jp.between as jest.Mock;

describe('getNextHoliday', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns the next holiday after today', () => {
    const today = new Date('2026-03-20');
    mockBetween.mockReturnValue([
      { date: new Date('2026-04-29'), name: '昭和の日', name_en: 'Showa Day' },
      { date: new Date('2026-05-03'), name: '憲法記念日', name_en: 'Constitution Memorial Day' },
    ]);

    const result = getNextHoliday(today);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('昭和の日');
    expect(result!.date).toEqual(new Date('2026-04-29'));
  });

  test('returns null when no future holidays exist', () => {
    const today = new Date('2026-12-25');
    mockBetween.mockReturnValue([]);

    const result = getNextHoliday(today);

    expect(result).toBeNull();
  });

  test('starts lookup from tomorrow to exclude today', () => {
    const today = new Date('2026-06-15');
    mockBetween.mockReturnValue([]);

    getNextHoliday(today);

    const call = mockBetween.mock.calls[0];
    const startDate = call[0] as Date;
    const endDate = call[1] as Date;

    // Start should be tomorrow (today + 1)
    expect(startDate.toISOString().slice(0, 10)).toBe('2026-06-16');
    // End should be ~2 years out
    expect(endDate.getFullYear()).toBe(2028);
  });

  test('excludes today even if today is a holiday', () => {
    const today = new Date('2026-03-20'); // Vernal Equinox Day
    mockBetween.mockReturnValue([
      { date: new Date('2026-04-29'), name: '昭和の日', name_en: 'Showa Day' },
    ]);

    const result = getNextHoliday(today);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('昭和の日');
    // Verify between() was called starting from tomorrow
    const startDate = mockBetween.mock.calls[0][0] as Date;
    expect(startDate.toISOString().slice(0, 10)).toBe('2026-03-21');
  });

  test('handles year boundary (December to January)', () => {
    const today = new Date('2026-12-30');
    mockBetween.mockReturnValue([
      { date: new Date('2027-01-01'), name: '元日', name_en: "New Year's Day" },
    ]);

    const result = getNextHoliday(today);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('元日');
    expect(result!.date.getFullYear()).toBe(2027);
  });
});
