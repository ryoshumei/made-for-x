'use client';

import React, { useState, FormEvent } from 'react';
import { Calendar, MapPin, Clock, Trash2 } from 'lucide-react';

// Types for API response
interface WasteScheduleArea {
  id: number;
  areaName: string;
  zipcode: string;
  addressDetail?: string;
  burnable: {
    days: string;
    time: string;
    dayNumbers: number[];
  };
  nonBurnable: {
    week: number;
    day: string;
    dayNumber: number;
  } | null;
  recyclable: {
    day: string;
    dayNumber: number;
  };
  valuable: {
    day: string;
    dayNumber: number;
  } | null;
}

interface WasteScheduleResponse {
  success: boolean;
  zipcode: string;
  count: number;
  areas: WasteScheduleArea[];
}

const WasteCollectionForm = () => {
  // State for form handling
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scheduleData, setScheduleData] = useState<WasteScheduleResponse | null>(null);

  // Remove hyphen from zipcode if exists
  const normalizeZipcode = (input: string) => {
    // Remove any non-digit characters
    return input.replace(/\D/g, '');
  };

  // Handle input change with formatting
  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setZipcode(input);
  };

  // Calculate next occurrence of a specific day of week
  const getNextDateForDayOfWeek = (dayOfWeek: number): Date => {
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = dayOfWeek === 7 ? 0 : dayOfWeek; // Convert 7 (Sunday) to 0
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Get next week's occurrence
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  };

  // Calculate next occurrence of specific week and day (e.g., 2nd Thursday)
  const getNextDateForWeekAndDay = (weekNumber: number, dayOfWeek: number): Date => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    
    // Helper function to find the nth occurrence of a day in a given month
    const findNthOccurrence = (year: number, month: number, weekNum: number, dayNum: number): Date | null => {
      const targetDay = dayNum === 7 ? 0 : dayNum; // Convert 7 (Sunday) to 0
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay();
      
      // Find the first occurrence of the target day
      const firstOccurrence = 1 + ((targetDay - firstDayOfWeek + 7) % 7);
      
      // Calculate the nth occurrence
      const targetDate = new Date(year, month, firstOccurrence + (weekNum - 1) * 7);
      
      // Check if this date actually exists in the given month
      if (targetDate.getMonth() !== month) {
        return null; // Date doesn't exist in this month
      }
      
      return targetDate;
    };
    
    // Try current month first
    let targetDate = findNthOccurrence(year, month, weekNumber, dayOfWeek);
    
    // If date doesn't exist in current month or is in the past, try next months
    if (!targetDate || targetDate <= today) {
      let monthsChecked = 0;
      do {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        targetDate = findNthOccurrence(year, month, weekNumber, dayOfWeek);
        monthsChecked++;
      } while ((!targetDate || targetDate <= today) && monthsChecked < 12);
    }
    
    // Fallback: if we still don't have a valid date, return next occurrence of the day
    if (!targetDate) {
      return getNextDateForDayOfWeek(dayOfWeek);
    }
    
    return targetDate;
  };

  // Format date for Google Calendar all-day events (YYYYMMDD)
  const formatDateForCalendar = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Get next day for all-day event end date
  const getNextDay = (date: Date): Date => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay;
  };

  // Generate Google Calendar URL
  const generateCalendarUrl = (
    title: string,
    startDate: Date,
    description: string,
    location: string,
    isRecurring: boolean = true,
    recurrenceType: 'weekly' | 'monthly' = 'weekly'
  ): string => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    // Format as all-day event
    const startDateStr = formatDateForCalendar(startDate);
    const endDateStr = formatDateForCalendar(getNextDay(startDate));
    
    const params = new URLSearchParams({
      text: title,
      dates: `${startDateStr}/${endDateStr}`,
      details: description,
      location: location,
    });

    // Add recurrence rule for events
    if (isRecurring) {
      if (recurrenceType === 'monthly') {
        // For monthly events, calculate which week and day of month
        const dayOfMonth = startDate.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        const dayOfWeek = startDate.getDay();
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        
        // RRULE for "every nth weekday of the month"
        params.append('recur', `RRULE:FREQ=MONTHLY;BYDAY=${weekOfMonth}${dayNames[dayOfWeek]}`);
      } else {
        params.append('recur', 'RRULE:FREQ=WEEKLY');
      }
    }

    return `${baseUrl}&${params.toString()}`;
  };

  // Handle calendar export
  const handleExportToCalendar = (
    area: WasteScheduleArea,
    wasteType: 'burnable' | 'nonBurnable' | 'recyclable' | 'valuable'
  ) => {
    let title = '';
    let description = '';
    let startDate: Date;
    let isRecurring = true;

    const location = `${area.areaName}${area.addressDetail ? ` ${area.addressDetail}` : ''}、船橋市`;

    switch (wasteType) {
      case 'burnable':
        title = `可燃ごみ収集 - ${area.areaName}`;
        description = `可燃ごみの収集日です。\n収集日: ${area.burnable.days}\n収集時間帯: ${area.burnable.time}\n地域: ${area.areaName}${area.addressDetail ? `\n詳細: ${area.addressDetail}` : ''}`;
        // For burnable waste, use the first day (e.g., Monday from "月木")
        startDate = getNextDateForDayOfWeek(area.burnable.dayNumbers[0]);
        break;

      case 'nonBurnable':
        if (!area.nonBurnable) return;
        title = `不燃ごみ収集 - ${area.areaName}`;
        description = `不燃ごみの収集日です。\n第${area.nonBurnable.week}週 ${area.nonBurnable.day}曜日\n地域: ${area.areaName}${area.addressDetail ? `\n詳細: ${area.addressDetail}` : ''}`;
        startDate = getNextDateForWeekAndDay(area.nonBurnable.week, area.nonBurnable.dayNumber);
        isRecurring = true; // Enable monthly recurring
        break;

      case 'recyclable':
        title = `資源ごみ収集 - ${area.areaName}`;
        description = `資源ごみの収集日です。\n${area.recyclable.day}曜日\n地域: ${area.areaName}${area.addressDetail ? `\n詳細: ${area.addressDetail}` : ''}`;
        startDate = getNextDateForDayOfWeek(area.recyclable.dayNumber);
        break;

      case 'valuable':
        if (!area.valuable) return;
        title = `有価物収集 - ${area.areaName}`;
        description = `有価物の収集日です。\n${area.valuable.day}曜日\n地域: ${area.areaName}${area.addressDetail ? `\n詳細: ${area.addressDetail}` : ''}`;
        startDate = getNextDateForDayOfWeek(area.valuable.dayNumber);
        break;

      default:
        return;
    }

    const recurrenceType = wasteType === 'nonBurnable' ? 'monthly' : 'weekly';
    const calendarUrl = generateCalendarUrl(title, startDate, description, location, isRecurring, recurrenceType);
    window.open(calendarUrl, '_blank');
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Normalize zipcode to remove hyphen
    const normalizedZipcode = normalizeZipcode(zipcode);

    // Validate that we have 7 digits
    if (normalizedZipcode.length !== 7) {
      setError('正しい郵便番号を入力してください（7桁の数字）');
      return;
    }

    setLoading(true);
    setError('');
    setScheduleData(null);

    try {
      const response = await fetch(`/api/search?zipcode=${normalizedZipcode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data: WasteScheduleResponse = await response.json();
      setScheduleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get waste type color
  const getWasteTypeColor = (type: string) => {
    switch (type) {
      case 'burnable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'nonBurnable':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recyclable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'valuable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Notice */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p className="font-medium">注意：現在は船橋市のみ対応しています</p>
          <p className="text-sm">We currently only support Funabashi City area</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label htmlFor="zipcode" className="block text-gray-700 text-sm font-bold mb-2">
              郵便番号を入力:
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                id="zipcode"
                type="text"
                value={zipcode}
                onChange={handleZipcodeChange}
                className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="例: 273-0001 または 2730001"
                pattern="[0-9]{3}-?[0-9]{4}"
                title="正しい日本の郵便番号形式で入力してください（例: 273-0001 または 2730001）"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">船橋市の郵便番号は273から始まります</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <Trash2 className="w-5 h-5" />
            <span>{loading ? '読み込み中...' : '収集日程を確認'}</span>
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {scheduleData && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>収集スケジュール - 郵便番号 {scheduleData.zipcode}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {scheduleData.count}件の地域が見つかりました
              </p>
            </div>

            <div className="divide-y">
              {scheduleData.areas.map((area) => (
                <div key={area.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {area.areaName}
                    </h3>
                    {area.addressDetail && (
                      <p className="text-sm text-gray-600">{area.addressDetail}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Burnable Waste */}
                    <div className={`p-4 rounded-lg border ${getWasteTypeColor('burnable')} flex flex-col h-full`}>
                      <h4 className="font-semibold mb-2">可燃ごみ</h4>
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{area.burnable.days}</span>
                      </div>
                                              <p className="text-xs mb-3">{area.burnable.time}</p>
                        <div className="mt-auto">
                          <button
                          onClick={() => handleExportToCalendar(area, 'burnable')}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 text-xs py-2 px-2 rounded border border-red-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Googleカレンダーに追加</span>
                        </button>
                        </div>
                      </div>

                    {/* Non-burnable Waste */}
                    {area.nonBurnable && (
                      <div className={`p-4 rounded-lg border ${getWasteTypeColor('nonBurnable')} flex flex-col h-full`}>
                        <h4 className="font-semibold mb-2">不燃ごみ</h4>
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">第{area.nonBurnable.week}週 {area.nonBurnable.day}</span>
                        </div>
                        <div className="flex-grow"></div>
                        <button
                          onClick={() => handleExportToCalendar(area, 'nonBurnable')}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2 px-2 rounded border border-blue-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Googleカレンダーに追加</span>
                        </button>
                      </div>
                    )}

                    {/* Recyclable Waste */}
                    <div className={`p-4 rounded-lg border ${getWasteTypeColor('recyclable')} flex flex-col h-full`}>
                      <h4 className="font-semibold mb-2">資源ごみ</h4>
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{area.recyclable.day}</span>
                      </div>
                      <div className="flex-grow"></div>
                      <button
                        onClick={() => handleExportToCalendar(area, 'recyclable')}
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700 text-xs py-2 px-2 rounded border border-green-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Googleカレンダーに追加</span>
                      </button>
                    </div>

                    {/* Valuable Waste */}
                    {area.valuable && (
                      <div className={`p-4 rounded-lg border ${getWasteTypeColor('valuable')} flex flex-col h-full`}>
                        <h4 className="font-semibold mb-2">有価物</h4>
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{area.valuable.day}</span>
                        </div>
                        <div className="flex-grow"></div>
                        <button
                          onClick={() => handleExportToCalendar(area, 'valuable')}
                          className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs py-2 px-2 rounded border border-yellow-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Googleカレンダーに追加</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteCollectionForm; 