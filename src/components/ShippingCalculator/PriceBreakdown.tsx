import React from 'react';

interface PriceBreakdownProps {
  totalPrice: number;
  basePrice?: number;
  packagingPrice?: number;
  packagingName?: string;
  compact?: boolean;
}

export default function PriceBreakdown({
  totalPrice,
  basePrice,
  packagingPrice,
  packagingName,
  compact = false,
}: PriceBreakdownProps) {
  const hasBreakdown = basePrice && packagingPrice && packagingPrice > 0;

  if (compact) {
    return (
      <div className="text-right">
        <div className="text-xl font-bold text-gray-900">¥{totalPrice.toLocaleString()}</div>
        {hasBreakdown && (
          <div className="text-xs text-gray-500">
            ¥{basePrice.toLocaleString()} + ¥{packagingPrice.toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">総額</span>
        <span className="text-xl font-bold text-blue-600">¥{totalPrice.toLocaleString()}</span>
      </div>

      {hasBreakdown && (
        <div className="border-t pt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">基本料金</span>
            <span className="text-gray-900">¥{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{packagingName || '包装費用'}</span>
            <span className="text-gray-900">¥{packagingPrice.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
