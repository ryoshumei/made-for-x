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
      model: 'o4-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that provides customs codes for products. Respond with a JSON object containing the 6-digit HS code and the corresponding article description. Format: {"customsCode": "123456", "articleDescription": "CHAPTER NAME (e.g., LIVE ANIMALS; ANIMAL PRODUCTS)"}. Only respond with the JSON object, no additional text.',
        },
        {
          role: 'user',
          content: `Please provide the customs code and article description for ${productName} being exported.`,
        },
      ],
    });

    const responseContent = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent || '{}');

    return NextResponse.json({
      customsCode: parsedResponse.customsCode,
      articleDescription: parsedResponse.articleDescription
    });
  } catch (error) {
    console.error('Error generating customs code:', error);
    return NextResponse.json({ error: 'Failed to generate customs code' }, { status: 500 });
  }
}
