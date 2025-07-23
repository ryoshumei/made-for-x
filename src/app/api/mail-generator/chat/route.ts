import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_MODELS } from '@/config/models';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_MAIL,
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
    const { text, lang, includeEmoji } = await request.json();

    // Validate required fields
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const langString = getLangString(lang || 1);

    // System content for business chat generation
    const baseSystemContent = `Please create a business chat message in ${langString} suitable for platforms like Slack, Teams, or other business messaging apps. The message should be:
- Concise and direct (shorter than formal emails)
- Professional but friendly
- Clear and actionable
- Appropriate for workplace communication`;

    const systemContent = includeEmoji
      ? `${baseSystemContent}
- Include appropriate emojis to make it engaging but still professional`
      : baseSystemContent;

    const userContent = `要件: ${text}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.CHAT_COMPLETION,
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
    console.error('Error generating chat message:', error);
    return NextResponse.json({ error: 'Failed to generate chat message' }, { status: 500 });
  }
}
