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
      description: 'Similar to Part 1 but offers free preview - for £299+ category only',
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
    },
    professional: {
      name: 'Professional',
      description: 'Standard professional business email with detailed analysis',
      prompt: `You are an expert web design, SEO, and digital marketing consultant analyzing a local business website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Phone: {phone}
- Email: {email}
- Description: {description}

Website Screenshot: {screenshot_url}
{additionalNotes}

Your Task:
Analyze this website screenshot and create a HIGHLY PERSONALIZED outreach email that demonstrates deep research.

What to Include:

1. OPENING (1-2 sentences):
   - Reference something SPECIFIC you see on their website
   - Mention their location naturally

2. SPECIFIC WEBSITE ISSUES (Pick 3-4 most visible):
   - Homepage design problems
   - Navigation/UX issues
   - Mobile responsiveness
   - Missing trust elements
   - SEO red flags

3. LOCAL SEO & COMPETITION:
   - How local customers search for {business_type}s in {address}
   - Competitors in the area have better online presence

4. BUSINESS IMPACT:
   - Show how issues lose them customers

5. URGENCY:
   - Seasonal opportunity or competition angle

6. SOFT CALL-TO-ACTION:
   - Offer free audit or 15-min consultation

Return ONLY valid JSON (no markdown, no extra text):
{
  "email_body": "Complete email text (3-4 paragraphs, 200-250 words)",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3", "Issue 4"],
  "subject_line": "Personalized subject line mentioning their business name"
}

CRITICAL RULES:
1. Be ULTRA-SPECIFIC - reference actual visible elements
2. Use their business name, type, and location naturally
3. Sound like you manually researched their site
4. Professional but warm tone
5. Every sentence unique to this business
6. Return ONLY the JSON object, nothing else`
    },
    casual: {
      name: 'Casual & Friendly',
      description: 'Warm, conversational tone like a local helping another local',
      prompt: `You are a friendly local business consultant who genuinely wants to help other small businesses succeed.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Screenshot: {screenshot_url}
{additionalNotes}

Create a warm, casual email that feels like one small business owner reaching out to another. Use contractions, friendly language, and shorter sentences. Be specific about what you noticed on their site, but keep it conversational and helpful - not salesy.

Structure:
1. Hey/Hi greeting with their name
2. Quick intro - mention you came across their site
3. Point out 2-3 things you noticed (conversationally)
4. Offer to chat or share some quick tips
5. Friendly sign-off

Keep it under 180 words. Make it feel genuine and helpful.

Return ONLY JSON:
{
  "email_body": "Friendly, casual email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Casual, friendly subject line"
}`
    },
    formal: {
      name: 'Formal & Corporate',
      description: 'Highly formal business proposal with industry standards',
      prompt: `You are a senior digital transformation consultant preparing a formal business proposal.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Screenshot: {screenshot_url}
{additionalNotes}

Create a highly formal, corporate-style outreach email. Use:
- Formal business language and structure
- Industry terminology and best practices
- Data-driven insights
- Professional proposal format

Structure:
1. Formal greeting and introduction
2. Executive summary of observations
3. Detailed analysis of digital presence deficiencies
4. Industry benchmarking reference
5. Strategic recommendations overview
6. Formal call-to-action for consultation

250-300 words. Ultra-professional tone.

Return ONLY JSON:
{
  "email_body": "Formal, corporate email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3", "Issue 4"],
  "subject_line": "Formal professional subject line"
}`
    },
    direct: {
      name: 'Direct & Brief',
      description: 'No-nonsense, straight facts approach',
      prompt: `You are a direct, efficient consultant who values time and clarity.

Business: {name}
Type: {business_type}
Website: {website}
Screenshot: {screenshot_url}
{additionalNotes}

Create a super direct, no-fluff email. Structure:
1. One sentence intro
2. Bullet points of problems (3-4 specific issues)
3. One sentence impact statement
4. One sentence offer

Maximum 120 words total. Be respectful but blunt and factual.

Return ONLY JSON:
{
  "email_body": "Direct, brief email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Direct, clear subject line"
}`
    },
    valueFirst: {
      name: 'Value-Focused',
      description: 'Lead with benefits, ROI, and free value',
      prompt: `You are a growth-focused consultant who leads with value and results.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Screenshot: {screenshot_url}
{additionalNotes}

Create an email that STARTS with value. Don't lead with problems - lead with opportunities and what they'll gain.

Structure:
1. Open with a specific opportunity or insight you have for them
2. Offer something free upfront (3 tips, a quick audit, insights)
3. Then mention what you noticed (frame as opportunities)
4. Focus on ROI, business growth, and revenue impact
5. CTA that emphasizes what they get, not what you want

220-250 words. Positive, growth-focused tone.

Return ONLY JSON:
{
  "email_body": "Value-focused email text",
  "key_issues": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "subject_line": "Value-focused subject line emphasizing benefit"
}`
    },
    weibo: {
      name: 'Weibo',
      description: 'Concise, social media-style approach with modern tone',
      prompt: `You are a modern digital marketing consultant creating a concise, social media-savvy outreach email.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Screenshot: {screenshot_url}
{additionalNotes}

Create a short, punchy email with a modern, social media-influenced tone. Think Weibo/Twitter style - concise, engaging, and to the point.

Structure:
1. Quick, attention-grabbing opening (reference something specific from their site)
2. 2-3 key issues in short, impactful sentences
3. Focus on mobile-first and social media presence
4. Modern call-to-action (DM, quick chat, video call)

Keep it ultra-short: 120-150 words max. Use short paragraphs (1-2 sentences each). Modern, energetic tone.

Return ONLY JSON:
{
  "email_body": "Concise, modern email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Punchy, modern subject line"
}`
    },
    vaibhav: {
      name: 'Vaibhav',
      description: 'Ultra-detailed analysis with comprehensive website audit',
      prompt: `You are an expert web design, SEO, and digital marketing consultant analyzing a local business website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Phone: {phone}
- Email: {email}
- Description: {description}

Website Screenshot: {screenshot_url}
{additionalNotes}

Your Task:
Analyze this website screenshot and create a HIGHLY PERSONALIZED outreach email that demonstrates deep research. The email should feel like you spent 30+ minutes studying their website, not using a template.

What to Include:

1. OPENING (1-2 sentences):
   - Reference something SPECIFIC you see on their website (their tagline, a product, their color scheme, a photo, their menu)
   - Mention their location/neighborhood naturally
   - Make it feel like a genuine discovery

2. SPECIFIC WEBSITE ISSUES (Pick 3-4 most visible):
   - Homepage design problems (cluttered layout, poor hero section, unclear value proposition)
   - Navigation/UX issues (hard to find contact info, no clear CTAs, confusing menu)
   - Mobile responsiveness problems (if visible in screenshot)
   - Missing trust elements (no reviews, testimonials, or credentials visible)
   - Outdated design elements (old fonts, dated images, 2010s style)
   - SEO red flags (slow loading indicators, missing key information)
   - Missing conversion elements (no booking button, unclear next steps)

3. LOCAL SEO & COMPETITION ANGLE:
   - Mention how local customers search for {business_type}s in {address}
   - Reference that competitors in their area have better online presence
   - Explain how improving their site will help them appear in "near me" searches

4. BUSINESS IMPACT (For each issue, explain):
   - "This means potential customers are leaving your site within seconds"
   - "You're losing bookings/sales to competitors with better websites"
   - "Local customers searching on mobile can't easily contact you"

5. URGENCY (Pick one angle):
   - Seasonal opportunity (holiday season, summer bookings, etc.)
   - Local competition is getting ahead
   - Google's recent algorithm changes favor modern, fast websites
   - Mobile-first indexing means their mobile site matters more than ever

6. SOFT CALL-TO-ACTION:
   - Offer a free, no-obligation website audit report
   - Or a quick 15-minute consultation call
   - Make it feel helpful, not salesy

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no extra text) with this exact structure:

{
  "email_body": "Your complete email text here (3-4 paragraphs, specific observations, natural tone)",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Personalized subject line mentioning their business name"
}

CRITICAL RULES:
1. Be ULTRA-SPECIFIC - reference actual visible elements from their website
2. Use their business name, type, and location naturally throughout
3. Sound like you manually researched their site, not using AI
4. Professional but warm and friendly tone (like a local consultant)
5. NO generic templates - every sentence should be unique to this business
6. Make them feel like you genuinely want to help, not just sell
7. Keep email body to 200-250 words maximum
8. Return ONLY the JSON object, nothing else`
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
