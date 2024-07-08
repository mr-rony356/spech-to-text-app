import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.play.ht/api/v2/cloned-voices';
  const options : RequestInit = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${process.env.PLAYHT_API_SECRET_KEY}`,
      'X-User-ID': process.env.PLAYHT_USER_ID as string,
    },
    cache: 'no-cache',  // Ensures fetch request bypasses client-side caching
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const res = NextResponse.json(data);

    // Set cache-control headers to prevent caching of the response
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    res.headers.set('Surrogate-Control', 'no-store');

    return res;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}
