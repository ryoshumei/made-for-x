'use client';

import React from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { useShippingCalculator } from './hooks/useShippingCalculator';
import DimensionInput from './DimensionInput';
import ShippingResults from './ShippingResults';

export default function ShippingCalculator() {
  const { dimensions, result, loading, error, validationErrors, updateDimensions, reset } =
    useShippingCalculator();

  const handleDimensionChange = (dimension: keyof typeof dimensions, value: number) => {
    updateDimensions({ [dimension]: value });
  };

  const hasAnyInput = dimensions.length > 0 || dimensions.width > 0 || dimensions.height > 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">メルカリ配送料金計算器</h1>
          </div>
          <p className="text-gray-600 text-lg">
            商品の寸法を入力するだけで、最適な配送方法と料金をすぐに確認できます
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>らくらくメルカリ便</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>ゆうゆうメルカリ便</span>
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="font-medium">ご利用上の注意</p>
              <p className="text-sm mt-1">
                この計算機は寸法のみで配送料金を算出します。実際の配送可否は商品の重量制限もご確認ください。
                専用包装が必要な配送方法は、別途包装材の購入が必要です。
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <DimensionInput
            dimensions={dimensions}
            onDimensionChange={handleDimensionChange}
            validationErrors={validationErrors}
            disabled={loading}
          />
        </div>

        {/* Reset Button */}
        {hasAnyInput && (
          <div className="flex justify-center mb-6">
            <button
              onClick={reset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
              <span>リセット</span>
            </button>
          </div>
        )}

        {/* Results Section */}
        <div className="mb-8">
          <ShippingResults result={result} loading={loading} error={error} />
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">よくある質問</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Q. 寸法の測り方を教えてください</h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>
                  <strong>通常の配送方法：</strong>商品を梱包した状態での外寸を測定してください。
                </p>
                <p>
                  <strong>専用BOX・封筒が必要な配送方法：</strong>
                  商品の実寸（内寸基準）で判定されます。宅急便コンパクト、ゆうパケットプラス、ゆうパケットポストmini等の専用包装が必要な配送方法では、専用包装の内寸に収まるかで配送可否が決まります。
                </p>
                <p>長さ、幅、高さはどの順番で入力しても自動的に判定されます。</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Q. 専用包装とは何ですか？</h3>
              <p className="text-gray-600 text-sm">
                一部の配送方法では、専用の箱や封筒、シールの購入が必要です。コンビニや郵便局で購入できます。
                料金には包装材の費用も含まれています。
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Q. 重量制限について</h3>
              <p className="text-gray-600 text-sm">
                各配送方法には重量制限があります。結果に表示される制限重量を超える場合は、該当する配送方法はご利用いただけません。
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Q. 料金は税込みですか？</h3>
              <p className="text-gray-600 text-sm">
                表示されている料金は全て税込み価格です。メルカリで実際に支払う金額と同額です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
