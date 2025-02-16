'use client';

import React, { useState, FormEvent } from 'react';
import { Calendar } from 'lucide-react';

const GarbageCollectionForm = () => {
  // State for form handling
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [garbageData, setGarbageData] = useState<
    Array<{
      type: string;
      date: string;
      time: string;
    }>
  >([]);

  // Mock regions data - will be replaced with actual data
  const regions = [
    { id: 'tokyo', name: 'Tokyo' },
    { id: 'osaka', name: 'Osaka' },
    { id: 'kyoto', name: 'Kyoto' },
  ];

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch('/api/garbage-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region: selectedRegion }),
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Japan Garbage Collection Calendar
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label htmlFor="region" className="block text-gray-700 text-sm font-bold mb-2">
              Select Region:
            </label>
            <select
              id="region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Please select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Check Collection Times'}
          </button>
        </form>

        {/* Error Message */}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        {/* Results */}
        {garbageData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Collection Schedule</h2>
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
                    <span>Add to Calendar</span>
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
