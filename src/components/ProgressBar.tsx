'use client';

import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
  message?: string;
  estimatedTime?: number; // in seconds
}

export default function ProgressBar({
  isLoading,
  message = 'AI生成中...',
  estimatedTime = 10,
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      setProgress(0);
      setTimeRemaining(estimatedTime);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progressPercent = Math.min((elapsed / estimatedTime) * 100, 95); // Max 95% until actually complete
        const remaining = Math.max(estimatedTime - elapsed, 0);

        setProgress(progressPercent);
        setTimeRemaining(remaining);

        // If it takes longer than expected, show "finishing up"
        if (elapsed >= estimatedTime * 1.2) {
          setTimeRemaining(0);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      // When loading stops, complete the progress and then hide
      if (shouldShow) {
        setProgress(100);
        setTimeRemaining(0);

        // Hide the progress bar after a short delay
        const hideTimeout = setTimeout(() => {
          setShouldShow(false);
        }, 800);

        return () => clearTimeout(hideTimeout);
      }
    }
  }, [isLoading, estimatedTime, shouldShow]);

  // Don't render if not showing
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Loading icon */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <svg
                className={`h-8 w-8 text-blue-600 ${progress < 100 ? 'animate-spin' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                {progress < 100 ? (
                  <>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </>
                ) : (
                  <path
                    className="text-green-600"
                    fill="currentColor"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {progress >= 100 ? '完了しました！' : message}
          </h3>

          {/* Time remaining */}
          <p className="text-sm text-gray-600 mb-4">
            {progress >= 100
              ? '処理が完了しました'
              : timeRemaining > 0
                ? `予想残り時間: ${Math.ceil(timeRemaining)}秒`
                : '最終処理中...'}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-300 ease-out ${
                progress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Progress percentage */}
          <p className="text-sm font-medium text-gray-700">{Math.round(progress)}% 完了</p>
        </div>
      </div>
    </div>
  );
}
