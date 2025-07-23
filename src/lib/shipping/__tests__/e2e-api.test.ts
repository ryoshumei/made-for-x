import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/shipping/recommend/route';

// These tests use the actual API route without mocking
describe('End-to-End API Tests', () => {
  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/shipping/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  describe('Real API Request Processing', () => {
    test('should process valid shipping request successfully', async () => {
      const request = createRequest({
        length: 20,
        width: 15,
        height: 3,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('groups');
      expect(data).toHaveProperty('totalAvailable');
      expect(Array.isArray(data.groups)).toBe(true);
      expect(typeof data.totalAvailable).toBe('number');

      // If we have seed data, should have results
      if (data.totalAvailable > 0) {
        expect(data.groups.length).toBeGreaterThan(0);
        
        // Verify group structure
        data.groups.forEach((group: any) => {
          expect(['らくらくメルカリ便', 'ゆうゆうメルカリ便']).toContain(group.categoryName);
          expect(Array.isArray(group.options)).toBe(true);
          expect(group.options.length).toBeGreaterThan(0);
          expect(group.options.length).toBeLessThanOrEqual(3);

          // Verify option structure
          group.options.forEach((option: any) => {
            expect(option).toHaveProperty('id');
            expect(option).toHaveProperty('totalPrice');
            expect(option).toHaveProperty('optionName');
            expect(typeof option.totalPrice).toBe('number');
            expect(option.totalPrice).toBeGreaterThan(0);
          });
        });
      }
    });

         test('should find specific shipping options for known sizes', async () => {
       // Test ネコポス dimensions (should work if seed data exists)
       const nekoposRequest = createRequest({
         length: 25,
         width: 20,
         height: 2,
       });

       const response = await POST(nekoposRequest);
       const data = await response.json();

      expect(response.status).toBe(200);
      
      if (data.totalAvailable > 0) {
        // Should have options from both categories
        const categoryNames = data.groups.map((g: any) => g.categoryName);
        expect(categoryNames.length).toBeGreaterThan(0);
        
        // Check for price sorting within groups
        data.groups.forEach((group: any) => {
          for (let i = 0; i < group.options.length - 1; i++) {
            expect(group.options[i].totalPrice).toBeLessThanOrEqual(
              group.options[i + 1].totalPrice
            );
          }
        });
      }
    });

    test('should handle weight warnings correctly', async () => {
      const request = createRequest({
        length: 30,
        width: 20,
        height: 2,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      if (data.totalAvailable > 0 && data.weightWarnings) {
        expect(Array.isArray(data.weightWarnings)).toBe(true);
        
        // Each warning should contain option name and weight limit
        data.weightWarnings.forEach((warning: string) => {
          expect(warning).toContain('最大重量');
          expect(warning).toContain('kg');
        });
      }
    });
  });

  describe('Input Validation with Real API', () => {
    test('should reject invalid input types', async () => {
      const request = createRequest({
        length: '10',  // string instead of number
        width: 10,
        height: 10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.invalidReasons).toContain('長さ、幅、高さは数値である必要があります');
    });

    test('should reject negative dimensions', async () => {
      const request = createRequest({
        length: -5,
        width: 10,
        height: 10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.invalidReasons).toContain('サイズは0より大きくなければなりません');
    });

    test('should reject oversized dimensions', async () => {
      const request = createRequest({
        length: 250,
        width: 10,
        height: 10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.invalidReasons).toContain('一辺のサイズは200cmを超えることはできません');
    });

    test('should reject missing fields', async () => {
      const request = createRequest({
        length: 10,
        width: 10,
        // height missing
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.invalidReasons).toContain('長さ、幅、高さは数値である必要があります');
    });

    test('should reject null body', async () => {
      const request = createRequest(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.invalidReasons).toContain('リクエストボディが必要です');
    });
  });

  describe('Edge Cases with Real API', () => {
    test('should handle very small dimensions', async () => {
      const request = createRequest({
        length: 0.1,
        width: 0.1,
        height: 0.1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should either find options or have valid empty response
      expect(data).toHaveProperty('totalAvailable');
      expect(data).toHaveProperty('groups');
    });

    test('should handle maximum valid dimensions', async () => {
      const request = createRequest({
        length: 200,
        width: 200,
        height: 200,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalAvailable');
      expect(data).toHaveProperty('groups');
    });

    test('should handle decimal dimensions', async () => {
      const request = createRequest({
        length: 15.5,
        width: 12.3,
        height: 2.7,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalAvailable');
    });
  });

  describe('Performance and Reliability', () => {
    test('should respond within reasonable time', async () => {
      const request = createRequest({
        length: 20,
        width: 15,
        height: 5,
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      
      // Should respond within 2 seconds
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        createRequest({
          length: 10 + i,
          width: 10 + i,
          height: 2,
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => POST(request))
      );
      const endTime = Date.now();

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should handle concurrent requests efficiently
      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should maintain data consistency across requests', async () => {
      const sameRequest = {
        length: 25,
        width: 20,
        height: 3,
      };

      // Make the same request multiple times
      const responses = await Promise.all([
        POST(createRequest(sameRequest)),
        POST(createRequest(sameRequest)),
        POST(createRequest(sameRequest)),
      ]);

      const results = await Promise.all(
        responses.map(response => response.json())
      );

      // All should have identical results
      const firstResult = JSON.stringify(results[0]);
      results.forEach(result => {
        expect(JSON.stringify(result)).toBe(firstResult);
      });
    });
  });

  describe('Response Format Validation', () => {
    test('should always return valid response structure', async () => {
      const request = createRequest({
        length: 15,
        width: 10,
        height: 5,
      });

      const response = await POST(request);
      const data = await response.json();

      // Required fields should always be present
      expect(data).toHaveProperty('groups');
      expect(data).toHaveProperty('totalAvailable');
      expect(Array.isArray(data.groups)).toBe(true);
      expect(typeof data.totalAvailable).toBe('number');

      // Optional fields should be correct type when present
      if (data.weightWarnings) {
        expect(Array.isArray(data.weightWarnings)).toBe(true);
      }
      if (data.invalidReasons) {
        expect(Array.isArray(data.invalidReasons)).toBe(true);
      }
    });

    test('should have consistent option properties', async () => {
      const request = createRequest({
        length: 20,
        width: 15,
        height: 4,
      });

      const response = await POST(request);
      const data = await response.json();

      if (data.totalAvailable > 0) {
        data.groups.forEach((group: any) => {
          group.options.forEach((option: any) => {
            // Required properties
            expect(typeof option.id).toBe('number');
            expect(typeof option.categoryName).toBe('string');
            expect(typeof option.serviceName).toBe('string');
            expect(typeof option.optionName).toBe('string');
            expect(typeof option.totalPrice).toBe('number');
            expect(typeof option.requiresSpecialPackaging).toBe('boolean');
            expect(typeof option.priceType).toBe('string');

            // Nullable properties should be null or correct type
            if (option.basePrice !== null) {
              expect(typeof option.basePrice).toBe('number');
            }
            if (option.maxWeightKg !== null) {
              expect(typeof option.maxWeightKg).toBe('number');
            }
          });
        });
      }
    });
  });
}); 