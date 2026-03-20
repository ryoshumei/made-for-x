import React from 'react';
import { render, screen } from '@testing-library/react';
import HolidayCard from '../HolidayCard';

// Mock the holiday modules
jest.mock('@/lib/holidays/holidays', () => ({
  getNextHoliday: jest.fn(),
}));

jest.mock('@/lib/holidays/bridge-calculator', () => ({
  calculateBridgePlan: jest.fn(),
}));

jest.mock('@holiday-jp/holiday_jp', () => ({
  between: jest.fn().mockReturnValue([]),
}));

import { getNextHoliday } from '@/lib/holidays/holidays';
import { calculateBridgePlan } from '@/lib/holidays/bridge-calculator';

const mockGetNextHoliday = getNextHoliday as jest.Mock;
const mockCalculateBridgePlan = calculateBridgePlan as jest.Mock;

describe('HolidayCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders holiday name and date', () => {
    mockGetNextHoliday.mockReturnValue({
      date: new Date('2026-04-29'),
      name: '昭和の日',
      nameEn: 'Showa Day',
    });
    mockCalculateBridgePlan.mockReturnValue({
      totalDaysOff: 5,
      ptoDaysNeeded: 2,
      startDate: new Date('2026-04-29'),
      endDate: new Date('2026-05-03'),
      ptoDates: [new Date('2026-04-30'), new Date('2026-05-01')],
    });

    render(<HolidayCard />);

    expect(screen.getByText(/昭和の日/)).toBeInTheDocument();
    expect(screen.getByText(/2026年4月29日（水）/)).toBeInTheDocument();
  });

  test('renders countdown values', () => {
    mockGetNextHoliday.mockReturnValue({
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      name: 'テスト祝日',
      nameEn: 'Test',
    });
    mockCalculateBridgePlan.mockReturnValue({
      totalDaysOff: 3,
      ptoDaysNeeded: 0,
      startDate: new Date(),
      endDate: new Date(),
      ptoDates: [],
    });

    render(<HolidayCard />);

    // Should render the countdown labels
    expect(screen.getByText('日')).toBeInTheDocument();
    expect(screen.getByText('時間')).toBeInTheDocument();
    expect(screen.getByText('分')).toBeInTheDocument();
    expect(screen.getByText('秒')).toBeInTheDocument();
  });

  test('renders bridge plan with PTO badge when PTO needed', () => {
    mockGetNextHoliday.mockReturnValue({
      date: new Date('2026-04-29'),
      name: '昭和の日',
      nameEn: 'Showa Day',
    });
    mockCalculateBridgePlan.mockReturnValue({
      totalDaysOff: 5,
      ptoDaysNeeded: 2,
      startDate: new Date('2026-04-29'),
      endDate: new Date('2026-05-03'),
      ptoDates: [new Date('2026-04-30'), new Date('2026-05-01')],
    });

    render(<HolidayCard />);

    expect(screen.getByText('有給2日')).toBeInTheDocument();
    expect(screen.getByText('5連休')).toBeInTheDocument();
  });

  test('omits PTO badge when no PTO needed', () => {
    mockGetNextHoliday.mockReturnValue({
      date: new Date('2026-01-12'),
      name: '成人の日',
      nameEn: 'Coming of Age Day',
    });
    mockCalculateBridgePlan.mockReturnValue({
      totalDaysOff: 3,
      ptoDaysNeeded: 0,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-01-12'),
      ptoDates: [],
    });

    render(<HolidayCard />);

    expect(screen.queryByText(/有給/)).not.toBeInTheDocument();
    expect(screen.getByText('3連休')).toBeInTheDocument();
  });

  test('shows fallback message when no holiday data', () => {
    mockGetNextHoliday.mockReturnValue(null);

    render(<HolidayCard />);

    expect(screen.getByText('祝日データを更新中です')).toBeInTheDocument();
  });

  test('cleans up interval on unmount', () => {
    mockGetNextHoliday.mockReturnValue({
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      name: 'テスト祝日',
      nameEn: 'Test',
    });
    mockCalculateBridgePlan.mockReturnValue({
      totalDaysOff: 3,
      ptoDaysNeeded: 0,
      startDate: new Date(),
      endDate: new Date(),
      ptoDates: [],
    });

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(<HolidayCard />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
