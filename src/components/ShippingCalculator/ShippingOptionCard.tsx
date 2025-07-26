import React from 'react';
import { Truck, Clock, Weight } from 'lucide-react';
import { ShippingOption } from './types';
import PriceBreakdown from './PriceBreakdown';
import PackagingInfo from './PackagingInfo';

interface ShippingOptionCardProps {
  option: ShippingOption;
  isRecommended?: boolean;
}

export default function ShippingOptionCard({
  option,
  isRecommended = false,
}: ShippingOptionCardProps) {
  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all hover:shadow-md
        ${
          isRecommended
            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 left-4">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">おすすめ</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{option.optionName}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Truck className="w-4 h-4" />
            <span>{option.serviceName}</span>
          </div>
        </div>
        <PriceBreakdown
          totalPrice={option.totalPrice}
          basePrice={option.basePrice}
          packagingPrice={option.packagingPrice}
          packagingName={option.packagingName}
          compact
        />
      </div>

      {/* Delivery Info */}
      {option.deliveryInfo && (
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">{option.deliveryInfo}</span>
        </div>
      )}

      {/* Weight Limit */}
      {option.maxWeightKg && (
        <div className="flex items-center space-x-2 mb-3">
          <Weight className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">最大重量: {option.maxWeightKg}kg</span>
        </div>
      )}

      {/* Size Information */}
      <div className="text-xs text-gray-500 mb-3">
        {option.maxSizeCm && <div>3辺合計: 最大{option.maxSizeCm}cm</div>}
        {(option.maxLengthCm ||
          option.maxWidthCm ||
          option.maxHeightCm ||
          option.maxThicknessCm) && (
          <div>
            最大寸法:
            {option.maxLengthCm && ` ${option.maxLengthCm}cm`}
            {option.maxWidthCm && ` × ${option.maxWidthCm}cm`}
            {option.maxHeightCm && ` × ${option.maxHeightCm}cm`}
            {option.maxThicknessCm && !option.maxHeightCm && ` (厚さ${option.maxThicknessCm}cm)`}
          </div>
        )}
        {(option.minLengthCm || option.minWidthCm) && (
          <div>
            最小寸法:
            {option.minLengthCm && ` ${option.minLengthCm}cm`}
            {option.minWidthCm && ` × ${option.minWidthCm}cm`}
          </div>
        )}
      </div>

      {/* Packaging Info */}
      <PackagingInfo
        requiresSpecialPackaging={option.requiresSpecialPackaging}
        packagingName={option.packagingName}
        packagingDetails={option.packagingDetails}
        compact
      />

      {/* Size Tier Badge for tiered options */}
      {option.priceType === 'tiered' && option.sizeTierName && (
        <div className="mt-2">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {option.sizeTierName}
          </span>
        </div>
      )}
    </div>
  );
}
