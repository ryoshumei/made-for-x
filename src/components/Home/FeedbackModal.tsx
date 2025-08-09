'use client';

import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackTypes {
  usability: boolean;
  newFeature: boolean;
  bugReport: boolean;
  toolSpecific: boolean;
  other: boolean;
}

const TOOL_OPTIONS = [
  { value: 'mail-generator', label: 'Japanese Email Generator (メール作成 AI)' },
  { value: 'shipping-calculator', label: 'Mercari Shipping Calculator (配送料金計算器)' },
  { value: 'waste-collection', label: 'Waste Collection (船橋市ごみ収集)' },
  { value: 'japanpost', label: 'Export Invoice (Japan Post輸出インボイス)' },
  { value: 'homepage', label: 'Homepage (ホームページ)' },
  { value: 'general', label: 'General Platform (プラットフォーム全般)' },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackTypes>({
    usability: false,
    newFeature: false,
    bugReport: false,
    toolSpecific: false,
    other: false,
  });
  const [toolFeedback, setToolFeedback] = useState('');
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
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackTypes,
          toolFeedback: toolFeedback || null,
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
            usability: false,
            newFeature: false,
            bugReport: false,
            toolSpecific: false,
            other: false,
          });
          setToolFeedback('');
          setCustomFeedback('');
        }, 300);
      }, 2500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(
        'フィードバックの送信に失敗しました。もう一度お試しください。\nFailed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedFeedback = Object.values(feedbackTypes).some(Boolean) || customFeedback.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          // Success state
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              フィードバックありがとうございます！
            </h3>
            <p className="text-gray-600 mb-2">
              お送りいただいたフィードバックは今後のサービス改善に活用させていただきます。
            </p>
            <p className="text-sm text-gray-500">
              Thank you for your feedback! We&apos;ll use it to improve our services.
            </p>
          </div>
        ) : (
          // Form state
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">フィードバック / Feedback</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Feedback type selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  該当する項目を選択してください / Select applicable items
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.usability}
                      onChange={() => handleFeedbackTypeChange('usability')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">
                      使いやすさの改善 / Usability improvements
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.newFeature}
                      onChange={() => handleFeedbackTypeChange('newFeature')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">新機能の要望 / Feature requests</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.bugReport}
                      onChange={() => handleFeedbackTypeChange('bugReport')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">バグ・問題の報告 / Bug reports</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.toolSpecific}
                      onChange={() => handleFeedbackTypeChange('toolSpecific')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">
                      特定ツールについて / Specific tool feedback
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={feedbackTypes.other}
                      onChange={() => handleFeedbackTypeChange('other')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">その他 / Other</span>
                  </label>
                </div>
              </div>

              {/* Tool selection - only show when toolSpecific is selected */}
              {feedbackTypes.toolSpecific && (
                <div>
                  <label
                    htmlFor="toolFeedback"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    どのツールについてですか？ / Which tool is this about?
                  </label>
                  <select
                    id="toolFeedback"
                    value={toolFeedback}
                    onChange={(e) => setToolFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    disabled={isSubmitting}
                  >
                    <option value="">選択してください / Select a tool</option>
                    {TOOL_OPTIONS.map((tool) => (
                      <option key={tool.value} value={tool.value}>
                        {tool.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom feedback textarea - show when other is selected OR always show */}
              <div>
                <label
                  htmlFor="customFeedback"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {feedbackTypes.other
                    ? 'ご意見・ご要望を詳しく教えてください / Please provide details'
                    : 'その他のご意見・ご要望（任意） / Additional comments (optional)'}
                </label>
                <textarea
                  id="customFeedback"
                  rows={4}
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="具体的なご意見やご要望をお聞かせください...\nPlease share your specific feedback or suggestions..."
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
                  キャンセル / Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasSelectedFeedback || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>送信中... / Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>送信 / Send</span>
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
