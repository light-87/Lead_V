import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { DEFAULT_PROMPTS } from '@/lib/prompts';

// Save settings (prompts, preferences)
export async function POST(req) {
  try {
    const { settings } = await req.json();

    if (!settings) {
      return NextResponse.json({ error: 'settings are required' }, { status: 400 });
    }

    const settingsData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    const blob = await put('settings/user-settings.json', JSON.stringify(settingsData), {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get settings
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'settings/' });

    if (blobs.length === 0) {
      // Return default settings
      return NextResponse.json({
        settings: {
          prompts: DEFAULT_PROMPTS,
          emailStyle: 'professional',
          smartlead: {
            campaignId: '2690291',
            enabled: true
          },
          emailStyles: {
            professional: {
              name: 'Professional',
              prompt: DEFAULT_PROMPTS.emailGeneration
            },
            casual: {
              name: 'Casual & Friendly',
              prompt: `Create a warm, casual, and conversational outreach email. Use a friendly tone, shorter sentences, and make it feel like you're a local business owner reaching out to help another. Still be specific about their website issues but in a friendly, non-salesy way. Keep it under 200 words.

Business: {name}, Type: {business_type}, Location: {address}, Website: {website}, Screenshot: {screenshot_url}

Return ONLY JSON:
{
  "email_body": "Friendly, casual email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Friendly subject line"
}`
            },
            formal: {
              name: 'Formal & Corporate',
              prompt: `Create a highly formal, corporate-style outreach email. Use business jargon, formal language, and structure it like a professional business proposal. Reference industry standards and best practices. Be ultra-professional. 250 words max.

Business: {name}, Type: {business_type}, Location: {address}, Website: {website}, Screenshot: {screenshot_url}

Return ONLY JSON:
{
  "email_body": "Formal, corporate email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Formal subject line"
}`
            },
            direct: {
              name: 'Direct & Brief',
              prompt: `Create a super direct, to-the-point email. No fluff, just facts. List the problems, explain the impact, offer help. Maximum 150 words. Be respectful but blunt.

Business: {name}, Type: {business_type}, Location: {address}, Website: {website}, Screenshot: {screenshot_url}

Return ONLY JSON:
{
  "email_body": "Direct, brief email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Direct subject line"
}`
            },
            valueFirst: {
              name: 'Value-Focused',
              prompt: `Create an email that leads with value. Start by offering something free (audit, tips, insights) before mentioning any problems. Focus on what they'll gain, not what they're missing. Emphasize ROI and business growth. 200-250 words.

Business: {name}, Type: {business_type}, Location: {address}, Website: {website}, Screenshot: {screenshot_url}

Return ONLY JSON:
{
  "email_body": "Value-focused email text",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Value-focused subject line"
}`
            }
          }
        }
      });
    }

    const response = await fetch(blobs[0].url);
    const settings = await response.json();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
