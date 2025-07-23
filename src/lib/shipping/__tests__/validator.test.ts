import { validateShippingDimensions, validateRequestBody } from '../validator';
import { ShippingDimensions } from '../types';

describe('validateShippingDimensions', () => {
  describe('Valid dimensions', () => {
    test('should validate normal dimensions', () => {
      const dimensions: ShippingDimensions = { length: 10, width: 10, height: 10 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate maximum allowed dimensions', () => {
      const dimensions: ShippingDimensions = { length: 200, width: 200, height: 200 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate minimum positive dimensions', () => {
      const dimensions: ShippingDimensions = { length: 0.1, width: 0.1, height: 0.1 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid dimensions - size constraints', () => {
    test('should reject zero dimensions', () => {
      const dimensions: ShippingDimensions = { length: 0, width: 10, height: 10 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('サイズは0より大きくなければなりません');
    });

    test('should reject negative dimensions', () => {
      const dimensions: ShippingDimensions = { length: -5, width: 10, height: 10 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('サイズは0より大きくなければなりません');
    });

    test('should reject dimensions over 200cm', () => {
      const dimensions: ShippingDimensions = { length: 201, width: 10, height: 10 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('一辺のサイズは200cmを超えることはできません');
    });

    test('should reject multiple invalid dimensions', () => {
      const dimensions: ShippingDimensions = { length: -1, width: 0, height: 250 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('サイズは0より大きくなければなりません');
      expect(result.errors).toContain('一辺のサイズは200cmを超えることはできません');
    });
  });

  describe('Edge cases', () => {
    test('should handle exactly 200cm dimensions', () => {
      const dimensions: ShippingDimensions = { length: 200, width: 200, height: 200 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject exactly 0 dimensions', () => {
      const dimensions: ShippingDimensions = { length: 0, width: 0, height: 0 };
      const result = validateShippingDimensions(dimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('サイズは0より大きくなければなりません');
    });
  });
});

describe('validateRequestBody', () => {
  describe('Valid request bodies', () => {
    test('should validate correct request body', () => {
      const body = { length: 10, width: 20, height: 30 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate with decimal values', () => {
      const body = { length: 10.5, width: 20.7, height: 30.2 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid request bodies', () => {
    test('should reject null body', () => {
      const result = validateRequestBody(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('リクエストボディが必要です');
    });

    test('should reject undefined body', () => {
      const result = validateRequestBody(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('リクエストボディが必要です');
    });

    test('should reject missing length', () => {
      const body = { width: 20, height: 30 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('長さ、幅、高さは数値である必要があります');
    });

    test('should reject string values', () => {
      const body = { length: '10', width: 20, height: 30 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('長さ、幅、高さは数値である必要があります');
    });

    test('should reject boolean values', () => {
      const body = { length: true, width: 20, height: 30 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('長さ、幅、高さは数値である必要があります');
    });

    test('should cascade validation errors', () => {
      const body = { length: -1, width: 0, height: 250 };
      const result = validateRequestBody(body);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('サイズは0より大きくなければなりません');
      expect(result.errors).toContain('一辺のサイズは200cmを超えることはできません');
    });
  });
}); 