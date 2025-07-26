import React from 'react';
import { Package2, Mail } from 'lucide-react';
import { ShippingGroup as ShippingGroupType } from './types';
import ShippingOptionCard from './ShippingOptionCard';

interface ShippingGroupProps {
  group: ShippingGroupType;
}

export default function ShippingGroup({ group }: ShippingGroupProps) {
  const getGroupIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'らくらくメルカリ便':
        return <Package2 className="w-6 h-6 text-green-600" />;
      case 'ゆうゆうメルカリ便':
        return <Mail className="w-6 h-6 text-red-600" />;
      default:
        return <Package2 className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCarrierInfo = (categoryName: string) => {
    switch (categoryName) {
      case 'らくらくメルカリ便':
        return {
          carrier: 'ヤマト運輸',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'ゆうゆうメルカリ便':
        return {
          carrier: '日本郵政',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          carrier: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const carrierInfo = getCarrierInfo(group.categoryName);

  return (
    <div
      className={`rounded-lg border ${carrierInfo.borderColor} ${carrierInfo.bgColor} overflow-hidden`}
    >
      {/* Group Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getGroupIcon(group.categoryName)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{group.categoryName}</h2>
              <p className={`text-sm ${carrierInfo.color}`}>{carrierInfo.carrier}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">{group.options.length}件のオプション</span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-4 space-y-3">
        {group.options.map((option, index) => (
          <ShippingOptionCard
            key={option.id}
            option={option}
            isRecommended={index === 0} // First option is recommended (cheapest)
          />
        ))}
      </div>
    </div>
  );
}
