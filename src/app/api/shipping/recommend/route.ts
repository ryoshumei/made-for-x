import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateRequestBody } from '@/lib/shipping/validator';
import { calculateShippingOptions } from '@/lib/shipping/calculator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Input validation
    const validation = validateRequestBody(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          groups: [],
          totalAvailable: 0,
          invalidReasons: validation.errors,
        },
        { status: 400 }
      );
    }

    const { length, width, height } = body;

    // Calculate shipping options
    const result = await calculateShippingOptions({
      dimensions: { length, width, height },
      prisma,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Shipping API Error:', error);
    return NextResponse.json(
      {
        groups: [],
        totalAvailable: 0,
        invalidReasons: ['サーバー内部エラーが発生しました'],
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
