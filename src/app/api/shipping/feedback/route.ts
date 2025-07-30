import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userDimensions, calculationResult, feedbackTypes, customFeedback, userAgent } = body;

    // Validate required fields
    if (!userDimensions || typeof userDimensions !== 'object') {
      return NextResponse.json({ error: 'User dimensions are required' }, { status: 400 });
    }

    if (!feedbackTypes || typeof feedbackTypes !== 'object') {
      return NextResponse.json({ error: 'Feedback types are required' }, { status: 400 });
    }

    // Check if at least one feedback type is selected or custom feedback is provided
    const hasSelectedFeedback =
      Object.values(feedbackTypes).some(Boolean) || (customFeedback && customFeedback.trim());

    if (!hasSelectedFeedback) {
      return NextResponse.json(
        { error: 'At least one feedback option must be selected or custom feedback provided' },
        { status: 400 }
      );
    }

    // Save feedback to database
    const feedback = await prisma.shippingFeedback.create({
      data: {
        userDimensions,
        calculationResult: calculationResult || null,
        feedbackTypes,
        customFeedback: customFeedback?.trim() || null,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        id: feedback.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET method to retrieve feedback (optional, for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const feedbacks = await prisma.shippingFeedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100), // Maximum 100 items
      skip: offset,
    });

    const total = await prisma.shippingFeedback.count();

    return NextResponse.json({
      feedbacks,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
