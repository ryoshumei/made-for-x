import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language mapping function
function getLangString(val: number): string {
  switch (val) {
    case 1:
      return "日本語";
    case 2:
      return "English";
    case 3:
      return "简体中文";
    case 4:
      return "繁體中文";
    default:
      return "日本語";
  }
}

export async function POST(request: Request) {
  try {
    const { recipient, signature, text, lang } = await request.json();
    
    // Validate required fields
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const langString = getLangString(lang || 1);
    
    // System content based on Django implementation
    const systemContent = `Please create the body of the ${langString} business email based on the following details. Use professional and appropriate business email format. Include proper greetings and closing statements suitable for business correspondence.`;
    
    const userContent = `宛名: ${recipient || ''}\n署名: ${signature || ''}\n要件: ${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
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
    console.error('Error generating email:', error);
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
} 