import React from 'react';
import { CheckCircle, XCircle, Loader2, Package2 } from 'lucide-react';
import { ShippingResult } from './types';
import ShippingGroup from './ShippingGroup';
import WeightWarning from './WeightWarning';

interface ShippingResultsProps {
  result: ShippingResult | null;
  loading: boolean;
  error: string | null;
}

export default function ShippingResults({ result, loading, error }: ShippingResultsProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600">配送オプションを計算中...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No result yet (initial state)
  if (!result) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          <Package2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>商品の寸法を入力すると、利用可能な配送オプションが表示されます</p>
        </div>
      </div>
    );
  }

  // Invalid reasons (no options available)
  if (result.invalidReasons && result.invalidReasons.length > 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-orange-800 mb-2">
              配送オプションが見つかりません
            </h3>
            <ul className="text-orange-700 space-y-1">
              {result.invalidReasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
            <p className="text-orange-600 text-sm mt-3">
              寸法を確認して再度お試しください。また、一部の大型商品は配送に対応していない場合があります。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No groups available
  if (result.groups.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              配送オプションが見つかりません
            </h3>
            <p className="text-gray-700">
              入力された寸法に対応する配送サービスがありません。寸法を確認して再度お試しください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">利用可能な配送オプション</h2>
              <p className="text-sm text-gray-600">
                合計 {result.totalAvailable} 件のオプションが見つかりました
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Warnings */}
      {result.weightWarnings && result.weightWarnings.length > 0 && (
        <WeightWarning warnings={result.weightWarnings} />
      )}

      {/* Shipping Groups */}
      <div className="space-y-4">
        {result.groups.map((group, index) => (
          <ShippingGroup key={`${group.categoryName}-${index}`} group={group} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">配送オプション選択のヒント</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>おすすめ</strong>マークがついたオプションは最安値です
          </li>
          <li>• 専用包装が必要な場合は、包装材の購入が別途必要です</li>
          <li>• 重量制限をご確認の上、商品の重量と照らし合わせてください</li>
          <li>• 配送時間は目安であり、地域により異なる場合があります</li>
        </ul>
      </div>
    </div>
  );
}
