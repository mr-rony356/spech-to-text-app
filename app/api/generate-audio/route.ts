import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { text, voiceId } = await req.json();

  try {
    const response = await fetch('https://api.play.ht/api/v2/tts', {
      method: 'POST',
      headers: {
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: voiceId,
        output_format: 'mp3',
        voice_engine: 'PlayHT2.0'
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      jobId: data.id,
      status: 'processing',
      createdAt: data.created,
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}