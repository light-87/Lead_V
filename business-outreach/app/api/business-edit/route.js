import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

// Save business edits and notes
export async function POST(req) {
  try {
    const { businessId, edits } = await req.json();

    if (!businessId || !edits) {
      return NextResponse.json({ error: 'businessId and edits are required' }, { status: 400 });
    }

    const editData = {
      ...edits,
      businessId,
      updatedAt: new Date().toISOString()
    };

    const blob = await put(`business-edits/${businessId}.json`, JSON.stringify(editData), {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Business edit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get business edits
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `business-edits/${businessId}.json` });

    if (blobs.length === 0) {
      return NextResponse.json({ edits: null });
    }

    const response = await fetch(blobs[0].url);
    const edits = await response.json();

    return NextResponse.json({ edits });
  } catch (error) {
    console.error('Fetch edit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
