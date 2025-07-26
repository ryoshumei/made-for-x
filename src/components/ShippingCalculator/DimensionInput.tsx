import React from 'react';
import { Ruler } from 'lucide-react';
import { ShippingDimensions } from './types';

interface DimensionInputProps {
  dimensions: ShippingDimensions;
  onDimensionChange: (dimension: keyof ShippingDimensions, value: number) => void;
  validationErrors: string[];
  disabled?: boolean;
}

export default function DimensionInput({
  dimensions,
  onDimensionChange,
  validationErrors,
  disabled = false,
}: DimensionInputProps) {
  const handleInputChange = (dimension: keyof ShippingDimensions, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onDimensionChange(dimension, numValue);
    }
  };

  const inputClass = `
    w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
    transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900
    ${validationErrors.length > 0 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
  `;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-2 mb-4">
        <Ruler className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">商品の寸法を入力</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Length Input */}
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
            長さ (cm)
          </label>
          <input
            id="length"
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={dimensions.length === 0 ? '' : dimensions.length}
            onChange={(e) => handleInputChange('length', e.target.value)}
            className={inputClass}
            placeholder="例: 25.0"
            disabled={disabled}
          />
        </div>

        {/* Width Input */}
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
            幅 (cm)
          </label>
          <input
            id="width"
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={dimensions.width === 0 ? '' : dimensions.width}
            onChange={(e) => handleInputChange('width', e.target.value)}
            className={inputClass}
            placeholder="例: 18.0"
            disabled={disabled}
          />
        </div>

        {/* Height Input */}
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
            高さ (cm)
          </label>
          <input
            id="height"
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={dimensions.height === 0 ? '' : dimensions.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={inputClass}
            placeholder="例: 2.5"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>ヒント:</strong> 小数点も入力できます（例: 2.5cm）。
          どの順番で入力しても自動的に最適な配送方法を見つけます。
        </p>
      </div>
    </div>
  );
}
