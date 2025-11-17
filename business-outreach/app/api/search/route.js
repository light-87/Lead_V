import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(req) {
  try {
    const { city, count } = await req.json();

    if (!city || !count) {
      return NextResponse.json({ error: 'City and count are required' }, { status: 400 });
    }

    const prompt = fillPrompt(DEFAULT_PROMPTS.businessSearch, { city, count });

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
      return NextResponse.json({ error: 'Failed to search businesses' }, { status: res.status });
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from the response
    let businesses = [];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      businesses = parsed.businesses || [];
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', content);
      return NextResponse.json({ error: 'Failed to parse business data' }, { status: 500 });
    }

    // Add screenshots and metadata to each business
    const withScreenshots = businesses.map(b => ({
      ...b,
      id: crypto.randomUUID(),
      screenshot_url: `https://api.screenshotmachine.com/?key=${process.env.SCREENSHOT_API_KEY}&url=${encodeURIComponent(b.website)}&dimension=1024x768`,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({ businesses: withScreenshots });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
