// app/api/initiate-speech/route.ts

import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    const { voiceId, text } = await request.json();

    if (!voiceId || !text) {
      return NextResponse.json({ error: "Missing voiceId or text" }, { status: 400 });
    }

    const response = await fetch("https://api.play.ht/api/v2/tts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
      },
      body: JSON.stringify({
        text: text,
        voice: voiceId,
        voice_engine: 'PlayHT2.0',
        quality: 'premium',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PlayHT API Error:", errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json({ taskId: data.transcriptionId });
  } catch (error) {
    console.error("Error in initiating text-to-speech:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}