'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Transaction, ProfitResult } from './types';

// Add validation functions
export const validateFileCount = (files: FileList): boolean => {
  return files.length === 12;
};

export const validateFileNames = (files: FileList): boolean => {
  const fileNames = Array.from(files).map((file) => file.name);
  const fileNamePattern = /^(\d{4})(0[1-9]|1[0-2])\.csv$/;

  // Check if all files follow the pattern
  const validNames = fileNames.every((name) => fileNamePattern.test(name));
  if (!validNames) return false;

  // Check if all files are from the same year
  const years = new Set(fileNames.map((name) => name.substring(0, 4)));
  if (years.size !== 1) return false;

  // Check if all months (01-12) are present
  const months = fileNames.map((name) => name.substring(4, 6)).sort();
  const expectedMonths = Array.from(
    { length: 12 },
    (_, i) => `${(i + 1).toString().padStart(2, '0')}`
  );
  return JSON.stringify(months) === JSON.stringify(expectedMonths);
};

// Extract calculateProfit function
export function calculateProfit(transactions: Transaction[], currency: string): ProfitResult {
  // Buy transactions (購入数量と金額)
  const buyTransactions = transactions.filter((t) => {
    // 購入 with currency/JPY or currency/POINT
    const isPurchase =
      t.取引種別 === '購入' &&
      (t.通貨ペア === `${currency}/JPY` || t.通貨ペア === `${currency}/POINT`);

    // 受取 with currency
    const isReceive = t.取引種別 === '受取' && t.通貨ペア === currency;

    return isPurchase || isReceive;
  });

  // Sell transactions (売却数量と金額)
  const sellTransactions = transactions.filter((t) => {
    // Only 売却 with currency/JPY
    return t.取引種別 === '売却' && t.通貨ペア === `${currency}/JPY`;
  });

  // Calculate totals
  const totalBuy = buyTransactions.reduce((sum, t) => sum + (t.約定金額 || 0), 0);
  const totalSell = sellTransactions.reduce((sum, t) => sum + (t.約定金額 || 0), 0);
  const totalBuyQuantity = buyTransactions.reduce((sum, t) => sum + (t.増加数量 || 0), 0);
  const totalSellQuantity = sellTransactions.reduce((sum, t) => sum + (t.減少数量 || 0), 0);

  // Format transactions for logging
  const formattedBuyTransactions = buyTransactions.map((t) => ({
    type: t.取引種別,
    pair: t.通貨ペア,
    amount: t.約定金額,
    quantity: t.増加数量,
  }));

  const formattedSellTransactions = sellTransactions.map((t) => ({
    type: t.取引種別,
    pair: t.通貨ペア,
    amount: t.約定金額,
    quantity: t.減少数量,
  }));

  return {
    profit: totalSell - totalBuy,
    totalBuy,
    totalSell,
    totalBuyQuantity,
    totalSellQuantity,
    buyTransactions: formattedBuyTransactions,
    sellTransactions: formattedSellTransactions,
  };
}

