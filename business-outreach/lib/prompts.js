export const DEFAULT_PROMPTS = {
  businessSearch: `Find {count} small LOCAL shops and small LOCAL hotels in {city}, UK. Focus ONLY on independent, locally-owned businesses - NO chains, NO franchises, NO big brands.

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
};

export function fillPrompt(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replaceAll(`{${key}}`, val);
  });
  return result;
}
