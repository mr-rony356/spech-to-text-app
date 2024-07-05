import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface TranscriptionResponse {
  id: string;
  status: string;
  text?: string;
  audio_url?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 });
    }

    const headers = {
      authorization: process.env.ASSEMBLYAI_API_KEY as string,
    };

    const config = {
      audio_url: audioUrl,
    };

    const baseUrl = 'https://api.assemblyai.com/v2';
    const transcriptResponse = await axios.post(`${baseUrl}/transcript`, config, {
      headers,
    });

    const transcriptId = transcriptResponse.data.id;

    let transcription: TranscriptionResponse = { status: 'queued', id: transcriptId };
    while (transcription.status !== 'completed' && transcription.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const transcriptionResponse = await axios.get(`${baseUrl}/transcript/${transcriptId}`, {
        headers,
      });
      transcription = transcriptionResponse.data;
    }

    if (transcription.status === 'failed') {
      throw new Error('Transcription failed');
    }

    return NextResponse.json({ 
      success: true,
      text: transcription.text,
      id: transcription.id,
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}