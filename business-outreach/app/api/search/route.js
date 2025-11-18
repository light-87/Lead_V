import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

// Helper function to generate potential domain names from business name
function generateDomainVariations(businessName) {
  // Clean the business name - remove special characters, convert to lowercase
  const cleaned = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  const domains = [];
  const name = cleaned.replace(/\s+/g, '');
  const nameWithDash = cleaned.replace(/\s+/g, '-');

  // Generate common UK and international domain variations
  domains.push(
    `https://${name}.co.uk`,
    `https://${name}.com`,
    `https://${nameWithDash}.co.uk`,
    `https://${nameWithDash}.com`,
    `https://www.${name}.co.uk`,
    `https://www.${name}.com`
  );

  return domains;
}

// Helper function to check if a URL exists
async function checkUrlExists(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BusinessScanner/1.0)'
      }
    });

    clearTimeout(timeout);

    // If we get a 200-399 status code, the website exists
    return response.ok || (response.status >= 300 && response.status < 400);
  } catch (error) {
    // Network error, timeout, or DNS failure means no website
    return false;
  }
}

// Helper function to check if business has a website via direct URL checking
async function hasWebsiteDirectCheck(business) {
  const domains = generateDomainVariations(business.name);

  // Check all domain variations in parallel
  const checks = await Promise.all(
    domains.map(domain => checkUrlExists(domain))
  );

  // If any domain exists, business has a website
  return checks.some(exists => exists);
}

// Helper function to verify via Perplexity AI
async function verifyNoWebsiteWithAI(business) {
  try {
    const prompt = `Search the web for "${business.name}" in ${business.address}. Does this business have an official website (not just social media pages like Facebook, Instagram, or directory listings like Google My Business, Yelp)?

Answer with ONLY "YES" if they have a proper website, or "NO" if they only have social media or no web presence.

Format your response as JSON: {"has_website": "YES" or "NO", "found_url": "url if found or empty string"}`;

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
      console.error(`AI verification failed for ${business.name}`);
      return false; // If verification fails, assume no website (benefit of the doubt)
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return parsed.has_website === 'YES';
    } catch {
      // If we can't parse, check for YES/NO in the text
      return content.toUpperCase().includes('YES');
    }
  } catch (error) {
    console.error(`AI verification error for ${business.name}:`, error);
    return false; // On error, assume no website
  }
}

// Helper function to send progress update
function sendProgress(encoder, data) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req) {
  try {
    const { city, count, excludeBusinesses = '' } = await req.json();

    if (!city || !count) {
      return NextResponse.json({ error: 'City and count are required' }, { status: 400 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Initial search with Perplexity
          controller.enqueue(sendProgress(encoder, {
            stage: 'searching',
            message: `Searching for businesses in ${city}...`,
            progress: 0
          }));

          const prompt = fillPrompt(DEFAULT_PROMPTS.businessSearch, {
            city,
            count,
            excludeBusinesses: excludeBusinesses || ''
          });

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
            controller.enqueue(sendProgress(encoder, {
              stage: 'error',
              message: 'Failed to search businesses',
              error: true
            }));
            controller.close();
            return;
          }

          const data = await res.json();
          const content = data.choices[0].message.content;

          let businesses = [];
          try {
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanContent);
            businesses = parsed.businesses || [];
          } catch (parseError) {
            console.error('Failed to parse Perplexity response:', content);
            controller.enqueue(sendProgress(encoder, {
              stage: 'error',
              message: 'Failed to parse business data',
              error: true
            }));
            controller.close();
            return;
          }

          controller.enqueue(sendProgress(encoder, {
            stage: 'found',
            message: `Found ${businesses.length} potential businesses. Verifying they have no websites...`,
            progress: 20,
            count: businesses.length
          }));

          // Step 2: Direct URL checking
          controller.enqueue(sendProgress(encoder, {
            stage: 'url_check',
            message: 'Checking for direct website URLs...',
            progress: 30
          }));

          const urlCheckResults = [];
          for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const hasWebsite = await hasWebsiteDirectCheck(business);
            urlCheckResults.push({ business, hasWebsite });

            controller.enqueue(sendProgress(encoder, {
              stage: 'url_check',
              message: `Checked ${i + 1}/${businesses.length} businesses for direct URLs...`,
              progress: 30 + (20 * (i + 1) / businesses.length),
              checked: i + 1,
              total: businesses.length
            }));
          }

          // Filter out businesses with websites found via direct check
          const businessesWithoutDirectWebsite = urlCheckResults
            .filter(result => !result.hasWebsite)
            .map(result => result.business);

          const filteredByUrlCheck = businesses.length - businessesWithoutDirectWebsite.length;

          controller.enqueue(sendProgress(encoder, {
            stage: 'url_check_complete',
            message: `Direct URL check complete. Filtered out ${filteredByUrlCheck} businesses with websites. Verifying remaining ${businessesWithoutDirectWebsite.length}...`,
            progress: 50,
            filtered: filteredByUrlCheck,
            remaining: businessesWithoutDirectWebsite.length
          }));

          // Step 3: AI double-check for remaining businesses
          controller.enqueue(sendProgress(encoder, {
            stage: 'ai_verify',
            message: 'Double-checking with AI verification...',
            progress: 55
          }));

          const verifiedBusinesses = [];
          for (let i = 0; i < businessesWithoutDirectWebsite.length; i++) {
            const business = businessesWithoutDirectWebsite[i];

            // Use AI to verify
            const hasWebsite = await verifyNoWebsiteWithAI(business);

            if (!hasWebsite) {
              verifiedBusinesses.push(business);
            }

            controller.enqueue(sendProgress(encoder, {
              stage: 'ai_verify',
              message: `AI verified ${i + 1}/${businessesWithoutDirectWebsite.length} businesses...`,
              progress: 55 + (35 * (i + 1) / businessesWithoutDirectWebsite.length),
              checked: i + 1,
              total: businessesWithoutDirectWebsite.length,
              verified: verifiedBusinesses.length
            }));
          }

          const filteredByAI = businessesWithoutDirectWebsite.length - verifiedBusinesses.length;

          // Add metadata to verified businesses
          const withMetadata = verifiedBusinesses.map(b => ({
            ...b,
            id: crypto.randomUUID(),
            website: null,
            timestamp: new Date().toISOString()
          }));

          // Step 4: Complete
          controller.enqueue(sendProgress(encoder, {
            stage: 'complete',
            message: `Verification complete! Found ${withMetadata.length} businesses without websites.`,
            progress: 100,
            businesses: withMetadata,
            stats: {
              initial: businesses.length,
              filteredByUrlCheck,
              filteredByAI,
              final: withMetadata.length
            }
          }));

          controller.close();

        } catch (error) {
          console.error('Search error:', error);
          controller.enqueue(sendProgress(encoder, {
            stage: 'error',
            message: error.message,
            error: true
          }));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
