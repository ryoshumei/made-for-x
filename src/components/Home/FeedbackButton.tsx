'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Fixed feedback button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 shadow-lg transition-all duration-200 hover:scale-105 z-50 flex items-center space-x-2"
        title="フィードバックを送信 / Send Feedback"
        aria-label="フィードバックを送信 / Send Feedback"
      >
        <Send className="w-5 h-5" />
        <span className="text-sm font-medium">フィードバック / Feedback</span>
      </button>

      {/* Feedback modal */}
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
