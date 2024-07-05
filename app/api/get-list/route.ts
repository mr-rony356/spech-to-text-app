import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.play.ht/api/v2/cloned-voices';
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${process.env.PLAYHT_API_SECRET_KEY}`,
      'X-User-ID': process.env.PLAYHT_USER_ID as string,
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}