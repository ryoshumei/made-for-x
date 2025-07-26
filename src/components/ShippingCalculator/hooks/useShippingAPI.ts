import { useCallback } from 'react';
import { ShippingDimensions, ShippingResult } from '../types';

/**
 * Custom hook for shipping API calls
 */
export function useShippingAPI() {
  const calculateShipping = useCallback(
    async (dimensions: ShippingDimensions): Promise<ShippingResult> => {
      try {
        const response = await fetch('/api/shipping/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dimensions),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch shipping options');
        }

        const data: ShippingResult = await response.json();
        return data;
      } catch (error) {
        console.error('Shipping API error:', error);
        return {
          groups: [],
          totalAvailable: 0,
          weightWarnings: [],
          invalidReasons: [
            error instanceof Error
              ? error.message
              : 'API呼び出しに失敗しました。時間をおいて再度お試しください。',
          ],
        };
      }
    },
    []
  );

  return { calculateShipping };
}
