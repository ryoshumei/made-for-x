'use client';
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Transaction, ProfitResult } from './types';

// Add validation functions
export const validateFileCount = (files: FileList): boolean => {
  // For testing convenience, allow uploading any number of files
  if (files.length < 1) {
    return false; // At least one file is required
  }

  if (files.length !== 12) {
    console.log(`Warning: Uploaded ${files.length} files instead of recommended 12 monthly files`);
  }

  return true;
};

export const validateFileNames = (files: FileList): boolean => {
  const fileNames = Array.from(files).map((file) => file.name);
  const fileNamePattern = /^(\d{4})(0[1-9]|1[0-2])\.csv$/;

  // Check if all files follow the pattern
  const validNames = fileNames.every((name) => fileNamePattern.test(name));

  // For testing convenience, relax the file naming requirements to allow any CSV file
  // As long as the file is CSV format
  if (!validNames) {
    console.log('Warning: Some files do not follow the YYYYMM.csv pattern');
    const allCsv = fileNames.every((name) => name.toLowerCase().endsWith('.csv'));
    return allCsv;
  }

  // Check if all files are from the same year
  // For testing convenience, relax the year requirement
  const years = new Set(fileNames.map((name) => name.substring(0, 4)));
  if (years.size !== 1) {
    console.log('Warning: Files from different years detected');
    return true;
  }

  // Check if all months (01-12) are present
  // For testing convenience, relax the month requirement
  const months = fileNames.map((name) => name.substring(4, 6)).sort();
  const expectedMonths = Array.from(
    { length: 12 },
    (_, i) => `${(i + 1).toString().padStart(2, '0')}`
  );
  const allMonthsPresent = JSON.stringify(months) === JSON.stringify(expectedMonths);
  if (!allMonthsPresent) {
    console.log('Warning: Not all 12 months are present');
    return true;
  }

  return true;
};

