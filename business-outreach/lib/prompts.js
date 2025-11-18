export const DEFAULT_PROMPTS = {
  businessSearch: `Find {count} small LOCAL businesses in {city}, UK. Focus ONLY on independent, locally-owned businesses - NO chains, NO franchises, NO big brands.

{excludeBusinesses}

CRITICAL REQUIREMENT: Find businesses that DO NOT have a website. These should be businesses that only have:
- Google My Business listing
- Facebook page only
- Just a phone number in directories
- No web presence at all

Search online for each business and confirm they DO NOT have a proper website. If they have a website, SKIP them and find another business.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "businesses": [
    {
      "business_type": "restaurant/cafe/shop/salon/plumber/electrician/other service",
      "name": "Business Name",
      "address": "Full address with postcode, UK",
      "phone": "+44XXXXXXXXXX",
      "email": "contact@example.com or empty string if not found",
      "description": "Brief 1-line description of what they do"
    }
  ]
}

REQUIREMENTS:
- Return ONLY the JSON object
- Each business MUST NOT have a website
- Phone numbers MUST include +44 country code
- Return EXACTLY {count} businesses total
- NO chains or franchises
- Include various business types (restaurants, cafes, shops, salons, plumbers, electricians, etc.)`,

  emailGeneration: `You are a friendly local business helper writing a simple, genuine email to a local business without a website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Phone: {phone}
- Description: {description}
- Suggested Price: £{price}

Create a DIRECT, SIMPLE, and GENUINE email with this exact structure:

1. OPENING: Start with "I was trying to find your website and couldn't find it."

2. BODY (Keep it simple and genuine):
   - Mention their business name, what they do, and where they are
   - Explain simply how having a website helps local customers find them
   - Mention that people search online for [their business type] in [their area]
   - Use very simple language - NO technical jargon
   - Sound genuinely helpful, not salesy
   - Keep it conversational and warm

3. OFFER:
   - Mention you can help them get a professional website
   - Include the price: £{price} (use this exact price provided)
   - Make it sound like a good deal without being pushy

4. CLOSING (IMPORTANT - Use this EXACT signature, do not modify):
Would you prefer a 2-minute video walkthrough or a quick call?

Best Regards,
Krishna Sonecha
Director of A2K AI Limited
+44 7504 201946

Return ONLY valid JSON:
{
  "email_body": "Complete email with the hardcoded signature at the end. Keep total length 150-200 words. Be direct, simple, and genuine.",
  "key_issues": ["No website", "Missing online presence", "Hard for customers to find online"],
  "subject_line": "Quick question about {name}"
}

CRITICAL RULES:
1. Start with "I was trying to find your website and couldn't find it."
2. Use VERY simple language - no technical terms
3. Be genuine and helpful, not salesy
4. ALWAYS include the exact signature provided above at the end of email_body
5. Use the price £{price} that was provided
6. Mention their business name, type, and location naturally
7. Keep it short and direct (150-200 words total)
8. Return ONLY the JSON object, nothing else`,

  emailStyles: {
    nosite: {
      name: 'No Site',
      description: 'Direct, genuine approach for businesses without websites',
      prompt: `You are a friendly local business helper writing a simple, genuine email to a local business without a website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Phone: {phone}
- Description: {description}
- Suggested Price: £{price}

Create a DIRECT, SIMPLE, and GENUINE email with this exact structure:

1. OPENING: Start with "I was trying to find your website and couldn't find it."

2. BODY (Keep it simple and genuine):
   - Mention their business name, what they do, and where they are
   - Explain simply how having a website helps local customers find them
   - Mention that people search online for [their business type] in [their area]
   - Use very simple language - NO technical jargon
   - Sound genuinely helpful, not salesy
   - Keep it conversational and warm

3. OFFER:
   - Mention you can help them get a professional website
   - Include the price: £{price} (use this exact price provided)
   - Make it sound like a good deal without being pushy

4. CLOSING (IMPORTANT - Use this EXACT signature, do not modify):
Would you prefer a 2-minute video walkthrough or a quick call?

Best Regards,
Krishna Sonecha
Director of A2K AI Limited
+44 7504 201946

Return ONLY valid JSON:
{
  "email_body": "Complete email with the hardcoded signature at the end. Keep total length 150-200 words. Be direct, simple, and genuine.",
  "key_issues": ["No website", "Missing online presence", "Hard for customers to find online"],
  "subject_line": "Quick question about {name}"
}

CRITICAL RULES:
1. Start with "I was trying to find your website and couldn't find it."
2. Use VERY simple language - no technical terms
3. Be genuine and helpful, not salesy
4. ALWAYS include the exact signature provided above at the end of email_body
5. Use the price £{price} that was provided
6. Mention their business name, type, and location naturally
7. Keep it short and direct (150-200 words total)
8. Return ONLY the JSON object, nothing else`
    },
    nosite_part2: {
      name: 'No Site Part 2',
      description: 'Shock value approach - direct message about 2025 digital reality',
      prompt: `You are a direct, no-nonsense business advisor writing a wake-up call email to a local business without a website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Phone: {phone}
- Description: {description}
- Suggested Price: £{price}

Create a SHORT, DIRECT email with this exact structure:

1. OPENING (SHOCK VALUE): Start with something like "This might sound blunt, but in 2025 not having a proper website is like not having a sign above your front door."

2. BODY (Keep it SHORT - 80-100 words max):
   - Express the reality: customers check businesses online before visiting/calling
   - No website = they pick the competitor who shows up
   - Be direct but not rude
   - Make it feel like a genuine concern, not a sales pitch

3. OFFER:
   - Brief mention you build websites for small UK businesses
   - Include the price: £{price}
   - Keep it simple and direct

4. CLOSING (IMPORTANT - Use this EXACT signature, do not modify):
Would you prefer a 2-minute video walkthrough or a quick call?

Best Regards,
Krishna Sonecha
Director of A2K AI Limited
+44 7504 201946

Return ONLY valid JSON:
{
  "email_body": "Complete email with the hardcoded signature at the end. Keep total length 120-150 words. Be direct and genuine.",
  "key_issues": ["No website", "Missing in 2025", "Losing customers to competitors"],
  "subject_line": "Quick reality check - {name}"
}

CRITICAL RULES:
1. Keep it SHORT - 120-150 words total
2. Start with the shock value opening about 2025
3. Be direct but not rude or aggressive
4. ALWAYS include the exact signature provided above at the end of email_body
5. Use the price £{price} that was provided
6. Sound genuinely concerned, not salesy
7. Return ONLY the JSON object, nothing else`
    },
    nosite_part3: {
      name: 'No Site Part 3',
      description: 'Similar to Part 1 but offers free preview - the free website preview offer',
      prompt: `You are a friendly local business helper writing a simple, genuine email to a local business without a website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Phone: {phone}
- Description: {description}
- Suggested Price: £{price}

Create a DIRECT, SIMPLE, and GENUINE email with this exact structure:

1. OPENING: Start with "I was trying to find your website and couldn't find it."

2. BODY (Keep it simple and genuine):
   - Mention their business name, what they do, and where they are
   - Explain simply how having a website helps local customers find them
   - Mention that people search online for [their business type] in [their area]
   - Use very simple language - NO technical jargon
   - Sound genuinely helpful, not salesy
   - Keep it conversational and warm

3. OFFER:
   - Mention you can help them get a professional website
   - Include the price: £{price} (use this exact price provided)
   - IMPORTANT: Mention you can create a free preview of their site without any payment first
   - Make it sound like a good deal without being pushy

4. CLOSING (IMPORTANT - Use this EXACT signature, do not modify):
Would you prefer a 2-minute video walkthrough or a quick call?

Best Regards,
Krishna Sonecha
Director of A2K AI Limited
+44 7504 201946

Return ONLY valid JSON:
{
  "email_body": "Complete email with the hardcoded signature at the end. Keep total length 150-200 words. Be direct, simple, and genuine. MUST mention free preview.",
  "key_issues": ["No website", "Missing online presence", "Hard for customers to find online"],
  "subject_line": "Quick question about {name}"
}

CRITICAL RULES:
1. Start with "I was trying to find your website and couldn't find it."
2. Use VERY simple language - no technical terms
3. Be genuine and helpful, not salesy
4. ALWAYS include the exact signature provided above at the end of email_body
5. Use the price £{price} that was provided
6. MUST mention that you can create a free preview without payment first
7. Mention their business name, type, and location naturally
8. Keep it short and direct (150-200 words total)
9. Return ONLY the JSON object, nothing else`
    }
  }
};

export function fillPrompt(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replaceAll(`{${key}}`, val);
  });
  return result;
}
