import { NextResponse } from 'next/server';
import { put, list, head } from '@vercel/blob';

// Save search results with city metadata
export async function POST(req) {
  try {
    const { businesses, city, searchId } = await req.json();

    if (!businesses || !searchId) {
      return NextResponse.json({ error: 'Businesses and searchId are required' }, { status: 400 });
    }

    const searchData = {
      businesses,
      city,
      timestamp: new Date().toISOString(),
      searchId
    };

    const blob = await put(`searches/${searchId}.json`, JSON.stringify(searchData), {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url, searchId });
  } catch (error) {
    console.error('Data save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get search history with all businesses from all cities
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const { blobs } = await list({ prefix: 'searches/' });

    // Fetch all search data
    const historyData = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return data;
        } catch (e) {
          console.error('Error fetching blob:', e);
          return null;
        }
      })
    );

    const validHistory = historyData.filter(h => h !== null);

    // Filter by city if specified
    const filtered = city
      ? validHistory.filter(h => h.city?.toLowerCase() === city.toLowerCase())
      : validHistory;

    return NextResponse.json({ history: filtered });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
