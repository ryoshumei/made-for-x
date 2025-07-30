/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    shippingFeedback: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('/api/shipping/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const validRequestData = {
      userDimensions: { length: 10, width: 8, height: 5 },
      calculationResult: { groups: [], totalAvailable: 3 },
      feedbackTypes: {
        pricing: true,
        shippingInfo: false,
        sizeCalculation: false,
        newService: false,
        other: false,
      },
      customFeedback: 'Test feedback',
      userAgent: 'Mozilla/5.0 Test',
    };

    it('successfully creates feedback with valid data', async () => {
      const mockCreatedFeedback = { id: 1, ...validRequestData, createdAt: new Date() };
      (mockPrisma.shippingFeedback.create as jest.Mock).mockResolvedValue(mockCreatedFeedback);

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(validRequestData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.id).toBe(1);
      expect(mockPrisma.shippingFeedback.create).toHaveBeenCalledWith({
        data: {
          userDimensions: validRequestData.userDimensions,
          calculationResult: validRequestData.calculationResult,
          feedbackTypes: validRequestData.feedbackTypes,
          customFeedback: validRequestData.customFeedback,
          userAgent: validRequestData.userAgent,
        },
      });
    });

    it('returns 400 when userDimensions is missing', async () => {
      const invalidData = { ...validRequestData };
      delete (invalidData as any).userDimensions;

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User dimensions are required');
    });

    it('returns 400 when feedbackTypes is missing', async () => {
      const invalidData = { ...validRequestData };
      delete (invalidData as any).feedbackTypes;

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Feedback types are required');
    });

    it('returns 400 when no feedback is selected and no custom feedback provided', async () => {
      const invalidData = {
        ...validRequestData,
        feedbackTypes: {
          pricing: false,
          shippingInfo: false,
          sizeCalculation: false,
          newService: false,
          other: false,
        },
        customFeedback: '',
      };

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'At least one feedback option must be selected or custom feedback provided'
      );
    });

    it('accepts feedback with only custom feedback and no checkboxes selected', async () => {
      const validDataWithOnlyCustom = {
        ...validRequestData,
        feedbackTypes: {
          pricing: false,
          shippingInfo: false,
          sizeCalculation: false,
          newService: false,
          other: false,
        },
        customFeedback: 'Just a custom feedback',
      };

      const mockCreatedFeedback = { id: 1, ...validDataWithOnlyCustom, createdAt: new Date() };
      (mockPrisma.shippingFeedback.create as jest.Mock).mockResolvedValue(mockCreatedFeedback);

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(validDataWithOnlyCustom),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('handles database errors', async () => {
      (mockPrisma.shippingFeedback.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback', {
        method: 'POST',
        body: JSON.stringify(validRequestData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET', () => {
    it('returns feedback list with default pagination', async () => {
      const mockFeedbacks = [
        { id: 1, userDimensions: {}, feedbackTypes: {}, createdAt: new Date() },
        { id: 2, userDimensions: {}, feedbackTypes: {}, createdAt: new Date() },
      ];

      (mockPrisma.shippingFeedback.findMany as jest.Mock).mockResolvedValue(mockFeedbacks);
      (mockPrisma.shippingFeedback.count as jest.Mock).mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.feedbacks).toEqual(mockFeedbacks);
      expect(data.total).toBe(2);
      expect(data.limit).toBe(50);
      expect(data.offset).toBe(0);
      expect(mockPrisma.shippingFeedback.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('applies custom pagination parameters', async () => {
      const mockFeedbacks = [
        { id: 1, userDimensions: {}, feedbackTypes: {}, createdAt: new Date() },
      ];

      (mockPrisma.shippingFeedback.findMany as jest.Mock).mockResolvedValue(mockFeedbacks);
      (mockPrisma.shippingFeedback.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/shipping/feedback?limit=10&offset=20'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(10);
      expect(data.offset).toBe(20);
      expect(mockPrisma.shippingFeedback.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
      });
    });

    it('limits maximum items to 100', async () => {
      const request = new NextRequest('http://localhost:3000/api/shipping/feedback?limit=200');
      await GET(request);

      expect(mockPrisma.shippingFeedback.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 100, // Should be capped at 100
        skip: 0,
      });
    });

    it('handles database errors in GET', async () => {
      (mockPrisma.shippingFeedback.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/shipping/feedback');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
