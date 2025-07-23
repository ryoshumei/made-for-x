export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ShippingOption {
  id: number;
  categoryName: string;
  serviceName: string;
  optionName: string;
  totalPrice: number;
  basePrice?: number | null;
  packagingPrice?: number | null;
  packagingName?: string | null;
  packagingDetails?: string | null;
  requiresSpecialPackaging: boolean;
  maxWeightKg?: number | null;
  maxSizeCm?: number | null;
  maxLengthCm?: number | null;
  maxWidthCm?: number | null;
  maxHeightCm?: number | null;
  maxThicknessCm?: number | null;
  minLengthCm?: number | null;
  minWidthCm?: number | null;
  deliveryInfo?: string | null;
  pickupRestrictions?: any;
  priceType: string;
  sizeTierName?: string | null;
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

export interface CalculationInput {
  dimensions: ShippingDimensions;
  prisma: any; // Will be properly typed later
}
