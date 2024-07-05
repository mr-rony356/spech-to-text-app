import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const { voice_id } = await request.json();

  if (!voice_id) {
    return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 });
  }

  const url = 'https://api.play.ht/api/v2/cloned-voices/';
  const options = {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.PLAYHT_API_SECRET_KEY}`,
      'X-User-ID': process.env.PLAYHT_USER_ID as string,
    },
    body: JSON.stringify({ voice_id })
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
    return NextResponse.json({ error: 'Failed to delete voice' }, { status: 500 });
  }
}