import { NextResponse } from 'next/server';
import { put, list, head, del } from '@vercel/blob';

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

// Delete search history by searchId
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get('searchId');

    if (!searchId) {
      return NextResponse.json({ error: 'searchId is required' }, { status: 400 });
    }

    // List all blobs with the searches prefix to find the one to delete
    const { blobs } = await list({ prefix: 'searches/' });

    // Find the blob that matches our searchId
    const blobToDelete = blobs.find(blob => blob.pathname === `searches/${searchId}.json`);

    if (blobToDelete) {
      await del(blobToDelete.url);
      return NextResponse.json({ success: true, message: 'Search history deleted' });
    } else {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Data delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
