'use client';

import React, { useState, FormEvent } from 'react';

export default function ExportInvoiceForm() {
  const [productName, setProductName] = useState('');
  const [customsCode, setCustomsCode] = useState('');
  const [articleDescription, setArticleDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCustomsCode('');
    setArticleDescription('');

    try {
      const response = await fetch('/api/generate-customs-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate customs code');
      }

      const data = await response.json();
      setCustomsCode(data.customsCode);
      setArticleDescription(data.articleDescription);
    } catch (err) {
      setError('An error occurred while generating the customs code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto py-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="productName" className="block text-gray-700 text-sm font-bold mb-2">
            Product Name:
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter Product Name"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Invoice Code'}
        </button>
        {customsCode && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-green-600 mr-2">Customs Code:</span>
                <span className="font-mono text-lg font-bold">{customsCode}</span>
              </div>
              {articleDescription && (
                <div className="flex items-start">
                  <span className="font-semibold text-sm text-green-600 mr-2 mt-0.5">Article:</span>
                  <span className="text-sm">{articleDescription}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      </form>
    </main>
  );
}
