import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_LANGUAGES = ['japanese', 'english', 'chinese', 'korean', 'other'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language } = body;

    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Valid language is required (japanese, english, chinese, korean, other)' },
        { status: 400 }
      );
    }

    await prisma.nativeLanguageResponse.upsert({
      where: { language },
      update: { responseCount: { increment: 1 } },
      create: { language, responseCount: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording native language response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.nativeLanguageResponse.findMany({
      orderBy: { responseCount: 'desc' },
      select: { language: true, responseCount: true },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching native language responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