const MercoinCalculator = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<{
    btc: {
      profit: number;
      totalBuy: number;
      totalSell: number;
      totalBuyQuantity: number;
      totalSellQuantity: number;
    };
    eth: {
      profit: number;
      totalBuy: number;
      totalSell: number;
      totalBuyQuantity: number;
      totalSellQuantity: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setError('');

      // Validate file count
      if (!validateFileCount(e.target.files)) {
        setError('Please upload exactly 12 monthly files');
        setFiles(null);
        return;
      }

      // Validate file names
      if (!validateFileNames(e.target.files)) {
        setError(
          'Invalid file names. Please ensure all files are from the same year and named in YYYYMM.csv format (e.g., 202401.csv)'
        );
        setFiles(null);
        return;
      }

      setFiles(e.target.files);
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

        // Split the file content by lines and filter out the summary section
        const lines = text.split('\n');
        const transactionLines = lines.filter((line) => {
          const trimmedLine = line.trim();
          // Skip empty lines and summary lines
          if (trimmedLine === '') return false;
          if (trimmedLine.includes('作成基準日時')) return false;
          if (trimmedLine.includes('作成対象期間')) return false;
          if (trimmedLine.includes('月末残高')) return false;
          if (trimmedLine.includes('JPY,BTC')) return false;
          // Keep the header line and transaction lines
          return true;
        });

        // Skip this file if no transactions (only header)
        if (transactionLines.length <= 1) {
          console.log(`No transactions found in ${file.name}, skipping...`);
          continue;
        }

        // Join the filtered lines back together
        const cleanedCsv = transactionLines.join('\n');

        // Parse CSV using promise-based approach
        const parseResult = await new Promise<Papa.ParseResult<Transaction>>((resolve, reject) => {
          Papa.parse(cleanedCsv, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: 'greedy' as const,
            complete: resolve,
            error: reject,
            transform: (value) => {
              if (typeof value === 'string') return value.trim();
              if (typeof value === 'number') return value;
              return null;
            },
          });
        });

        if (!parseResult.data || parseResult.data.length === 0) {
          console.log(`No valid data found in ${file.name}, skipping...`);
          continue;
        }

        console.log(`Processing ${file.name}, found ${parseResult.data.length} rows`);

        // Filter out rows that don't have required fields
        const validTransactions = parseResult.data.filter(
          (transaction): transaction is Transaction => {
            if (!transaction || typeof transaction !== 'object') {
              console.log('Invalid transaction object:', transaction);
              return false;
            }

            // Check if it has all required fields
            const hasRequiredFields =
              '取引種別' in transaction &&
              '通貨ペア' in transaction &&
              '増加数量' in transaction &&
              '減少数量' in transaction &&
              '約定金額' in transaction;

            if (!hasRequiredFields) {
              console.log('Missing required fields:', transaction);
              return false;
            }

            // For cryptocurrency transactions, check exact currency pairs
            const validPairs = ['BTC/JPY', 'BTC/POINT', 'BTC', 'ETH/JPY', 'ETH/POINT', 'ETH'];

            return Boolean(transaction.取引種別) && validPairs.includes(transaction.通貨ペア);
          }
        );

        console.log(`Found ${validTransactions.length} valid crypto transactions in ${file.name}`);

        if (validTransactions.length > 0) {
          allTransactions = [...allTransactions, ...validTransactions];
        }
      }

      if (allTransactions.length === 0) {
        setError('No valid transactions found in any of the files');
        return;
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-transparent bg-clip-text">
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
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Calculating...' : 'Calculate Profit'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-indigo-900">Mercoin BTC Results</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Buy Amount:</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.btc.totalBuy.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Buy Quantity:</p>
                <p className="text-xl font-bold text-gray-900">
                  {results.btc.totalBuyQuantity.toFixed(8)} BTC
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Sell Amount:</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.btc.totalSell.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Sell Quantity:</p>
                <p className="text-xl font-bold text-gray-900">
                  {results.btc.totalSellQuantity.toFixed(8)} BTC
                </p>
              </div>
              <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-600 text-sm font-medium mb-1">Total Profit/Loss:</p>
                <p
                  className={`text-2xl font-bold ${results.btc.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  ¥{results.btc.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-indigo-900">Mercoin ETH Results</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Buy Amount:</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.eth.totalBuy.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Buy Quantity:</p>
                <p className="text-xl font-bold text-gray-900">
                  {results.eth.totalBuyQuantity.toFixed(8)} ETH
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Sell Amount:</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.eth.totalSell.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Sell Quantity:</p>
                <p className="text-xl font-bold text-gray-900">
                  {results.eth.totalSellQuantity.toFixed(8)} ETH
                </p>
              </div>
              <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-600 text-sm font-medium mb-1">Total Profit/Loss:</p>
                <p
                  className={`text-2xl font-bold ${results.eth.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
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
