import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

// Function to determine pricing based on business type, location, and randomness
function determinePrice(businessType, address) {
  const prices = [299, 199, 149];

  // Premium business types that might pay more
  const premiumTypes = ['restaurant', 'hotel', 'salon', 'spa', 'dental', 'medical', 'law', 'accountant'];
  // Budget-conscious types
  const budgetTypes = ['cafe', 'takeaway', 'shop', 'repair'];

  // Check location for affluent areas (simple heuristic based on postcode areas)
  const affluent = address.match(/SW1|SW3|SW7|W1|W8|NW3|NW8|EC1|EC2|EC3|EC4/i);

  let weightedPrices = [...prices];

  // Adjust weights based on business type
  const typeStr = (businessType || '').toLowerCase();
  if (premiumTypes.some(t => typeStr.includes(t))) {
    // Premium types more likely to get higher price
    weightedPrices = [299, 299, 199];
  } else if (budgetTypes.some(t => typeStr.includes(t))) {
    // Budget types more likely to get lower price
    weightedPrices = [199, 149, 149];
  }

  // Adjust for location
  if (affluent) {
    // Affluent areas lean toward higher pricing
    weightedPrices = weightedPrices.map(p => p === 149 ? 199 : p);
  }

  // Random selection from weighted prices
  const randomIndex = Math.floor(Math.random() * weightedPrices.length);
  return weightedPrices[randomIndex];
}

export async function POST(req) {
  try {
    const { business, customPrompt } = await req.json();

    if (!business) {
      return NextResponse.json({ error: 'Business data is required' }, { status: 400 });
    }

    // Determine price for this business
    const price = determinePrice(business.business_type, business.address);

    // Add price to business object for the prompt
    const businessWithPrice = {
      ...business,
      price: price
    };

    // Use customPrompt if provided (for different email styles like nosite_part3), otherwise use default
    const promptTemplate = customPrompt || DEFAULT_PROMPTS.emailGeneration;
    const prompt = fillPrompt(promptTemplate, businessWithPrice);

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

    // Add the price to the response so frontend knows what price was used
    return NextResponse.json({ email: { ...email, price } });

  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
