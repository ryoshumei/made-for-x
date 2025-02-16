'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

// Transaction type interface
interface Transaction {
  取引種別: string; // Transaction Type
  通貨ペア: string; // Currency Pair
  増加数量: number; // Increase Amount
  減少数量: number; // Decrease Amount
  約定金額: number; // Settlement Amount
}

const MercoinCalculator = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<{
    btc: { profit: number; totalBuy: number; totalSell: number };
    eth: { profit: number; totalBuy: number; totalSell: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateProfit = (transactions: Transaction[], currency: string) => {
    const buyTransactions = transactions.filter(
      (t) => (t.取引種別 === '購入' || t.取引種別 === '受取') && t.通貨ペア.startsWith(currency)
    );

    const sellTransactions = transactions.filter(
      (t) => t.取引種別 === '売却' && t.通貨ペア.startsWith(currency)
    );

    const totalBuy = _.sumBy(buyTransactions, '約定金額');
    const totalSell = _.sumBy(sellTransactions, '約定金額');

    return {
      profit: totalSell - totalBuy,
      totalBuy,
      totalSell,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!files || files.length === 0) {
      setError('Please upload CSV files');
      setLoading(false);
      return;
    }

    try {
      let allTransactions: Transaction[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();

        const result = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0) {
          throw new Error(`Error parsing ${file.name}: ${result.errors[0].message}`);
        }

        allTransactions = [...allTransactions, ...(result.data as Transaction[])];
      }

      const btcResults = calculateProfit(allTransactions, 'BTC');
      const ethResults = calculateProfit(allTransactions, 'ETH');

      setResults({
        btc: btcResults,
        eth: ethResults,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Mercoin Profit Calculator
      </h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Upload Mercoin Monthly CSV Files (January to December)
          </label>
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Profit'}
        </button>
      </form>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Mercoin BTC Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Buy Amount:</p>
                <p className="text-xl font-bold">¥{results.btc.totalBuy.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Sell Amount:</p>
                <p className="text-xl font-bold">¥{results.btc.totalSell.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Total Profit/Loss:</p>
                <p
                  className={`text-2xl font-bold ${results.btc.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ¥{results.btc.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Mercoin ETH Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Buy Amount:</p>
                <p className="text-xl font-bold">¥{results.eth.totalBuy.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Sell Amount:</p>
                <p className="text-xl font-bold">¥{results.eth.totalSell.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Total Profit/Loss:</p>
                <p
                  className={`text-2xl font-bold ${results.eth.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  ¥{results.eth.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MercoinCalculator;
