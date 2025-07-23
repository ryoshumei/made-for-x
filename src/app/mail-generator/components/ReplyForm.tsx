'use client';

import { useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { shouldShowUpdateNotification } from '@/utils/feature-notifications';

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

  const maxLength = 500;
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

  return (
    <>
      <ProgressBar isLoading={isLoading} message="返信生成中..." estimatedTime={8} />

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
              {receivedMailCharCount > maxLength * 0.9 && (
                <div className="text-red-600 text-sm font-medium">文字数が多すぎます</div>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                <span
                  className={
                    receivedMailCharCount > maxLength * 0.9 ? 'text-red-600 font-medium' : ''
                  }
                >
                  {receivedMailCharCount} 文字
                </span>
                <span>/{maxLength} 文字まで</span>
              </div>
            </div>
          </div>

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
              {textCharCount > maxLength * 0.9 && (
                <div className="text-red-600 text-sm font-medium">文字数が多すぎます</div>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                <span className={textCharCount > maxLength * 0.9 ? 'text-red-600 font-medium' : ''}>
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
