'use client';

import { useState, useEffect } from 'react';
import ProgressBar from '@/components/ProgressBar';
import {
  shouldShowUpdateNotification,
  shouldShowNewYearFeature,
} from '@/utils/feature-notifications';
import { MAIL_GENERATOR_CONSTANTS } from '@/config/models';
import QuickActionTags from './QuickActionTags';
import NativeLanguageSurvey from '@/components/NativeLanguageSurvey';

interface FormData {
  receivedMail: string;
  text: string;
}

export default function ReplyForm() {
  const [formData, setFormData] = useState<FormData>({
    receivedMail: '',
    text: '',
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem('survey_native_language_completed');
      setShowSurvey(!completed);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const maxLength = MAIL_GENERATOR_CONSTANTS.MAX_INPUT_LENGTH;
  const receivedMailCharCount = formData.receivedMail.length;
  const textCharCount = formData.text.length;

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate reply
  const handleGenerateReply = async () => {
    if (!formData.text.trim()) {
      setResult('Please enter a text');
      setShowResult(true);
      return;
    }

    setIsLoading(true);
    setResult('Processing please wait...');
    setShowResult(true);
    setCopyButtonText('Copy');

    try {
      const response = await fetch('/api/mail-generator/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reply');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: Failed to generate reply');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      setCopyButtonText('Error');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }
  };

  // Add New Year greeting context to reply requirements
  const handleNewYearPreset = () => {
    const newYearContext = '年賀の挨拶を含めて返信してください。';
    const currentText = formData.text.trim();
    const newText = currentText ? `${newYearContext}\n${currentText}` : newYearContext;
    handleInputChange('text', newText);
  };

  return (
    <>
      <ProgressBar
        isLoading={isLoading}
        message="返信生成中..."
        estimatedTime={8}
        additionalContent={
          showSurvey && isLoading ? (
            <NativeLanguageSurvey onComplete={() => setShowSurvey(false)} />
          ) : undefined
        }
      />

      {/* New Year Reply Feature Banner - Time-limited until 2026-01-31 */}
      {shouldShowNewYearFeature() && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎍</span>
              <span className="text-gray-700 font-medium">年賀の挨拶を追加</span>
              <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                NEW
              </span>
              <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full">
                期間限定
              </span>
            </div>
            <button
              type="button"
              onClick={handleNewYearPreset}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              年賀挨拶を追加
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            返信に年賀の挨拶を含めます。追加の要件も入力できます。
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Input Form */}
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateReply();
          }}
        >
          {/* Received Mail */}
          <div>
            <label htmlFor="receivedMail" className="block text-sm font-medium text-gray-700 mb-2">
              受信したメール
            </label>
            <textarea
              id="receivedMail"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              placeholder="受信したメールを入力してください"
              value={formData.receivedMail}
              onChange={(e) => handleInputChange('receivedMail', e.target.value)}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              {receivedMailCharCount > maxLength * MAIL_GENERATOR_CONSTANTS.WARNING_THRESHOLD && (
                <div className="text-red-600 text-sm font-medium">文字数が多すぎます</div>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                <span
                  className={
                    receivedMailCharCount > maxLength * MAIL_GENERATOR_CONSTANTS.WARNING_THRESHOLD
                      ? 'text-red-600 font-medium'
                      : ''
                  }
                >
                  {receivedMailCharCount} 文字
                </span>
                <span>/{maxLength} 文字まで</span>
              </div>
            </div>
          </div>

          {/* Quick Action Tags */}
          <QuickActionTags
            pageContext="reply"
            onTagClick={(promptText) => handleInputChange('text', promptText)}
            disabled={isLoading}
          />

          {/* Reply Requirements */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              返信要件
            </label>
            <textarea
              id="requirements"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              placeholder="こちらに要件を入力してください"
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              {textCharCount > maxLength * MAIL_GENERATOR_CONSTANTS.WARNING_THRESHOLD && (
                <div className="text-red-600 text-sm font-medium">文字数が多すぎます</div>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                <span
                  className={
                    textCharCount > maxLength * MAIL_GENERATOR_CONSTANTS.WARNING_THRESHOLD
                      ? 'text-red-600 font-medium'
                      : ''
                  }
                >
                  {textCharCount} 文字
                </span>
                <span>/{maxLength} 文字まで</span>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <a
                href="/mail-generator/privacy"
                className="text-blue-600 text-sm hover:underline relative"
              >
                プライバシーポリシー
                {shouldShowUpdateNotification() && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                    更新
                  </span>
                )}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mt-6"
            >
              {isLoading ? '作成中...' : '返信作成'}
            </button>
          </div>
        </form>

        {/* Result Output */}
        {showResult && (
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="result" className="text-lg font-medium text-gray-800">
                  返信結果
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!result || result === 'Processing please wait...'}
                  className={`px-4 py-2 text-sm rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    copyButtonText === 'Copied!'
                      ? 'bg-green-600 hover:bg-green-700'
                      : copyButtonText === 'Error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {copyButtonText}
                </button>
              </div>
              <textarea
                id="result"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="生成された返信結果がここに表示されます。直接編集も可能です。"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
