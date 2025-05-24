'use client';

import React, { useState, FormEvent } from 'react';
import { Calendar } from 'lucide-react';

const GarbageCollectionForm = () => {
  // State for form handling
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [garbageData, setGarbageData] = useState<
    Array<{
      type: string;
      date: string;
      time: string;
    }>
  >([]);

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

    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch('/api/garbage-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipcode: normalizedZipcode }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      // Mock data - replace with actual API response
      setGarbageData([
        { type: 'Recyclable', date: '2024-12-10', time: '8:00 AM' },
        { type: 'Non-recyclable', date: '2024-12-11', time: '9:00 AM' },
      ]);
    } catch (err) {
      setError('Error fetching garbage collection data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar export
  const handleExportToCalendar = async (item: { type: string; date: string; time: string }) => {
    // Google Calendar export logic will go here
    console.log('Exporting to calendar:', item);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
            <input
              id="zipcode"
              type="text"
              value={zipcode}
              onChange={handleZipcodeChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="例: 273-0001 または 2730001"
              pattern="[0-9]{3}-?[0-9]{4}"
              title="正しい日本の郵便番号形式で入力してください（例: 273-0001 または 2730001）"
              required
            />
            <p className="mt-1 text-xs text-gray-500">船橋市の郵便番号は273から始まります</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? '読み込み中...' : '収集日程を確認'}
          </button>
        </form>

        {/* Error Message */}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        {/* Results */}
        {garbageData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">収集スケジュール</h2>
            </div>
            <div className="divide-y">
              {garbageData.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{item.type}</p>
                    <p className="text-sm text-gray-600">
                      {item.date} {item.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportToCalendar(item)}
                    className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>カレンダーに追加</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarbageCollectionForm;
