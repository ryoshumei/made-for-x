import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PageContext, getTagsByContext } from '@/config/quick-action-tags';

const prisma = new PrismaClient();

/**
 * Validates if a tagId exists for the given page context
 */
function isValidTag(tagId: string, pageContext: PageContext): boolean {
  const tags = getTagsByContext(pageContext);
  return tags.some((tag) => tag.id === tagId);
}

/**
 * POST method to record a tag click
 * Upserts click count for the given tagId and pageContext on today's date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId, pageContext } = body;

    // Validate required fields
    if (!tagId || typeof tagId !== 'string') {
      return NextResponse.json({ error: 'Valid tagId is required' }, { status: 400 });
    }

    if (!pageContext || !['email', 'reply', 'chat'].includes(pageContext)) {
      return NextResponse.json(
        { error: 'Valid pageContext is required (email, reply, or chat)' },
        { status: 400 }
      );
    }

    // Validate tag exists for this context
    if (!isValidTag(tagId, pageContext as PageContext)) {
      return NextResponse.json(
        { error: 'Invalid tagId for the specified pageContext' },
        { status: 400 }
      );
    }

    // Get today's date (start of day in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert: increment click count if exists, create if not
    const result = await prisma.tagClickEvent.upsert({
      where: {
        tagId_pageContext_date: {
          tagId,
          pageContext,
          date: today,
        },
      },
      update: {
        clickCount: {
          increment: 1,
        },
      },
      create: {
        tagId,
        pageContext,
        date: today,
        clickCount: 1,
      },
    });

    return NextResponse.json({
      success: true,
      tagId: result.tagId,
      pageContext: result.pageContext,
      clickCount: result.clickCount,
    });
  } catch (error) {
    console.error('Error recording tag click:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET method to retrieve tag click statistics
 * Supports filtering by tagId, pageContext, and date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');
    const pageContext = searchParams.get('pageContext');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause based on provided filters
    const where: {
      tagId?: string;
      pageContext?: string;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (tagId) {
      where.tagId = tagId;
    }

    if (pageContext && ['email', 'reply', 'chat'].includes(pageContext)) {
      where.pageContext = pageContext;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get aggregated stats grouped by tagId and pageContext
    const stats = await prisma.tagClickEvent.groupBy({
      by: ['tagId', 'pageContext'],
      where,
      _sum: {
        clickCount: true,
      },
      orderBy: {
        _sum: {
          clickCount: 'desc',
        },
      },
    });

    // Get total click count
    const totalClicks = await prisma.tagClickEvent.aggregate({
      where,
      _sum: {
        clickCount: true,
      },
    });

    return NextResponse.json({
      stats: stats.map((s) => ({
        tagId: s.tagId,
        pageContext: s.pageContext,
        totalClicks: s._sum.clickCount ?? 0,
      })),
      totalClicks: totalClicks._sum.clickCount ?? 0,
    });
  } catch (error) {
    console.error('Error fetching tag click stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