// Extract calculateProfit function
export function calculateProfit(transactions: Transaction[], currency: string): ProfitResult {
  // Buy transactions (purchase quantity and amount)
  console.log(`Filtering ${currency} purchase transactions, total: ${transactions.length}`);

  // Specifically check for BTC/JPY or ETH/JPY purchase transactions
  if (currency === 'BTC' || currency === 'ETH') {
    const currencyJpyPurchases = transactions.filter(
      (t) => t.取引種別 === '購入' && t.通貨ペア === `${currency}/JPY`
    );
    console.log(
      `Found ${currencyJpyPurchases.length} ${currency}/JPY purchase transactions before filtering:`,
      currencyJpyPurchases.map((t) => ({
        date: t.約定日時,
        amount: t.約定金額,
        quantity: t.増加数量,
        type: t.取引種別,
        pair: t.通貨ペア,
      }))
    );
  }

  const buyTransactions = transactions.filter((t) => {
    // Purchase with currency/JPY or currency/POINT
    const isPurchase =
      t.取引種別 === '購入' &&
      (t.通貨ペア === `${currency}/JPY` || t.通貨ペア === `${currency}/POINT`);

    // Receive with currency
    const isReceive = t.取引種別 === '受取' && t.通貨ペア === currency;

    // Log debug info, check if transaction is correctly classified
    if (t.取引種別 === '購入' && t.通貨ペア === `${currency}/JPY`) {
      console.log(`Found ${currency}/JPY purchase transaction:`, {
        date: t.約定日時,
        amount: t.約定金額,
        quantity: t.増加数量,
      });
    }

    const result = isPurchase || isReceive;

    // Specifically log filtered out currency/JPY purchase transactions
    if (
      (currency === 'BTC' || currency === 'ETH') &&
      t.取引種別 === '購入' &&
      t.通貨ペア === `${currency}/JPY` &&
      !result
    ) {
      console.log(`Warning: ${currency}/JPY purchase transaction filtered out:`, t);
    }

    return result;
  });

  console.log(`Found ${buyTransactions.length} ${currency} purchase transactions`);

  // Specifically check purchase transaction details
  if (currency === 'BTC' || currency === 'ETH') {
    console.log(
      `${currency} purchase transaction details:`,
      buyTransactions.map((t) => ({
        type: t.取引種別,
        pair: t.通貨ペア,
        amount: t.約定金額,
        quantity: t.増加数量,
        date: t.約定日時,
      }))
    );
  }

  // Sell transactions (sell quantity and amount)
  // Modified sell transaction filtering logic to include both sell and receive transactions
  const sellTransactions = transactions.filter((t) => {
    // Sell with currency/JPY
    const isSell = t.取引種別 === '売却' && t.通貨ペア === `${currency}/JPY`;

    // Receive with currency (only included in sell amount, not sell quantity)
    const isReceive = t.取引種別 === '受取' && t.通貨ペア === currency;

    return isSell || isReceive;
  });

  console.log(
    `Found ${sellTransactions.length} ${currency} sell-related transactions (including sale and receive)`
  );

  // Calculate totals
  const totalBuy = buyTransactions.reduce((sum, t) => sum + (t.約定金額 || 0), 0);

  // Sell amount calculation (including sale and receive)
  const totalSell = sellTransactions.reduce((sum, t) => sum + (t.約定金額 || 0), 0);

  const totalBuyQuantity = buyTransactions.reduce((sum, t) => sum + (t.増加数量 || 0), 0);

  // Sell quantity only calculated from actual sell transactions
  const totalSellQuantity = sellTransactions
    .filter((t) => t.取引種別 === '売却')
    .reduce((sum, t) => sum + (t.減少数量 || 0), 0);

  // Format transactions for logging
  const formattedBuyTransactions = buyTransactions.map((t) => ({
    type: t.取引種別,
    pair: t.通貨ペア,
    amount: t.約定金額,
    quantity: t.増加数量,
    date: t.約定日時,
  }));

  const formattedSellTransactions = sellTransactions.map((t) => ({
    type: t.取引種別,
    pair: t.通貨ペア,
    amount: t.約定金額,
    quantity: t.取引種別 === '売却' ? t.減少数量 : 0, // Set quantity to 0 for receive transactions
    date: t.約定日時,
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
    btc: ProfitResult;
    eth: ProfitResult;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState<{
    btc: boolean;
    eth: boolean;
  }>({ btc: false, eth: false });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showRawData, setShowRawData] = useState(false);
  const [rawFileContent, setRawFileContent] = useState<string>('');

  // Override console.log to capture debug information
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      setDebugLogs((prev) => [
        ...prev,
        args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '),
      ]);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setError('');
      setDebugLogs([]);
      setRawFileContent('');

      // Validate file count
      if (!validateFileCount(e.target.files)) {
        setError('Please upload at least one file.');
        setFiles(null);
        return;
      }

      // Validate file names
      if (!validateFileNames(e.target.files)) {
        setError('Please upload valid CSV files.');
        setFiles(null);
        return;
      }

      setFiles(e.target.files);
    }
  };

  const showRawFileContent = async () => {
    if (!files || files.length === 0) {
      setError('Please upload CSV files');
      return;
    }

    try {
      const file = files[0]; // Only display the content of the first file
      const text = await file.text();
      setRawFileContent(text);
      setShowRawData(true);
    } catch (err) {
      setError('Unable to read file content');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResults(null);
    setLoading(true);
    setError('');
    setDebugLogs([]); // Clear previous debug logs

    if (!files || files.length === 0) {
      setError('Please upload CSV files');
      setLoading(false);
      return;
    }

    try {
      let allTransactions: Transaction[] = [];
      // New: Add debug information recording
      const debugInfo: Record<string, any> = {
        fileCount: files.length,
        processedFiles: [],
        transactionCounts: {},
        filteredCounts: {},
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();

        // Record raw file content for debugging
        console.log(
          `Raw file content (${file.name}):\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`
        );

        // Debug information
        const fileDebug = {
          fileName: file.name,
          lineCount: 0,
          transactionLineCount: 0,
          validTransactions: 0,
          btcPurchases: 0,
          ethPurchases: 0,
        };

        // Directly use Papa.parse to parse the entire CSV file, no preprocessing
        const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: 'greedy' as const,
            complete: (results) => {
              resolve(results);
            },
            error: reject,
            transform: (value) => {
              if (typeof value === 'string') return value.trim();
              return value;
            },
          });
        });

        fileDebug.lineCount = parseResult.data.length + 1; // +1 for header

        // Record original parsing results
        console.log(`Raw CSV parsing results (${file.name}):`, parseResult.data);

        // Filter valid transaction records
        const validTransactions = parseResult.data.filter((row: any) => {
          // Skip empty rows or summary rows
          if (!row || Object.keys(row).length === 0) return false;
          if (row['作成基準日時'] || row['作成対象期間'] || row['月末残高']) return false;

          // Check if necessary transaction fields exist
          const hasTransactionType =
            row['取引種別'] !== undefined && row['取引種別'] !== null && row['取引種別'] !== '';
          const hasCurrencyPair =
            row['通貨ペア'] !== undefined && row['通貨ペア'] !== null && row['通貨ペア'] !== '';

          // Record detailed information for each row for debugging
          console.log(`Checking transaction record:`, {
            type: row['取引種別'],
            pair: row['通貨ペア'],
            date: row['取引日時'],
            hasType: hasTransactionType,
            hasPair: hasCurrencyPair,
            rawRow: row,
          });

          // Only keep rows with transaction type and currency pair
          return hasTransactionType && hasCurrencyPair;
        });

        fileDebug.transactionLineCount = validTransactions.length;

        // Specifically check for BTC/JPY purchase transactions
        const btcJpyPurchases = validTransactions.filter(
          (row: any) => row['取引種別'] === '購入' && row['通貨ペア'] === 'BTC/JPY'
        );

        if (btcJpyPurchases.length > 0) {
          console.log(
            `Found ${btcJpyPurchases.length} BTC/JPY purchase transactions in raw data:`,
            btcJpyPurchases
          );
          fileDebug.btcPurchases = btcJpyPurchases.length;
        } else {
          console.log(`Warning: No BTC/JPY purchase transactions found in ${file.name}`);
        }

        // Convert valid transactions to Transaction type
        const processedTransactions = validTransactions.map((row: any): Transaction => {
          // Build standardized transaction object
          const transaction: Transaction = {
            取引種別: row['取引種別'],
            通貨ペア: row['通貨ペア'],
            約定日時: row['取引日時'] || '',
            約定金額: parseFloat(row['約定金額']) || 0,
            増加数量: 0,
            減少数量: 0,
          };

          // Set increase/decrease quantities based on transaction type and currency pair
          if (row['取引種別'] === '購入') {
            // Purchase transactions: increase quantity is in "増加数量" field, or in specific currency name field
            if (row['増加数量'] !== undefined && row['増加数量'] !== null) {
              transaction.増加数量 = parseFloat(row['増加数量']) || 0;
            } else if (row['増加通貨名'] === 'BTC' && row['増加数量'] !== undefined) {
              transaction.増加数量 = parseFloat(row['増加数量']) || 0;
            } else if (row['BTC'] !== undefined && row['BTC'] !== null) {
              transaction.増加数量 = parseFloat(row['BTC']) || 0;
            }

            // Purchase transactions: decrease quantity is in "減少数量" field
            if (row['減少数量'] !== undefined && row['減少数量'] !== null) {
              transaction.減少数量 = parseFloat(row['減少数量']) || 0;
            } else if (row['JPY'] !== undefined && row['JPY'] !== null) {
              transaction.減少数量 = parseFloat(row['JPY']) || 0;
            }
          } else if (row['取引種別'] === '売却') {
            // Sell transactions: decrease quantity is in "減少数量" field
            if (row['減少数量'] !== undefined && row['減少数量'] !== null) {
              transaction.減少数量 = parseFloat(row['減少数量']) || 0;
            }

            // Sell transactions: increase quantity is in "増加数量" field
            if (row['増加数量'] !== undefined && row['増加数量'] !== null) {
              transaction.増加数量 = parseFloat(row['増加数量']) || 0;
            }
          }

          // Ensure agreement date exists
          if (!transaction.約定日時 && row['取引日時']) {
            transaction.約定日時 = row['取引日時'];
          } else if (!transaction.約定日時) {
            // If no date, use year and month from filename as default
            const fileMonth = file.name.match(/(\d{4})(\d{2})\.csv$/);
            if (fileMonth && fileMonth.length >= 3) {
              const year = fileMonth[1];
              const month = fileMonth[2];
              transaction.約定日時 = `${year}/${month}/15`; // Use mid-month as default value
            }
          }

          console.log(`Processed transaction:`, transaction);
          return transaction;
        });

        // Filter out valid cryptocurrency transactions
        const cryptoTransactions = processedTransactions.filter((t) => {
          const validPairs = ['BTC/JPY', 'BTC/POINT', 'BTC', 'ETH/JPY', 'ETH/POINT', 'ETH'];
          return validPairs.includes(t.通貨ペア);
        });

        fileDebug.validTransactions = cryptoTransactions.length;
        console.log(
          `Found ${cryptoTransactions.length} valid cryptocurrency transactions in ${file.name}`
        );

        if (cryptoTransactions.length > 0) {
          allTransactions = [...allTransactions, ...cryptoTransactions];
        }

        debugInfo.processedFiles.push(fileDebug);
      }

      if (allTransactions.length === 0) {
        setError('No valid transaction records found in all files');
        console.log('Debug information:', JSON.stringify(debugInfo, null, 2));
        setLoading(false);
        return;
      }

      // Debug information: record count of all transaction types
      allTransactions.forEach((t) => {
        const key = `${t.取引種別}_${t.通貨ペア}`;
        debugInfo.transactionCounts[key] = (debugInfo.transactionCounts[key] || 0) + 1;
      });

      console.log('All transactions:', allTransactions);

      const btcResults = calculateProfit(allTransactions, 'BTC');
      const ethResults = calculateProfit(allTransactions, 'ETH');

      // Record filtered transaction count for debugging
      debugInfo.filteredCounts = {
        btcBuyTransactions: btcResults.buyTransactions.length,
        btcSellTransactions: btcResults.sellTransactions.length,
        ethBuyTransactions: ethResults.buyTransactions.length,
        ethSellTransactions: ethResults.sellTransactions.length,
      };

      console.log('Final debug info:', JSON.stringify(debugInfo, null, 2));

      setResults({
        btc: btcResults,
        eth: ethResults,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (currency: 'btc' | 'eth') => {
    setShowDetails((prev) => ({
      ...prev,
      [currency]: !prev[currency],
    }));
  };

  // Format date string from ISO format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Display full date and time, not just date
      return date
        .toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(/\//g, '/');
    } catch (e) {
      return dateString || '-';
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
            上传Mercoin交易CSV文件 (可以上传单个月份文件进行测试)
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
          <p className="mt-1 text-xs text-gray-500">
            推荐上传全年12个月的数据文件（格式为YYYYMM.csv），但现在也支持上传单个文件进行测试。
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? '計算中...' : '計算利益'}
          </button>

          <button
            type="button"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>

          <button
            type="button"
            onClick={showRawFileContent}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            显示原始CSV内容
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {showDebugInfo && debugLogs.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 overflow-auto max-h-96">
          <h3 className="font-bold mb-2">调试信息：</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {debugLogs.map((log, index) => (
              <div key={index} className="py-1 border-b border-gray-100">
                {log}
              </div>
            ))}
          </pre>
        </div>
      )}

      {showRawData && rawFileContent && (
        <div className="mb-4 p-4 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 overflow-auto max-h-96">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">原始CSV内容：</h3>
            <button
              onClick={() => setShowRawData(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              关闭
            </button>
          </div>
          <pre className="text-xs whitespace-pre-wrap">{rawFileContent}</pre>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* 计算步骤说明 - 改为日文，并添加引用 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-indigo-900">計算方法の説明</h2>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 font-bold">
                  ①
                </span>
                <span className="font-medium">
                  購入数量の合計を算出する：すべての購入および受取トランザクションの暗号資産数量の合計
                </span>
              </p>
              <p className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 font-bold">
                  ②
                </span>
                <span className="font-medium">
                  購入金額の合計を算出する：すべての購入および受取トランザクションで支払った日本円の合計
                </span>
              </p>
              <p className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 font-bold">
                  ③
                </span>
                <span className="font-medium">
                  売却数量の合計を算出する：すべての売却トランザクションの暗号資産数量の合計
                </span>
              </p>
              <p className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 font-bold">
                  ④
                </span>
                <span className="font-medium">
                  売却金額の合計を算出する：すべての売却トランザクションで受け取った日本円の合計
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                出典：
                <a
                  href="https://help.jp.mercari.com/guide/articles/1513/#1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  メルカリ ヘルプセンター
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-indigo-900">Mercoin BTC Results</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* 按照①②③④的顺序调整显示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ①
                  </span>
                  購入数量の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {results.btc.totalBuyQuantity.toFixed(8)} BTC
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ②
                  </span>
                  購入金額の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.btc.totalBuy.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ③
                  </span>
                  売却数量の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {results.btc.totalSellQuantity.toFixed(8)} BTC
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ④
                  </span>
                  売却金額の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.btc.totalSell.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-600 text-sm font-medium mb-1">利益/損失の合計:</p>
                <p
                  className={`text-2xl font-bold ${results.btc.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  ¥{results.btc.profit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  = ④売却金額の合計 (¥{results.btc.totalSell.toLocaleString()}) - ②購入金額の合計 (¥
                  {results.btc.totalBuy.toLocaleString()})
                </p>
              </div>
              <div className="col-span-2 mt-2">
                <button
                  onClick={() => toggleDetails('btc')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  {showDetails.btc ? '計算過程を隠す' : '計算過程を表示する'}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${showDetails.btc ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
              </div>

              {showDetails.btc && (
                <div className="col-span-2 space-y-4">
                  {/* Purchase Details */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      <span className="flex items-center">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                          ①②
                        </span>
                        購入明細 (合計: {results.btc.buyTransactions.length} 件の取引)
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引日時
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引種別
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              通貨ペア
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              購入数量
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              購入金額
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.btc.buyTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatDate(tx.date)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.pair}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {tx.quantity.toFixed(8)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                ¥{tx.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-indigo-50 font-medium">
                            <td colSpan={3} className="px-4 py-2 text-sm text-gray-900">
                              合計
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {results.btc.totalBuyQuantity.toFixed(8)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              ¥{results.btc.totalBuy.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      <span className="flex items-center">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                          ③④
                        </span>
                        売却明細 (合計: {results.btc.sellTransactions.length} 件の取引)
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引日時
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引種別
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              通貨ペア
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              売却数量
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              売却金額
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.btc.sellTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatDate(tx.date)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.pair}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {tx.quantity.toFixed(8)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                ¥{tx.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-indigo-50 font-medium">
                            <td colSpan={3} className="px-4 py-2 text-sm text-gray-900">
                              合計
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {results.btc.totalSellQuantity.toFixed(8)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              ¥{results.btc.totalSell.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-indigo-900">Mercoin ETH Results</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* 按照①②③④的顺序调整显示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ①
                  </span>
                  購入数量の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {results.eth.totalBuyQuantity.toFixed(8)} ETH
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ②
                  </span>
                  購入金額の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.eth.totalBuy.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ③
                  </span>
                  売却数量の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {results.eth.totalSellQuantity.toFixed(8)} ETH
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                    ④
                  </span>
                  売却金額の合計:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{results.eth.totalSell.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-600 text-sm font-medium mb-1">利益/損失の合計:</p>
                <p
                  className={`text-2xl font-bold ${results.eth.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  ¥{results.eth.profit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  = ④売却金額の合計 (¥{results.eth.totalSell.toLocaleString()}) - ②購入金額の合計 (¥
                  {results.eth.totalBuy.toLocaleString()})
                </p>
              </div>
              <div className="col-span-2 mt-2">
                <button
                  onClick={() => toggleDetails('eth')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  {showDetails.eth ? '計算過程を隠す' : '計算過程を表示する'}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${showDetails.eth ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
              </div>

              {showDetails.eth && (
                <div className="col-span-2 space-y-4">
                  {/* Purchase Details */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      <span className="flex items-center">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                          ①②
                        </span>
                        購入明細 (合計: {results.eth.buyTransactions.length} 件の取引)
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引日時
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引種別
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              通貨ペア
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              購入数量
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              購入金額
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.eth.buyTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatDate(tx.date)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.pair}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {tx.quantity.toFixed(8)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                ¥{tx.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-indigo-50 font-medium">
                            <td colSpan={3} className="px-4 py-2 text-sm text-gray-900">
                              合計
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {results.eth.totalBuyQuantity.toFixed(8)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              ¥{results.eth.totalBuy.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      <span className="flex items-center">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                          ③④
                        </span>
                        売却明細 (合計: {results.eth.sellTransactions.length} 件の取引)
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引日時
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              取引種別
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              通貨ペア
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              売却数量
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              売却金額
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.eth.sellTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatDate(tx.date)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{tx.pair}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {tx.quantity.toFixed(8)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                ¥{tx.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-indigo-50 font-medium">
                            <td colSpan={3} className="px-4 py-2 text-sm text-gray-900">
                              合計
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {results.eth.totalSellQuantity.toFixed(8)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              ¥{results.eth.totalSell.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MercoinCalculator;
