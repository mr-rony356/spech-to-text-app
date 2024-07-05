import { NextRequest, NextResponse } from 'next/server';
import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises'; // Use the promises API for async/await
import axios from 'axios';

const baseUrl = 'https://api.assemblyai.com/v2';
const headers = {
  authorization: process.env.ASSEMBLYAI_API_KEY as string,
};

interface TranscriptionResponse {
  id: string;
  status: string;
  text?: string; // Mark as optional since it may not exist initially
  audio_url?: string; // Mark as optional since it may not exist initially
}

export const POST = async (req: NextRequest) => {
  try {
    const { filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const audioPath = path.resolve('public', 'uploads', filename);

    // Read the audio file
    const audioData = await fs.readFile(audioPath);

    // Upload the audio file to AssemblyAI
    const uploadResponse = await axios.post(`${baseUrl}/upload`, audioData, {
      headers: {
        ...headers,
        'Content-Type': 'application/octet-stream',
      },
    });

    const uploadUrl = uploadResponse.data.upload_url;

    // Configure the transcription request
    const config = {
      audio_url: uploadUrl,
    };

    // Request the transcription
    const transcriptResponse = await axios.post(`${baseUrl}/transcript`, config, {
      headers,
    });

    const transcriptId = transcriptResponse.data.id;

    // Poll the API to get the transcription result
    let transcription: TranscriptionResponse = { status: 'queued', id: transcriptId };
    while (transcription.status !== 'completed' && transcription.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      const transcriptionResponse = await axios.get(`${baseUrl}/transcript/${transcriptId}`, {
        headers,
      });
      transcription = transcriptionResponse.data;
    }

    if (transcription.status === 'failed') {
      throw new Error('Transcription failed');
    }

    return NextResponse.json({ text: transcription.text ,id:transcription.id,audio_url:transcription.audio_url}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
