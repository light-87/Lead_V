import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(req) {
  try {
    const { business } = await req.json();

    if (!business) {
      return NextResponse.json({ error: 'Business data is required' }, { status: 400 });
    }

    const prompt = fillPrompt(DEFAULT_PROMPTS.emailGeneration, business);

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('Perplexity API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate email' }, { status: res.status });
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from the response
    let email = {};
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      email = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse email response:', content);
      return NextResponse.json({ error: 'Failed to parse email data' }, { status: 500 });
    }

    return NextResponse.json({ email });

  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
