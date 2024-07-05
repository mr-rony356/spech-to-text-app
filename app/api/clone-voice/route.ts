import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(request: Request) {
  try {
    const { audio_url} = await request.json();

    // Create a FormData instance
    const form = new FormData();
    form.append('sample_file_url',audio_url);
    form.append('voice_name', 'Cloned Voice');

    const response = await fetch('https://api.play.ht/api/v2/cloned-voices/instant/', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string, // Replace with your actual API Secret Key
        'X-USER-ID': process.env.PLAYHT_USER_ID as string, // Replace with your actual User ID
      },
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PlayHT API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error('Error in voice cloning:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
