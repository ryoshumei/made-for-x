import { useState, useEffect, useCallback } from 'react';
import { ShippingDimensions, CalculatorState, ValidationResult } from '../types';
import { useDebounce } from './useDebounce';
import { useShippingAPI } from './useShippingAPI';

/**
 * Validate shipping dimensions
 */
function validateDimensions(dimensions: ShippingDimensions): ValidationResult {
  const errors: string[] = [];

  // Check if any dimension is zero or negative
  if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
    errors.push('すべての寸法は0より大きい値を入力してください');
  }

  // Check if any dimension exceeds 200cm
  if (dimensions.length > 200 || dimensions.width > 200 || dimensions.height > 200) {
    errors.push('一辺のサイズは200cmを超えることはできません');
  }

  // Check for reasonable minimum values
  if (dimensions.length < 0.1 || dimensions.width < 0.1 || dimensions.height < 0.1) {
    errors.push('寸法が小さすぎます（最小0.1cm）');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Main hook for shipping calculator state management
 */
export function useShippingCalculator() {
  const [state, setState] = useState<CalculatorState>({
    dimensions: { length: 0, width: 0, height: 0 },
    result: null,
    loading: false,
    error: null,
    validationErrors: [],
  });

  const { calculateShipping } = useShippingAPI();

  // Debounce dimensions to avoid too many API calls
  const debouncedDimensions = useDebounce(state.dimensions, 500);

  // Update dimensions
  const updateDimensions = useCallback((newDimensions: Partial<ShippingDimensions>) => {
    setState((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, ...newDimensions },
      error: null,
    }));
  }, []);

  // Calculate shipping options when debounced dimensions change
  useEffect(() => {
    const calculate = async () => {
      // Validate dimensions first
      const validation = validateDimensions(debouncedDimensions);

      setState((prev) => ({
        ...prev,
        validationErrors: validation.errors,
      }));

      // Don't call API if validation fails or dimensions are zero
      if (
        !validation.isValid ||
        debouncedDimensions.length === 0 ||
        debouncedDimensions.width === 0 ||
        debouncedDimensions.height === 0
      ) {
        setState((prev) => ({
          ...prev,
          result: null,
          loading: false,
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await calculateShipping(debouncedDimensions);
        setState((prev) => ({
          ...prev,
          result,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '計算エラーが発生しました',
          result: null,
        }));
      }
    };

    calculate();
  }, [debouncedDimensions, calculateShipping]);

  // Reset function
  const reset = useCallback(() => {
    setState({
      dimensions: { length: 0, width: 0, height: 0 },
      result: null,
      loading: false,
      error: null,
      validationErrors: [],
    });
  }, []);

  return {
    ...state,
    updateDimensions,
    reset,
    isValidInput: state.validationErrors.length === 0,
  };
}
