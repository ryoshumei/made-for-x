'use client';

import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { ShippingDimensions, ShippingResult } from './types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDimensions: ShippingDimensions;
  calculationResult: ShippingResult | null;
}

interface FeedbackTypes {
  pricing: boolean;
  shippingInfo: boolean;
  sizeCalculation: boolean;
  newService: boolean;
  other: boolean;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  userDimensions,
  calculationResult,
}: FeedbackModalProps) {
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackTypes>({
    pricing: false,
    shippingInfo: false,
    sizeCalculation: false,
    newService: false,
    other: false,
  });
  const [customFeedback, setCustomFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackTypeChange = (type: keyof FeedbackTypes) => {
    setFeedbackTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/shipping/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDimensions,
          calculationResult,
          feedbackTypes,
          customFeedback: customFeedback.trim() || null,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);

      // Auto close after showing success message
      setTimeout(() => {
        onClose();
        // Reset state when closing
        setTimeout(() => {
          setIsSubmitted(false);
          setFeedbackTypes({
            pricing: false,
            shippingInfo: false,
            sizeCalculation: false,
            newService: false,
            other: false,
          });
          setCustomFeedback('');
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('フィードバックの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedFeedback = Object.values(feedbackTypes).some(Boolean) || customFeedback.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          // Success state
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              フィードバックありがとうございます！
            </h3>
            <p className="text-gray-600">
              お送りいただいたフィードバックは今後のサービス改善に活用させていただきます。
            </p>
          </div>
        ) : (
          // Form state
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">フィードバック</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* User input data display */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">入力された寸法</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <span className="text-gray-700">
                    長さ: {userDimensions.length}cm × 幅: {userDimensions.width}cm × 高さ:{' '}
                    {userDimensions.height}cm
                  </span>
                </div>
              </div>

              {/* Calculation result summary */}
              {calculationResult && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">計算結果</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <span className="text-gray-700">
                      {calculationResult.totalAvailable}件の配送方法が見つかりました
                    </span>
                  </div>
                </div>
              )}

              {/* Feedback type selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  該当する問題を選択してください
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.pricing}
                      onChange={() => handleFeedbackTypeChange('pricing')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">料金が実際と異なる</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.shippingInfo}
                      onChange={() => handleFeedbackTypeChange('shippingInfo')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">配送方法の情報が間違っている</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.sizeCalculation}
                      onChange={() => handleFeedbackTypeChange('sizeCalculation')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">サイズ制限の計算が正しくない</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.newService}
                      onChange={() => handleFeedbackTypeChange('newService')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">新しい配送方法が表示されていない</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.other}
                      onChange={() => handleFeedbackTypeChange('other')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">その他</span>
                  </label>
                </div>
              </div>

              {/* Custom feedback textarea */}
              <div>
                <label
                  htmlFor="customFeedback"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  その他のご意見・ご要望（任意）
                </label>
                <textarea
                  id="customFeedback"
                  rows={4}
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="具体的な問題や改善要望がございましたらお聞かせください..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasSelectedFeedback || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>送信中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>送信</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
