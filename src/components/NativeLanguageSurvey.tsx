'use client';

import { useState } from 'react';

const LANGUAGE_OPTIONS = [
  { label: '日本語', value: 'japanese' },
  { label: 'English', value: 'english' },
  { label: '中文', value: 'chinese' },
  { label: '한국어', value: 'korean' },
  { label: 'Other', value: 'other' },
] as const;

interface NativeLanguageSurveyProps {
  onComplete?: () => void;
}

export default function NativeLanguageSurvey({ onComplete }: NativeLanguageSurveyProps) {
  const [answered, setAnswered] = useState(false);

  const handleSelect = (language: string) => {
    setAnswered(true);

    try {
      localStorage.setItem('survey_native_language_completed', 'true');
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded)
    }

    onComplete?.();

    fetch('/api/native-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    }).catch(() => {
      // Fire-and-forget — silently ignore errors
    });
  };

  if (answered) {
    return (
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-green-700">ありがとうございます！ / Thank you!</p>
      </div>
    );
  }

  return (
    <div className="text-center mb-4">
      <p className="text-xs text-gray-500 mb-1">サービス向上のために / To help us improve</p>
      <p className="text-sm font-medium text-gray-700 mb-3">
        あなたの母語は？ / What is your native language?
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
