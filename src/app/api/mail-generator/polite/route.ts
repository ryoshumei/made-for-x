import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language mapping function
function getLangString(val: number): string {
  switch (val) {
    case 1:
      return '日本語';
    case 2:
      return 'English';
    case 3:
      return '简体中文';
    case 4:
      return '繁體中文';
    default:
      return '日本語';
  }
}

export async function POST(request: Request) {
  try {
    const { text, lang } = await request.json();

    // Validate required fields
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const langString = getLangString(lang || 1);

    // System content based on Django implementation
    const systemContent = `Please make the following content more polite. Please use ${langString}.`;

    const userContent = text;

    const completion = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error making text more polite:', error);
    return NextResponse.json({ error: 'Failed to make text more polite' }, { status: 500 });
  }
}
