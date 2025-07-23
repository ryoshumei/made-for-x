import { ShippingDimensions, ValidationResult } from './types';

/**
 * Validates shipping dimensions for basic constraints
 * @param dimensions - The shipping dimensions to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateShippingDimensions(dimensions: ShippingDimensions): ValidationResult {
  const errors: string[] = [];

  // Check for positive values
  if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
    errors.push('サイズは0より大きくなければなりません');
  }

  // Check maximum size constraints
  if (dimensions.length > 200 || dimensions.width > 200 || dimensions.height > 200) {
    errors.push('一辺のサイズは200cmを超えることはできません');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates API request body structure
 * @param body - The request body to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateRequestBody(body: any): ValidationResult {
  const errors: string[] = [];

  if (!body) {
    errors.push('リクエストボディが必要です');
    return { isValid: false, errors };
  }

  const { length, width, height } = body;

  if (typeof length !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    errors.push('長さ、幅、高さは数値である必要があります');
  }

  if (errors.length === 0) {
    // Validate dimensions if basic type checks pass
    const dimensionValidation = validateShippingDimensions({ length, width, height });
    errors.push(...dimensionValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
