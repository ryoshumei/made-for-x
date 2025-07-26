import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WeightWarningProps {
  warnings: string[];
}

export default function WeightWarning({ warnings }: WeightWarningProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 mb-2">重量制限にご注意ください</h3>
          <p className="text-sm text-yellow-700">
            表示された配送オプションには重量制限があります。商品の重量が制限を超える場合は、該当する配送方法をご利用いただけません。
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            各配送方法の重量制限は、個別のオプションカードでご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}
