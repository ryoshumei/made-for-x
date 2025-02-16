// app/api/generate-customs-code/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { productName } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that provides customs codes for products. Respond only with the 6-digit HS code, without any additional text or explanation.',
        },
        {
          role: 'user',
          content: `Please provide the customs code for ${productName} being exported.`,
        },
      ],
    });

    const customsCode = completion.choices[0].message.content;

    return NextResponse.json({ customsCode });
  } catch (error) {
    console.error('Error generating customs code:', error);
    return NextResponse.json({ error: 'Failed to generate customs code' }, { status: 500 });
  }
}
