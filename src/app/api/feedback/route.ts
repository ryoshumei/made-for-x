import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST method to submit general feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackTypes, toolFeedback, customFeedback, userAgent } = body;

    // Basic validation
    if (!feedbackTypes || typeof feedbackTypes !== 'object') {
      return NextResponse.json({ error: 'Valid feedback types are required' }, { status: 400 });
    }

    // Check if at least one feedback type is selected or custom feedback is provided
    const hasValidFeedback =
      Object.values(feedbackTypes).some(Boolean) || (customFeedback && customFeedback.trim());

    if (!hasValidFeedback) {
      return NextResponse.json(
        { error: 'At least one feedback option must be selected or custom feedback provided' },
        { status: 400 }
      );
    }

    // Get IP address for analytics
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Save feedback to database
    const feedback = await prisma.generalFeedback.create({
      data: {
        feedbackTypes,
        toolFeedback: toolFeedback || null,
        customFeedback: customFeedback?.trim() || null,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: feedback.id,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET method to retrieve feedback (optional, for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate pagination parameters
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per request
    const validOffset = Math.max(0, offset);

    const feedbacks = await prisma.generalFeedback.findMany({
      take: validLimit,
      skip: validOffset,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        feedbackTypes: true,
        toolFeedback: true,
        customFeedback: true,
        createdAt: true,
        // Exclude sensitive information like IP and userAgent from public API
      },
    });

    return NextResponse.json({
      feedbacks,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        count: feedbacks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
