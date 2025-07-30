'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { ShippingDimensions, ShippingResult } from './types';

interface FeedbackButtonProps {
  userDimensions: ShippingDimensions;
  calculationResult: ShippingResult | null;
}

export default function FeedbackButton({ userDimensions, calculationResult }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show feedback button if user has input some dimensions
  const hasInput =
    userDimensions.length > 0 || userDimensions.width > 0 || userDimensions.height > 0;

  if (!hasInput) {
    return null;
  }

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 z-50"
        title="フィードバックを送信"
        aria-label="フィードバックを送信"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userDimensions={userDimensions}
        calculationResult={calculationResult}
      />
    </>
  );
}
