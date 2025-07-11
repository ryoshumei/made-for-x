import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_MODELS } from '@/config/models';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { receivedMail, text } = await request.json();

    // Validate required fields
    if (!text) {
      return NextResponse.json({ error: 'Reply requirements are required' }, { status: 400 });
    }

    // System content based on Django implementation
    const systemContent =
      'メールを受信しました、返信要件に基づいて、メールの返信文を作成してください。メールは日本語で作成してください。';

    const userContent = `受信したメール: ${receivedMail || ''}\n返信要件: ${text}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.MAIL_REPLY,
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
    console.error('Error generating reply:', error);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
