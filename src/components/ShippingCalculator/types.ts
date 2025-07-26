// Types for the shipping calculator components

export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ShippingOption {
  id: number;
  categoryName: 'らくらくメルカリ便' | 'ゆうゆうメルカリ便';
  serviceName: string;
  optionName: string;
  totalPrice: number;
  basePrice?: number;
  packagingPrice?: number;
  packagingName?: string;
  packagingDetails?: string;
  requiresSpecialPackaging: boolean;
  maxWeightKg?: number;
  maxSizeCm?: number;
  maxLengthCm?: number;
  maxWidthCm?: number;
  maxHeightCm?: number;
  maxThicknessCm?: number;
  minLengthCm?: number;
  minWidthCm?: number;
  deliveryInfo?: string;
  pickupRestrictions?: any;
  priceType: 'fixed' | 'tiered';
  sizeTierName?: string;
}

export interface ShippingGroup {
  categoryName: 'らくらくメルカリ便' | 'ゆうゆうメルカリ便';
  options: ShippingOption[];
}

export interface ShippingResult {
  groups: ShippingGroup[];
  totalAvailable: number;
  weightWarnings?: string[];
  invalidReasons?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CalculatorState {
  dimensions: ShippingDimensions;
  result: ShippingResult | null;
  loading: boolean;
  error: string | null;
  validationErrors: string[];
}
