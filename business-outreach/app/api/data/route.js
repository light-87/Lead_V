import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

// Save search results
export async function POST(req) {
  try {
    const { businesses, searchId } = await req.json();

    if (!businesses || !searchId) {
      return NextResponse.json({ error: 'Businesses and searchId are required' }, { status: 400 });
    }

    const blob = await put(`searches/${searchId}.json`, JSON.stringify(businesses), {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Data save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get search history
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'searches/' });
    return NextResponse.json({ history: blobs });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
