import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

// Save or update lead tracking data
export async function POST(req) {
  try {
    const { leadData } = await req.json();

    if (!leadData || !leadData.businessId) {
      return NextResponse.json({ error: 'leadData with businessId is required' }, { status: 400 });
    }

    const lead = {
      ...leadData,
      updatedAt: new Date().toISOString()
    };

    const blob = await put(`leads/${leadData.businessId}.json`, JSON.stringify(lead), {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Lead save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get all leads
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'leads/' });

    const leadsData = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return data;
        } catch (e) {
          console.error('Error fetching lead:', e);
          return null;
        }
      })
    );

    const validLeads = leadsData.filter(l => l !== null);

    return NextResponse.json({ leads: validLeads });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
