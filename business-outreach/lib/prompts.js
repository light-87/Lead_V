export const DEFAULT_PROMPTS = {
  businessSearch: `Find {count} small LOCAL shops and small LOCAL hotels in {city}, UK. Focus ONLY on independent, locally-owned businesses - NO chains, NO franchises, NO big brands.

{excludeBusinesses}

CRITICAL: For each business, you MUST search online to find their ACTUAL, WORKING website URL.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "businesses": [
    {
      "business_type": "shop" or "hotel",
      "name": "Business Name",
      "address": "Full address with postcode, UK",
      "phone": "+44XXXXXXXXXX",
      "website": "https://www.example.com",
      "email": "contact@example.com",
      "description": "Brief 1-line description"
    }
  ]
}

REQUIREMENTS:
- Return ONLY the JSON object
- ALL websites MUST start with https:// or http://
- Phone numbers MUST include +44 country code
- Return EXACTLY {count} businesses total
- NO chains or franchises`,

  emailGeneration: `You are an expert web design consultant analyzing a local business website.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Create a HIGHLY PERSONALIZED outreach email:

1. OPENING: Reference something SPECIFIC from their website
2. ISSUES: Identify 3-4 visible website problems
3. LOCAL SEO: Explain how improvements help them rank in local searches
4. BUSINESS IMPACT: Show how issues lose them customers
5. URGENCY: Add a timely reason to act now
6. SOFT CTA: Offer free audit or 15-min call

Return ONLY valid JSON:
{
  "email_body": "3-4 paragraphs, ultra-specific, 200-250 words",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Personalized subject with their name"
}

Be ULTRA-SPECIFIC. Sound human, not AI. Return ONLY JSON.`,

  emailStyles: {
    professional: {
      name: 'Professional',
      description: 'Standard professional business email',
      prompt: `You are an expert web design consultant analyzing a local business website.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Create a HIGHLY PERSONALIZED outreach email:

1. OPENING: Reference something SPECIFIC from their website
2. ISSUES: Identify 3-4 visible website problems
3. LOCAL SEO: Explain how improvements help them rank in local searches
4. BUSINESS IMPACT: Show how issues lose them customers
5. URGENCY: Add a timely reason to act now
6. SOFT CTA: Offer free audit or 15-min call

Return ONLY valid JSON:
{
  "email_body": "3-4 paragraphs, ultra-specific, 200-250 words",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Personalized subject with their name"
}

Be ULTRA-SPECIFIC. Sound human, not AI. Return ONLY JSON.`
    },
    casual: {
      name: 'Casual & Friendly',
      description: 'Warm, conversational tone',
      prompt: `Create a warm, casual, and conversational outreach email. Use a friendly tone, shorter sentences, and make it feel like you're a local business owner reaching out to help another. Still be specific about their website issues but in a friendly, non-salesy way. Keep it under 200 words.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Return ONLY JSON:
{
  "email_body": "Friendly, casual email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Friendly subject line"
}`
    },
    formal: {
      name: 'Formal & Corporate',
      description: 'Highly formal business proposal style',
      prompt: `Create a highly formal, corporate-style outreach email. Use business jargon, formal language, and structure it like a professional business proposal. Reference industry standards and best practices. Be ultra-professional. 250 words max.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Return ONLY JSON:
{
  "email_body": "Formal, corporate email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Formal subject line"
}`
    },
    direct: {
      name: 'Direct & Brief',
      description: 'Straight to the point, no fluff',
      prompt: `Create a super direct, to-the-point email. No fluff, just facts. List the problems, explain the impact, offer help. Maximum 150 words. Be respectful but blunt.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Return ONLY JSON:
{
  "email_body": "Direct, brief email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Direct subject line"
}`
    },
    valueFirst: {
      name: 'Value-Focused',
      description: 'Lead with value and benefits',
      prompt: `Create an email that leads with value. Start by offering something free (audit, tips, insights) before mentioning any problems. Focus on what they'll gain, not what they're missing. Emphasize ROI and business growth. 200-250 words.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Return ONLY JSON:
{
  "email_body": "Value-focused email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Value-focused subject line"
}`
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
