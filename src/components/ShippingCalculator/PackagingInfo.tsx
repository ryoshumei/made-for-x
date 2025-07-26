import React from 'react';
import { Package } from 'lucide-react';

interface PackagingInfoProps {
  requiresSpecialPackaging: boolean;
  packagingName?: string;
  packagingDetails?: string;
  compact?: boolean;
}

export default function PackagingInfo({
  requiresSpecialPackaging,
  packagingName,
  packagingDetails,
  compact = false,
}: PackagingInfoProps) {
  if (!requiresSpecialPackaging) {
    return compact ? (
      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">専用包装不要</span>
    ) : (
      <div className="flex items-center space-x-2 text-green-600">
        <Package className="w-4 h-4" />
        <span className="text-sm">専用包装は不要です</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1">
        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          {packagingName || '専用包装必要'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
      <div className="flex items-start space-x-2">
        <Package className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-orange-800">
            {packagingName || '専用包装が必要です'}
          </h4>
          {packagingDetails && <p className="text-xs text-orange-700 mt-1">{packagingDetails}</p>}
        </div>
      </div>
    </div>
  );
}
