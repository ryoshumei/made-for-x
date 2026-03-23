/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// eslint-disable-next-line no-var
var mockNativeLanguageResponse: { upsert: jest.Mock; findMany: jest.Mock };

jest.mock('@prisma/client', () => {
  mockNativeLanguageResponse = {
    upsert: jest.fn(),
    findMany: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      nativeLanguageResponse: mockNativeLanguageResponse,
    })),
  };
});

// Suppress console output during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('/api/native-language', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('successfully records a language response', async () => {
      const mockResult = {
        id: 1,
        language: 'japanese',
        responseCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockNativeLanguageResponse.upsert.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/native-language', {
        method: 'POST',
        body: JSON.stringify({ language: 'japanese' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockNativeLanguageResponse.upsert).toHaveBeenCalledWith({
        where: { language: 'japanese' },
        update: { responseCount: { increment: 1 } },
        create: { language: 'japanese', responseCount: 1 },
      });
    });

    it.each(['japanese', 'english', 'chinese', 'korean', 'other'])(
      'accepts valid language: %s',
      async (language) => {
        mockNativeLanguageResponse.upsert.mockResolvedValue({ id: 1, language, responseCount: 1 });

        const request = new NextRequest('http://localhost:3000/api/native-language', {
          method: 'POST',
          body: JSON.stringify({ language }),
          headers: { 'Content-Type': 'application/json' },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    );

    it('returns 400 for invalid language value', async () => {
      const request = new NextRequest('http://localhost:3000/api/native-language', {
        method: 'POST',
        body: JSON.stringify({ language: 'invalid' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns 400 when language is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/native-language', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 500 for malformed JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/native-language', {
        method: 'POST',
        body: 'not valid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('returns 500 on database error', async () => {
      mockNativeLanguageResponse.upsert.mockRejectedValue(new Error('DB error'));

      const request = new NextRequest('http://localhost:3000/api/native-language', {
        method: 'POST',
        body: JSON.stringify({ language: 'japanese' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('GET', () => {
    it('returns all responses ordered by responseCount descending', async () => {
      const mockData = [
        { language: 'japanese', responseCount: 50 },
        { language: 'english', responseCount: 20 },
      ];
      mockNativeLanguageResponse.findMany.mockResolvedValue(mockData);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].language).toBe('japanese');
      expect(data.data[0].responseCount).toBe(50);
      expect(mockNativeLanguageResponse.findMany).toHaveBeenCalledWith({
        orderBy: { responseCount: 'desc' },
        select: { language: true, responseCount: true },
      });
    });

    it('returns 500 on database error', async () => {
      mockNativeLanguageResponse.findMany.mockRejectedValue(new Error('DB error'));

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });
});
