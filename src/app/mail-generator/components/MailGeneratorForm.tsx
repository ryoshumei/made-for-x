'use client';

import { useState } from 'react';

interface FormData {
  recipient: string;
  signature: string;
  text: string;
  lang: number;
}

export default function MailGeneratorForm() {
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    signature: '',
    text: '',
    lang: 1,
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const maxLength = 500;
  const charCount = formData.text.length;

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    if (field === 'text' && typeof value === 'string' && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate email
  const handleGenerate = async () => {
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
      const response = await fetch('/api/mail-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: Failed to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  // Add emoji
  const handleAddEmoji = async () => {
    if (!result || isLoading) return;

    setIsLoading(true);
    setResult('Processing please wait...');

    try {
      const response = await fetch('/api/mail-generator/emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: result, lang: formData.lang }),
      });

      if (!response.ok) {
        throw new Error('Failed to add emojis');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: Failed to add emojis');
    } finally {
      setIsLoading(false);
    }
  };

  // Make more polite
  const handleMakePolite = async () => {
    if (!result || isLoading) return;

    setIsLoading(true);
    setResult('Processing please wait...');

    try {
      const response = await fetch('/api/mail-generator/polite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: result, lang: formData.lang }),
      });

      if (!response.ok) {
        throw new Error('Failed to make text more polite');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: Failed to make text more polite');
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Input Form */}
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient */}
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              宛先
            </label>
            <input
              type="text"
              id="recipient"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="オプション"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
            />
          </div>

          {/* Signature */}
          <div>
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
              署名
            </label>
            <input
              type="text"
              id="signature"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="オプション"
              value={formData.signature}
              onChange={(e) => handleInputChange('signature', e.target.value)}
            />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
            要件
          </label>
          <textarea
            id="requirements"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            placeholder="こちらに要件を入力してください"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            {charCount > maxLength * 0.9 && (
              <div className="text-red-600 text-sm font-medium">文字数が多すぎます</div>
            )}
            <div className="text-sm text-gray-500 ml-auto">
              <span className={charCount > maxLength * 0.9 ? 'text-red-600 font-medium' : ''}>
                {charCount} 文字
              </span>
              <span>/{maxLength} 文字まで</span>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <a href="/mail-generator/privacy" className="text-blue-600 text-sm hover:underline">
              プライバシーポリシー
            </a>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isLoading ? '作成中...' : '作成'}
            </button>
            <div className="flex items-center space-x-2">
              <label htmlFor="language" className="text-sm font-medium text-gray-700">
                出力言語:
              </label>
              <select
                id="language"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                value={formData.lang}
                onChange={(e) => handleInputChange('lang', parseInt(e.target.value))}
              >
                <option value={1}>日本語</option>
                <option value={2}>English</option>
                <option value={3}>简体中文</option>
                <option value={4}>繁體中文</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* Result Output */}
      {showResult && (
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="result" className="text-lg font-medium text-gray-800">
                生成結果
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddEmoji}
                  disabled={isLoading || !result || result === 'Processing please wait...'}
                  className="bg-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  絵文字を追加
                </button>
                <button
                  onClick={handleMakePolite}
                  disabled={isLoading || !result || result === 'Processing please wait...'}
                  className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  もっと丁寧に
                </button>
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
            </div>
            <textarea
              id="result"
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
              value={result}
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
}
